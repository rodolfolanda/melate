# Lottery Number Generator

A TypeScript-based lottery number generator that analyzes historical lottery data to generate numbers while avoiding patterns based on frequency analysis.

## 🤖 AI-Powered Development

This project was crafted with the latest AI goodies! 🚀 Developed through an epic collaboration between **GitHub Copilot** (your friendly neighborhood AI coding assistant) and **Rodolfo Landa** (the human with the brilliant ideas). 

*Fun fact: While AI can write TypeScript faster than you can say "lottery jackpot," it still can't predict winning numbers... yet! 😄*

**Powered by:**
- 🧠 Advanced AI pair programming
- ☕ Human creativity and strategic thinking  
- 🎯 Cutting-edge TypeScript best practices
- ✨ A sprinkle of algorithmic magic

*Disclaimer: No AIs were harmed in the making of this lottery generator. Copilot thoroughly enjoyed fixing all 63 linting errors!* 🎪

## Features

- **Multiple Lottery Games**: Supports Canadian 6/49, Lotto Max, and BC49
- **Historical Data Analysis**: Analyzes CSV files containing past lottery draws
- **Smart Filtering**: Excludes most/least frequent numbers based on configurable parameters
- **Uniqueness Validation**: Ensures generated numbers don't match historical patterns too closely
- **Configurable Parameters**: Customizable warm-up iterations, thresholds, and exclusion counts
- **Type-Safe**: Written in TypeScript with comprehensive type checking and ESLint validation
- **Automated Data Updates**: 🆕 Automatically downloads latest lottery data from BCLC (see [DATA_UPDATE_GUIDE.md](DATA_UPDATE_GUIDE.md))
- **CI/CD Pipeline**: Automated testing, linting, and building with GitHub Actions
- **Unit Tests**: Comprehensive test coverage with Vitest

## Prerequisites

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)

## Installation

1. **Clone or download the project**
2. **Install dependencies**:
   ```bash
   npm install
   ```

## Project Structure

```
melate/
├── src/                          # TypeScript source files
│   ├── melate.history.ts         # CSV processing utilities
│   ├── melate.numbers.ts         # Game configurations and number generation
│   ├── melate.play.ts            # Main game logic and draw generation
│   ├── melate.statistics.ts      # Statistical analysis functions
│   ├── run-649.ts               # 6/49 lottery runner
│   ├── run-BC49.ts              # BC49 lottery runner
│   └── run-lottoMax.ts          # Lotto Max runner
├── data/                         # Historical lottery data (CSV files)
│   ├── 649.csv                  # Canadian 6/49 historical data
│   ├── BC49.csv                 # BC49 historical data
│   └── LOTTOMAX.csv             # Lotto Max historical data
├── dist/                         # Compiled JavaScript files
└── package.json                  # Project configuration
```

## Usage

### 1. Build the Project

Before running, compile TypeScript to JavaScript:

```bash
npm run build
```

### 2. Run Lottery Generators

#### Canadian 6/49
```bash
node dist/run-649.js
```
**Output**: 1 set of 6 numbers (1-49)
**Configuration**: Excludes top 3 and bottom 3 frequent numbers, 1000 warm-up iterations

#### BC49 (British Columbia 49)
```bash
node dist/run-BC49.js
```
**Output**: 10 sets of 6 numbers (1-49)
**Configuration**: Excludes top 2 and bottom 2 frequent numbers, 100 warm-up iterations

#### Lotto Max
```bash
node dist/run-lottoMax.js
```
**Output**: 1 set of 7 numbers (1-50)
**Configuration**: Excludes top 3 and bottom 3 frequent numbers, 100 warm-up iterations

### 3. Update Lottery Data

Keep your CSV files up-to-date with the latest lottery results:

```bash
npm run update:data
```

This command automatically downloads the latest data from BCLC (PlayNow.com). See [DATA_UPDATE_GUIDE.md](DATA_UPDATE_GUIDE.md) for more details on automated updates.

