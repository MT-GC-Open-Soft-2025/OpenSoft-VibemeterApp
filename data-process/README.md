## This is the repository used for processing the datasets provided


##  Data Pipeline Overview

### 1. Preprocessing

- **Leave Dataset**: Total leave days & encoded leave types → averaged to generate a compact score.
- **Rewards Dataset**: Weighted reward/award points computed using exponential decay (recency bias).
- **Performance Dataset**: Encoded manager feedback, ratings, and promotion flags → combined via autoencoder.
- **Activity Dataset**: Weighted communication and attendance data using decay → aggregated per employee.

### 2. Feature Engineering - `should_chat_*`

Each dataset generates a "should_chat" score using a neural network or autoencoder to reduce dimensionality, followed by quantile-based scoring:

- **Positive score** → Employee may need attention.
- **Negative score** → No concern.
- **Zero** → Neutral zone (20th–80th percentile).

### 3. Merging & Final Output

- All scores are combined with vibe data to generate `factors_to_be_sorted`, a list of prioritized concern areas.
- Final dataset also includes:
  - Total work hours
  - Type of leaves (as a dict)
  - Aggregated feedback
  - Award history

## Example Feature: `should_chat_rewards`

```python
Score = (Q20 - X) / (Q80 - Q20) * 100  if X < Q20
Score = (Q80 - X) / (Q80 - Q20) * 100  if X > Q80
```

### Run preprocessing individually
```bash
python scripts/preprocess_leave.py
python scripts/preprocess_rewards.py
```

# Merge everything into a final CSV
```bash
python scripts/merge_datasets.py
```
