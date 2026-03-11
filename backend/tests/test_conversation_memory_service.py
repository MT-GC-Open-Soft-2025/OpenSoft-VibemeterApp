"""Tests for src.services.conversation_memory_service."""

from datetime import datetime
from unittest.mock import MagicMock

from src.services.conversation_memory_service import (
    FOLD_THRESHOLD,
    MEMORY_WINDOW_TURNS,
    build_langchain_messages,
    detect_sentiment,
    detect_topic,
    should_fold,
    update_chat_memory,
)

# ---------------------------------------------------------------------------
# detect_topic
# ---------------------------------------------------------------------------


class TestDetectTopic:
    def test_detect_topic_leave(self):
        """'I need PTO' should map to 'leave'."""
        assert detect_topic("I need PTO") == "leave"

    def test_detect_topic_leave_variants(self):
        assert detect_topic("I want to take a sick day") == "leave"
        assert detect_topic("Can I get vacation days?") == "leave"
        assert detect_topic("I need time off next week") == "leave"

    def test_detect_topic_performance(self):
        """'performance review' should map to 'performance'."""
        assert detect_topic("I have a performance review coming up") == "performance"

    def test_detect_topic_performance_variants(self):
        assert detect_topic("my appraisal is due") == "performance"
        assert detect_topic("I need help with my KPI goals") == "performance"

    def test_detect_topic_rewards(self):
        assert detect_topic("I want to redeem my reward points") == "rewards"
        assert detect_topic("I received an award this month") == "rewards"

    def test_detect_topic_workload(self):
        assert detect_topic("I am feeling burnout from overtime") == "workload"
        assert detect_topic("my stress levels are through the roof") == "workload"

    def test_detect_topic_onboarding(self):
        assert detect_topic("I just joined and need onboarding help") == "onboarding"

    def test_detect_topic_none(self):
        """'hello' should return None."""
        assert detect_topic("hello") is None
        assert detect_topic("how are you?") is None
        assert detect_topic("") is None


# ---------------------------------------------------------------------------
# detect_sentiment
# ---------------------------------------------------------------------------


class TestDetectSentiment:
    def test_detect_sentiment_positive(self):
        """'I'm happy' should return 'positive'."""
        assert detect_sentiment("I'm happy today") == "positive"

    def test_detect_sentiment_positive_variants(self):
        assert detect_sentiment("This is amazing!") == "positive"
        assert detect_sentiment("I love working here") == "positive"

    def test_detect_sentiment_negative(self):
        """'I'm stressed' should return 'negative'."""
        assert detect_sentiment("I'm really stressed about this") == "negative"

    def test_detect_sentiment_negative_variants(self):
        assert detect_sentiment("I feel overwhelmed") == "negative"
        assert detect_sentiment("This is so difficult") == "negative"
        assert detect_sentiment("I'm very worried") == "negative"

    def test_detect_sentiment_neutral(self):
        assert detect_sentiment("I'm fine I guess") == "neutral"
        assert detect_sentiment("Things are okay") == "neutral"

    def test_detect_sentiment_none(self):
        assert detect_sentiment("Can you help me?") is None
        assert detect_sentiment("Tell me about the policy") is None


# ---------------------------------------------------------------------------
# should_fold
# ---------------------------------------------------------------------------


class TestShouldFold:
    def _make_messages(self, count: int) -> list:
        from src.models.chats import Message

        return [
            Message(sender="user", timestamp=datetime.now(), message=f"msg {i}")
            for i in range(count)
        ]

    def test_should_fold_false_empty(self):
        """Empty message list should not fold."""
        assert should_fold([]) is False

    def test_should_fold_false_few_messages(self):
        """Few messages (≤ FOLD_THRESHOLD) should not fold."""
        msgs = self._make_messages(FOLD_THRESHOLD)
        assert should_fold(msgs) is False

    def test_should_fold_true(self):
        """More than FOLD_THRESHOLD messages should fold."""
        msgs = self._make_messages(FOLD_THRESHOLD + 1)
        assert should_fold(msgs) is True

    def test_should_fold_true_many_messages(self):
        msgs = self._make_messages(FOLD_THRESHOLD + 10)
        assert should_fold(msgs) is True


# ---------------------------------------------------------------------------
# update_chat_memory
# ---------------------------------------------------------------------------


def _make_chat(messages=None, active_topic=None, resolved_topics=None, turn_count=0) -> MagicMock:
    """Build a minimal chat mock with memory fields."""
    chat = MagicMock()
    chat.messages = messages or []
    chat.active_topic = active_topic
    chat.resolved_topics = resolved_topics or []
    chat.turn_count = turn_count
    chat.last_sentiment = None
    chat.folded_summary = ""
    chat.initial_prompt = "You are a wellness bot."
    return chat