### 4. Development Commands

#### Run Tests
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report
```

#### Lint Code
```bash
npm run lint          # Check for linting issues
npm run lint:fix      # Auto-fix linting issues
```

#### Type Checking
```bash
npm run type-check    # Check TypeScript types without compiling
```

## How It Works

### 1. **Historical Data Analysis**
- Reads CSV files containing past lottery draws
- Counts frequency of each number across all historical draws
- Identifies most and least frequently drawn numbers

### 2. **Smart Filtering**
- **excludeXTopNumbers**: Excludes the X most frequently drawn numbers
- **excludeXLastNumbers**: Excludes the X least frequently drawn numbers
- This helps avoid numbers that are either "overdue" or "too hot"

### 3. **Number Generation**
- Generates random numbers within the game's range
- Ensures no duplicates within a single draw
- Applies exclusion filters based on historical analysis

### 4. **Uniqueness Validation**
- **threshold**: Controls similarity to historical draws
- If a generated set matches too many numbers with any historical draw, it's regenerated
- **warmUp**: Number of generation attempts before returning the final result

### 5. **Algorithm Parameters**

| Parameter | Description | Example Values |
|-----------|-------------|----------------|
| `excludeXTopNumbers` | Skip X most frequent numbers | 2-3 |
| `excludeXLastNumbers` | Skip X least frequent numbers | 2-3 |
| `threshold` | Max similarity to historical draws | 2 |
| `warmUp` | Generation iterations before final result | 100-1000 |
| `howManyDraws` | Number of lottery sets to generate | 1-10 |

## Customization

### Modify Parameters

Edit the configuration in any `run-*.ts` file:

```typescript
const excludeXTopNumbers = 3;    // Skip top 3 frequent numbers
const excludeXLastNumbers = 3;   // Skip bottom 3 frequent numbers
const threshold = 2;             // Allow max 5 matches with historical draws (7-2=5)
const warmUp = 100;              // 100 generation attempts
const howManyDraws = 1;          // Generate 1 set of numbers
```

### Add New Lottery Games

1. **Add CSV data** to `data/` folder
2. **Configure game** in `src/melate.numbers.ts`:
   ```typescript
   newGame: { 
     min: 1, 
     max: 45, 
     count: 6, 
     filePath: 'data/newgame.csv', 
     gameType: 'New Game' 
   }
   ```
3. **Create data fetcher function**
4. **Create runner file** following the pattern of existing `run-*.ts` files

### CSV Data Format

Historical data files should follow this format:
- **Columns 1-4**: Metadata (date, draw number, etc.) - automatically skipped
- **Columns 5+**: Drawn numbers (labeled as "NUMBER DRAWN 1", "NUMBER DRAWN 2", etc.)
- **Header row**: Column names - automatically removed during processing

## Theory & Strategy

This generator implements several lottery strategies:

1. **Frequency Analysis**: Avoids numbers that appear too often or too rarely
2. **Pattern Avoidance**: Prevents generating sets too similar to historical draws
3. **Randomization with Constraints**: Maintains randomness while applying strategic filters
4. **Warm-up Iterations**: Multiple generation attempts for better distribution

**Note**: This is for entertainment purposes. Lottery drawings are random, and past results don't influence future outcomes.

## Development

### Code Quality
- **TypeScript**: Full type safety and modern JavaScript features
- **ESLint**: Enforces coding standards and best practices
- **ES Modules**: Modern module system with proper imports/exports

### Contributing
1. Make changes to TypeScript files in `src/`
2. Run `npm run lint:fix` to ensure code quality
3. Run `npm run build` to compile
4. Test with `node dist/run-*.js`

## License

This project is for educational and entertainment purposes.

## Disclaimer

**This lottery number generator is for entertainment purposes only.** Lottery drawings are random events, and historical analysis does not guarantee future results. Please gamble responsibly.