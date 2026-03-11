"""LangChain callback handler for capturing LLM stream timing metrics."""

import logging
import time

from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.outputs import LLMResult

logger = logging.getLogger(__name__)


class StreamTimingCallback(BaseCallbackHandler):
    """Captures wall-clock timing for LLM streaming calls.

    Metrics captured:
    - t_start_ms: when on_llm_start fires
    - t_first_token_ms: when the first on_llm_new_token fires
    - t_end_ms: when on_llm_end fires
    """

    def __init__(self) -> None:
        super().__init__()
        self.t_start_ms: float | None = None
        self.t_first_token_ms: float | None = None
        self.t_end_ms: float | None = None
        self._token_count: int = 0

    def on_llm_start(self, serialized, prompts, **kwargs) -> None:
        self.t_start_ms = time.time() * 1000
        logger.debug("StreamTimingCallback: LLM start at %.2f ms", self.t_start_ms)

    def on_llm_new_token(self, token: str, **kwargs) -> None:
        self._token_count += 1
        if self._token_count == 1:
            self.t_first_token_ms = time.time() * 1000
            logger.debug(
                "StreamTimingCallback: First token at %.2f ms (TTFB=%.2f ms)",
                self.t_first_token_ms,
                self.ttfb_ms,
            )

    def on_llm_end(self, response: LLMResult, **kwargs) -> None:
        self.t_end_ms = time.time() * 1000
        logger.debug(
            "StreamTimingCallback: LLM end at %.2f ms (duration=%.2f ms, tokens=%d)",
            self.t_end_ms,
            self.duration_ms,
            self._token_count,
        )

    @property
    def ttfb_ms(self) -> float:
        """Time to first byte in milliseconds."""
        if self.t_first_token_ms is not None and self.t_start_ms is not None:
            return round(self.t_first_token_ms - self.t_start_ms, 2)
        return 0.0

    @property
    def duration_ms(self) -> float:
        """Total streaming duration in milliseconds."""
        if self.t_end_ms is not None and self.t_start_ms is not None:
            return round(self.t_end_ms - self.t_start_ms, 2)
        return 0.0

    @property
    def token_count(self) -> int:
        return self._token_count
