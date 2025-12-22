# Movie Boys Consensus Meter Guide

## Overview
The consensus meter measures how much the Movie Boys agree on a movie's rating. It combines statistical analysis with visual indicators to show rating reliability.

## How It Works

### 1. **Standard Deviation Calculation**
The consensus is based on the standard deviation of individual ratings:
- **Low standard deviation** = High consensus (everyone agrees)
- **High standard deviation** = Low consensus (wide disagreement)

### 2. **Consensus Score (0-100%)**
The consensus score is calculated using:
```
Consensus = 100% × (1 - stdDev / maxStdDev)
```
Where `maxStdDev = 2.0` for the 0-5 rating scale.

**Example calculations:**
- Ratings: [3.0, 3.1, 3.2, 3.0] → Std Dev: 0.09 → **Consensus: 95%** (High agreement)
- Ratings: [5.0, 4.3, 4.3, 5.0] → Std Dev: 0.40 → **Consensus: 80%** (Good agreement)
- Ratings: [2.0, 1.0, 1.2, 2.0] → Std Dev: 0.48 → **Consensus: 76%** (Good agreement)
- Ratings: [3.5, 4.7, 3.5, 1.5] → Std Dev: 1.25 → **Consensus: 37%** (Low agreement)

### 3. **Weighted Rating**
The weighted rating adjusts for outliers and uncertainty based on consensus:

**High Consensus (≥70%):**
- Weights 58-70% toward the **median** rating
- Dampens outlier effect (one very high or low score doesn't skew the average)
- If most people agree but one person rated differently, weighted moves toward the group

**Medium Consensus (40-69%):**
- Weights 8-14% toward median
- Slight adjustment to reduce outlier impact

**Low Consensus (<40%):**
- Weights 9-15% toward middle (2.5/5) as uncertainty penalty
- When the group can't agree, rating reliability decreases

## Visual Display

### Three Metrics Shown:
1. **Raw Rating** (large green number): Simple average of all scores
2. **Consensus Meter** (colored bar):
   - **Green** (≥70%): High agreement
   - **Yellow** (40-69%): Medium agreement
   - **Red** (<40%): Low agreement
3. **Weighted Rating** (orange number): Consensus-adjusted score

## Example Scenarios

### High Consensus with One Outlier (Dampened)
```
Ratings: Tyler 4.5, Alex 4.4, Trevor 4.6, Jordan 2.0 (outlier)
Raw: 3.88/5 (pulled down by outlier)
Median: 4.45/5 (what most people think)
Consensus: 73% (green bar)
Weighted: 4.26/5 (moved UP toward median, dampening outlier)
```
**Interpretation**: One person disagreed, but weighted rating trusts the group consensus.

### Perfect Agreement
```
Ratings: Tyler 4.5, Alex 4.3, Trevor 4.4, Jordan 4.6
Raw: 4.45/5
Median: 4.45/5
Consensus: 93% (green bar)
Weighted: 4.45/5 (minimal adjustment)
```
**Interpretation**: Everyone loved it, rating is highly reliable.

### Low Consensus - Penalty Applied
```
Ratings: Tyler 5.0, Alex 2.0, Trevor 4.0, Jordan 1.5
Raw: 3.13/5
Median: 3.00/5
Consensus: 28% (red bar)
Weighted: 3.06/5 (pulled toward 2.5 as penalty)
```
**Interpretation**: Major disagreement, rating reliability is low.

### Universally Disliked (High Consensus)
```
Ratings: Tyler 1.0, Alex 1.2, Trevor 0.8, Jordan 1.1
Raw: 1.03/5
Median: 1.05/5
Consensus: 90% (green bar)
Weighted: 1.04/5 (minimal adjustment)
```
**Interpretation**: Everyone hated it, low score is reliable.

## Technical Details

**Formula Components:**
- Standard Deviation: `sqrt(Σ(xi - mean)² / n)`
- Median: Middle value when ratings are sorted
- Consensus Score: `round((1 - min(stdDev/2.0, 1.0)) × 100)`

**Weighted Rating Formula:**
- **High Consensus (≥70%)**: `raw × (1 - w) + median × w` where `w = 0.58 to 0.7`
- **Medium Consensus (40-69%)**: `raw × (1 - w) + median × w` where `w = 0.08 to 0.14`
- **Low Consensus (<40%)**: `raw × (1 - w) + 2.5 × w` where `w = 0.09 to 0.15`

**Files Modified:**
- `movieboys-rating.js`: Calculation logic
- `styles.css`: Visual styling
- Updates applied to all 177 movies automatically

## Color Coding Guide
- **Green Bar (≥70%)**: Trust this rating!
- **Yellow Bar (40-69%)**: Rating is somewhat reliable
- **Red Bar (<40%)**: Take this rating with a grain of salt