class TestUpdateChatMemory:
    def test_updates_topic(self):
        """update_chat_memory sets active_topic when keyword detected."""
        chat = _make_chat()
        update_chat_memory(chat, "I want to take some PTO")
        assert chat.active_topic == "leave"

    def test_no_topic_change_when_no_keyword(self):
        """Topic stays None if no keyword detected."""
        chat = _make_chat()
        update_chat_memory(chat, "How are you?")
        assert chat.active_topic is None

    def test_increments_turn_count(self):
        """update_chat_memory increments turn_count by 1."""
        chat = _make_chat(turn_count=5)
        update_chat_memory(chat, "Hello")
        assert chat.turn_count == 6

    def test_turn_count_starts_at_zero(self):
        chat = _make_chat(turn_count=0)
        update_chat_memory(chat, "Hello")
        assert chat.turn_count == 1

    def test_tracks_resolved_topics(self):
        """When topic shifts, old topic is moved to resolved_topics."""
        chat = _make_chat(active_topic="leave")
        update_chat_memory(chat, "I need help with my performance review")
        assert "leave" in chat.resolved_topics
        assert chat.active_topic == "performance"

    def test_does_not_duplicate_resolved_topics(self):
        """Already-resolved topic is not duplicated."""
        chat = _make_chat(active_topic="leave", resolved_topics=["leave"])
        update_chat_memory(chat, "I need help with my performance review")
        assert chat.resolved_topics.count("leave") == 1

    def test_updates_sentiment(self):
        """update_chat_memory sets last_sentiment when keyword detected."""
        chat = _make_chat()
        update_chat_memory(chat, "I feel really stressed today")
        assert chat.last_sentiment == "negative"

    def test_updates_positive_sentiment(self):
        chat = _make_chat()
        update_chat_memory(chat, "I am so happy!")
        assert chat.last_sentiment == "positive"

    def test_no_sentiment_change_when_no_keyword(self):
        chat = _make_chat()
        chat.last_sentiment = "positive"
        update_chat_memory(chat, "Can you help me with something?")
        assert chat.last_sentiment == "positive"


# ---------------------------------------------------------------------------
# build_langchain_messages
# ---------------------------------------------------------------------------


def _make_real_chat(
    messages=None, active_topic=None, resolved_topics=None, folded_summary=""
) -> MagicMock:
    from src.models.chats import Message

    chat = MagicMock()
    chat.initial_prompt = "You are a wellness bot."
    chat.folded_summary = folded_summary
    chat.active_topic = active_topic
    chat.resolved_topics = resolved_topics or []
    raw_messages = messages or [
        Message(sender="user", timestamp=datetime.now(), message="Hello"),
        Message(sender="bot", timestamp=datetime.now(), message="Hi there!"),
    ]
    chat.messages = raw_messages
    return chat


class TestBuildLangchainMessages:
    def test_basic_returns_system_and_conversation(self):
        """build_langchain_messages returns SystemMessage + conversation messages."""
        from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

        chat = _make_real_chat()
        result = build_langchain_messages(chat)

        assert len(result) >= 1
        assert isinstance(result[0], SystemMessage)
        assert result[0].content == "You are a wellness bot."

        # User and bot messages should be included
        human_msgs = [m for m in result if isinstance(m, HumanMessage)]
        ai_msgs = [m for m in result if isinstance(m, AIMessage)]
        assert len(human_msgs) >= 1
        assert len(ai_msgs) >= 1

    def test_with_fold_summary(self):
        """build_langchain_messages includes folded_summary as a SystemMessage."""
        from langchain_core.messages import SystemMessage

        chat = _make_real_chat(folded_summary="Employee was discussing workload issues.")
        result = build_langchain_messages(chat)

        system_msgs = [m for m in result if isinstance(m, SystemMessage)]
        contents = [m.content for m in system_msgs]
        assert any("Earlier conversation summary" in c for c in contents)
        assert any("Employee was discussing workload issues." in c for c in contents)

    def test_with_active_topic(self):
        """build_langchain_messages includes topic context as a SystemMessage."""
        from langchain_core.messages import SystemMessage

        chat = _make_real_chat(active_topic="performance")
        result = build_langchain_messages(chat)

        system_msgs = [m for m in result if isinstance(m, SystemMessage)]
        contents = " ".join(m.content for m in system_msgs)
        assert "performance" in contents

    def test_with_resolved_topics(self):
        """build_langchain_messages includes resolved_topics in context."""
        from langchain_core.messages import SystemMessage

        chat = _make_real_chat(active_topic="rewards", resolved_topics=["leave", "performance"])
        result = build_langchain_messages(chat)

        system_msgs = [m for m in result if isinstance(m, SystemMessage)]
        contents = " ".join(m.content for m in system_msgs)
        assert "leave" in contents
        assert "performance" in contents

    def test_no_fold_summary_excluded(self):
        """When folded_summary is empty, no summary SystemMessage is added."""
        from langchain_core.messages import SystemMessage

        chat = _make_real_chat(folded_summary="")
        result = build_langchain_messages(chat)

        system_msgs = [m for m in result if isinstance(m, SystemMessage)]
        contents = " ".join(m.content for m in system_msgs)
        assert "Earlier conversation summary" not in contents

    def test_windowing_keeps_recent_turns(self):
        """build_langchain_messages only keeps MEMORY_WINDOW_TURNS * 2 messages."""
        from src.models.chats import Message

        # Create many messages (more than the window)
        many_messages = [
            Message(
                sender="user" if i % 2 == 0 else "bot",
                timestamp=datetime.now(),
                message=f"message {i}",
            )
            for i in range(30)
        ]
        chat = _make_real_chat(messages=many_messages)
        result = build_langchain_messages(chat)

        from langchain_core.messages import AIMessage, HumanMessage

        conv_msgs = [m for m in result if isinstance(m, HumanMessage | AIMessage)]
        assert len(conv_msgs) <= MEMORY_WINDOW_TURNS * 2
