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
The weighted rating **always** adjusts toward the median to dampen outlier effects:

**Formula:** `weighted = raw × (1 - w) + median × w`

Where `w = (1 - consensus%) × 0.75`

**How it works:**
- **Low consensus** (outliers present): Weights up to **75%** toward median
  - Example: 22% consensus → 58% weight toward median
  - Heavily dampens the outlier's effect on the average

- **High consensus** (everyone agrees): Minimal weighting
  - Example: 94% consensus → 4.5% weight toward median
  - Raw and weighted are nearly identical

- **Key insight**: When consensus is low due to ONE outlier, the weighted score moves toward what most people rated (the median), not toward the middle of the scale

## Visual Display

### Three Metrics Shown:
1. **Raw Rating** (large green number): Simple average of all scores
2. **Consensus Meter** (colored bar):
   - **Green** (≥70%): High agreement
   - **Yellow** (40-69%): Medium agreement
   - **Red** (<40%): Low agreement
3. **Weighted Rating** (orange number): Consensus-adjusted score

## Example Scenarios

### Moonfall - One Low Outlier (Fixed!)
```
Ratings: 4.5, 4.0, 4.8, 0.5 (outlier!), 3.9
Raw: 3.54/5 (dragged down by 0.5)
Median: 4.0/5 (what most people think)
Consensus: 22% (red bar - low due to outlier)
Weighted: 3.81/5 (moved UP toward median, dampening outlier)
```
**Interpretation**: One person hated it, but 4/5 people rated 3.9-4.8. Weighted score trusts the majority.

### Medium Consensus with One Outlier
```
Ratings: 4.5, 4.4, 4.6, 2.0 (outlier)
Raw: 3.88/5 (pulled down by outlier)
Median: 4.45/5 (what most people think)
Consensus: 46% (yellow bar)
Weighted: 4.11/5 (moved UP toward median)
```
**Interpretation**: One person disagreed, weighted rating dampens their outlier vote.

### Perfect Agreement
```
Ratings: 4.5, 4.3, 4.4, 4.6
Raw: 4.45/5
Median: 4.45/5
Consensus: 94% (green bar)
Weighted: 4.45/5 (virtually no adjustment)
```
**Interpretation**: Everyone loved it, rating is highly reliable.

### True Disagreement (Not Outliers)
```
Ratings: 5.0, 2.0, 4.0, 1.5
Raw: 3.13/5
Median: 3.00/5
Consensus: 28% (red bar)
Weighted: 3.06/5 (slight move toward median)
```
**Interpretation**: Major disagreement across the board, rating has low reliability.

### Universally Disliked (High Consensus)
```
Ratings: 1.0, 1.2, 0.8, 1.1
Raw: 1.03/5
Median: 1.05/5
Consensus: 92% (green bar)
Weighted: 1.03/5 (minimal adjustment)
```
**Interpretation**: Everyone hated it, low score is reliable.

## Technical Details

**Formula Components:**
- Standard Deviation: `sqrt(Σ(xi - mean)² / n)`
- Median: Middle value when ratings are sorted
- Consensus Score: `round((1 - min(stdDev/2.0, 1.0)) × 100)`

**Weighted Rating Formula:**
```
weight = (1 - consensus/100) × 0.75
weighted = raw × (1 - weight) + median × weight
```

**Examples:**
- 22% consensus → weight = 0.585 (58.5% toward median)
- 46% consensus → weight = 0.405 (40.5% toward median)
- 94% consensus → weight = 0.045 (4.5% toward median)

**Files Modified:**
- `movieboys-rating.js`: Calculation logic
- `styles.css`: Visual styling
- Updates applied to all 177 movies automatically

## Color Coding Guide
- **Green Bar (≥70%)**: Trust this rating!
- **Yellow Bar (40-69%)**: Rating is somewhat reliable
- **Red Bar (<40%)**: Take this rating with a grain of salt
