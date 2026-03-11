"""Conversation memory management for WellBee chat.

Strategy
--------
- Keyword-based topic and sentiment detection (fast, no LLM needed per message).
- After FOLD_THRESHOLD messages, older messages are compressed into ``folded_summary``
  using an LLM call (async, happens in the persist step after response delivery).
- ``build_langchain_messages`` builds a structured LangChain message list for the LLM:
    [SystemMessage(initial_prompt)]
    [SystemMessage(folded_summary)]  # if available
    [SystemMessage(topic context)]   # if active_topic set
    [HumanMessage / AIMessage ...]   # last MEMORY_WINDOW_TURNS turns
"""

import logging

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from src.models.chats import Chat, Message

logger = logging.getLogger(__name__)

# Number of recent turns (user + bot pair) to keep verbatim.
MEMORY_WINDOW_TURNS = 4

# Minimum messages before we fold older ones into a summary.
FOLD_THRESHOLD = 10

# Keyword → topic mapping (first match wins).
_TOPIC_KEYWORDS: dict[str, list[str]] = {
    "leave": ["leave", "pto", "vacation", "sick day", "time off", "day off", "days off", "holiday"],
    "performance": ["performance", "review", "rating", "appraisal", "kpi", "goal", "evaluation"],
    "rewards": ["reward", "points", "award", "recognition", "bonus", "achievement", "prize"],
    "workload": [
        "hours",
        "overtime",
        "workload",
        "burnout",
        "stress",
        "overworked",
        "too much work",
    ],
    "onboarding": ["onboarding", "training", "new hire", "orientation", "joining", "new to"],
}

_SENTIMENT_KEYWORDS: dict[str, list[str]] = {
    "positive": [
        "happy",
        "great",
        "excellent",
        "wonderful",
        "excited",
        "love",
        "enjoy",
        "thrilled",
        "amazing",
    ],
    "negative": [
        "sad",
        "unhappy",
        "stressed",
        "worried",
        "anxious",
        "tired",
        "frustrated",
        "overwhelmed",
        "hate",
        "difficult",
    ],
    "neutral": ["okay", "fine", "alright", "normal", "so-so"],
}


def detect_topic(message: str) -> str | None:
    """Return the most likely topic from a message, or None if no match."""
    lower = message.lower()
    for topic, keywords in _TOPIC_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            return topic
    return None


def detect_sentiment(message: str) -> str | None:
    """Return rough sentiment classification from message text."""
    lower = message.lower()
    for sentiment, keywords in _SENTIMENT_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            return sentiment
    return None


def should_fold(messages: list[Message]) -> bool:
    """Return True when the message list is long enough to benefit from folding."""
    return len(messages) > FOLD_THRESHOLD


def _get_recent_window(
    messages: list[Message], window_turns: int = MEMORY_WINDOW_TURNS
) -> list[Message]:
    """Return the last ``window_turns`` complete turns (user + bot pairs)."""
    keep = window_turns * 2
    return messages[-keep:] if len(messages) > keep else messages


def update_chat_memory(chat_record: Chat, new_user_message: str) -> None:
    """Update topic, sentiment, and turn count on the chat record in-place.

    Call this AFTER appending the user message to ``chat_record.messages`` but
    BEFORE building the continuation prompt or persisting to DB.
    The ``folded_summary`` is updated separately in the persist step (async, LLM-based).
    """
    # Topic detection
    new_topic = detect_topic(new_user_message)
    if new_topic and new_topic != chat_record.active_topic:
        old_topic = chat_record.active_topic
        if old_topic and old_topic not in (chat_record.resolved_topics or []):
            chat_record.resolved_topics = list(chat_record.resolved_topics or []) + [old_topic]
        chat_record.active_topic = new_topic
        logger.debug("Memory: topic shifted %s → %s", old_topic, new_topic)

    # Sentiment detection
    new_sentiment = detect_sentiment(new_user_message)
    if new_sentiment:
        chat_record.last_sentiment = new_sentiment

    # Increment turn count
    chat_record.turn_count = (chat_record.turn_count or 0) + 1


async def create_fold_summary(chat_record: Chat) -> str:
    """Use LangChain LLM to summarize messages older than the memory window.

    Returns the new folded_summary string. Saves nothing — the caller persists.
    Only runs when ``should_fold(chat_record.messages)`` is True.
    """
    from src.services.ai_services import get_llm

    keep = MEMORY_WINDOW_TURNS * 2
    older_messages = chat_record.messages[:-keep] if len(chat_record.messages) > keep else []
    if not older_messages:
        return chat_record.folded_summary or ""

    # Format older messages as plain text for the summary prompt
    formatted = "\n".join(
        f"{'Employee' if m.sender == 'user' else 'Assistant'}: {m.message}" for m in older_messages
    )

    existing = chat_record.folded_summary or "None yet."
    prompt = (
        "You are helping maintain context for an employee wellness conversation. "
        "Create a concise summary (2-3 sentences) of the conversation history below, "
        "covering the main topics discussed and the employee's emotional state. "
        "Be factual and brief — this summary will be injected as context "
        "for the next AI response.\n\n"
        f"Existing summary: {existing}\n\n"
        f"New conversation history to incorporate:\n{formatted}"
    )

    try:
        llm = get_llm()
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        return response.content.strip()
    except Exception as exc:
        logger.warning("create_fold_summary: LLM call failed, keeping existing: %s", exc)
        return existing


def build_langchain_messages(chat_record: Chat) -> list:
    """Build a structured LangChain message list for the continuation LLM call.

    Structure:
    1. SystemMessage: initial employee context prompt
    2. SystemMessage: folded_summary (if available)
    3. SystemMessage: topic/resolved context (if available)
    4. HumanMessage / AIMessage: recent MEMORY_WINDOW_TURNS turns
    """
    messages: list = [SystemMessage(content=chat_record.initial_prompt)]

    if chat_record.folded_summary:
        messages.append(
            SystemMessage(content=f"[Earlier conversation summary]\n{chat_record.folded_summary}")
        )

    # Inject topic state for continuity
    topic_parts: list[str] = []
    if chat_record.active_topic:
        topic_parts.append(f"Current topic: {chat_record.active_topic}.")
    if chat_record.resolved_topics:
        topic_parts.append(f"Already covered: {', '.join(chat_record.resolved_topics)}.")
    if topic_parts:
        messages.append(SystemMessage(content=" ".join(topic_parts)))

    # Recent turns verbatim
    recent = _get_recent_window(chat_record.messages, MEMORY_WINDOW_TURNS)
    for msg in recent:
        if msg.sender == "user":
            messages.append(HumanMessage(content=msg.message))
        else:
            messages.append(AIMessage(content=msg.message))

    return messages
