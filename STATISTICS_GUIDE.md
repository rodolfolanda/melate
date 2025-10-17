# Historical Statistics - User Guide

## Overview

The **Historical Statistics** panel analyzes **REAL historical lottery data** from CSV files containing thousands of past draws. The statistics are **NOT** based on simulations - they show actual patterns from historical draws.

## Data Sources

### 6/49 Game
- **File**: `649.csv`
- **Draws**: ~3,400+ historical draws
- **Date Range**: 1982-present
- **Numbers**: 1-49

### Lotto Max
- **File**: `LOTTOMAX.csv`
- **Draws**: ~2,000+ historical draws  
- **Date Range**: 2009-present
- **Numbers**: 1-50

### BC49
- **File**: `BC49.csv`
- **Draws**: ~3,400+ historical draws
- **Date Range**: Similar to 6/49
- **Numbers**: 1-49

## When Data Loads

The historical data loads automatically:
- ✅ **On app start** - Loads 6/49 data by default
- ✅ **When switching games** - Loads that game's CSV data
- ✅ **Independent of number generation** - No need to click "Generate Numbers"

## Statistics Tabs

### 1. 📊 Frequency Tab
**What it shows**: How many times each number (1-49/50) has been drawn historically

**Example**:
- Number 7: Drawn 280 times (8.2%)
- Number 42: Drawn 260 times (7.6%)

**Use Case**: Identify which numbers appear most/least often in historical data

### 2. 🔥 Hot & Cold Tab
**What it shows**: 
- **Hot Numbers** (🔥): Top 10 most frequently drawn numbers
- **Cold Numbers** (❄️): Top 10 least frequently drawn numbers

**Color Intensity**: Darker = more/less frequent

**Interactive**: Click badges to see details (UI feedback ready for future exclusion feature)

### 3. 🎲 Odd vs Even Tab
**What it shows**: Distribution of odd vs even numbers across all historical draws

**Example**:
- Odd: 52,340 draws (51.2%)
- Even: 49,852 draws (48.8%)

**Insight**: Shows if there's a bias toward odd or even numbers

### 4. 📈 Ranges Tab
**What it shows**: How numbers distribute across ranges (1-10, 11-20, 21-30, etc.)

**Example**:
- 1-10: 18,500 occurrences (18.1%)
- 41-50: 15,200 occurrences (14.9%)

**Use Case**: Identify if certain number ranges are overrepresented

## Excluded Numbers

The system automatically excludes:
- **Top 3 most frequent** numbers (Hot numbers)
- **Bottom 3 least frequent** numbers (Cold numbers)

These are highlighted in the Frequency chart with a gray color.

**Why?** To avoid picking the same numbers everyone else picks (hot) or numbers with very low historical frequency (cold).

## How to Use

1. **Open the app** - Historical data loads automatically for 6/49
2. **Click "📈 Show Statistics"** - View the data insights panel
3. **Switch tabs** - Explore different visualizations
4. **Change games** - Select Lotto Max or BC49 to see their historical patterns
5. **Generate numbers** - The generator uses this data to inform smart picks

## Key Insights

### ✅ What the Statistics ARE:
- Real historical lottery draw data
- Frequency analysis of thousands of past draws
- Pattern identification in historical data
- Statistical distribution analysis

### ❌ What the Statistics are NOT:
- Predictions of future draws
- Guarantees of winning numbers
- Simulated or random data
- Probabilities of future outcomes

## Example Scenario

**Game**: 6/49  
**Total Historical Draws**: 3,427  
**Total Numbers Drawn**: 20,562 (3,427 × 6)

**Frequency Tab Shows**:
- Number 31: Drawn 431 times (2.1% of all draws)
- Number 40: Drawn 428 times (2.08%)
- Number 13: Drawn 390 times (1.9%)

**Hot & Cold Tab Shows**:
- Hottest: 31, 40, 33, 39, 38, 23, 43, 45, 34, 32
- Coldest: 46, 18, 12, 26, 17, 21, 9, 28, 16, 24

**Odd vs Even**:
- Odd: 10,345 (50.3%)
- Even: 10,217 (49.7%)

**Ranges**:
- 1-10: 2,134 occurrences
- 11-20: 2,087 occurrences  
- 21-30: 2,256 occurrences (highest)
- 31-40: 2,198 occurrences
- 41-49: 1,887 occurrences (lowest)

## Technical Details

**Data Processing**:
- CSV files fetched from `/public/data/`
- Parsed to extract "NUMBER DRAWN" columns
- Analyzed by 7 statistical functions in `analytics.ts`
- Rendered with Recharts visualization library

**Performance**:
- Data cached after first load
- Charts memoized to prevent re-calculation
- Responsive design for all screen sizes

**Accuracy**:
- 100% based on actual CSV data
- No artificial patterns or biases
- Updated when CSV files are updated

## Conclusion

The Historical Statistics panel gives you deep insights into actual lottery draw patterns. While past performance doesn't guarantee future results, understanding historical frequency can help you make more informed number selections.

**Remember**: Every draw is independent and random, but some players prefer to pick numbers based on historical patterns rather than pure chance.
