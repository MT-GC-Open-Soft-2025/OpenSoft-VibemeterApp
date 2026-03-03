"""Tests for src.services.prompts."""

from src.services.prompts import (
    build_prompt_happy,
    build_prompt_neutral,
    build_prompt_sad,
    build_prompt_unknown,
)


def test_build_prompt_sad_includes_emp_id_and_score():
    """build_prompt_sad includes employee ID and emotion score."""
    prompt = build_prompt_sad(
        "emp001",
        2.0,
        "leaves, performance",
        total_work_hours=8,
        leave_days=5,
        types_of_leaves={"sick": 2},
        feedback=4.0,
        weighted_performance=85,
        reward_points=100,
        award_list=["Star"],
    )
    assert "emp001" in prompt
    assert "2.0" in prompt
    assert "sad" in prompt.lower()
    assert "leaves, performance" in prompt
    assert "Vibey" in prompt


def test_build_prompt_happy_includes_emp_id_and_score():
    """build_prompt_happy includes employee ID and emotion score."""
    prompt = build_prompt_happy(
        "emp002",
        4.5,
        "rewards",
        total_work_hours=8,
        leave_days=3,
        types_of_leaves={},
        feedback=4.5,
        weighted_performance=90,
        reward_points=200,
        award_list=[],
    )
    assert "emp002" in prompt
    assert "4.5" in prompt
    assert "happy" in prompt.lower()
    assert "Vibey" in prompt


def test_build_prompt_neutral_includes_emp_id_and_score():
    """build_prompt_neutral includes employee ID and emotion score."""
    prompt = build_prompt_neutral(
        "emp003",
        3.0,
        "performance, leaves",
        total_work_hours=8.5,
        leave_days=4,
        types_of_leaves={"casual": 2},
        feedback=4.2,
        weighted_performance=80,
        reward_points=50,
        award_list=None,
    )
    assert "emp003" in prompt
    assert "3.0" in prompt
    assert "neutral" in prompt.lower()
    assert "Vibey" in prompt


def test_build_prompt_unknown_includes_emp_id():
    """build_prompt_unknown includes employee ID, no vibe score."""
    prompt = build_prompt_unknown(
        "emp004",
        "leaves",
        total_work_hours=8,
        leave_days=5,
        types_of_leaves={},
        feedback=None,
        weighted_performance=None,
        reward_points=0,
        award_list=[],
    )
    assert "emp004" in prompt
    assert "no known vibe score" in prompt.lower() or "vibe score" in prompt.lower()
    assert "Vibey" in prompt


def test_all_prompts_include_common_rules():
    """All prompts include formal language guidance."""
    data = dict(
        total_work_hours=8,
        leave_days=5,
        types_of_leaves={},
        feedback=4.0,
        weighted_performance=85,
        reward_points=100,
        award_list=[],
    )
    for builder in [build_prompt_sad, build_prompt_happy, build_prompt_neutral]:
        prompt = builder("emp001", 3.0, "factors", **data)
        assert "formal" in prompt.lower()
        assert "100 words" in prompt or "100 word" in prompt
