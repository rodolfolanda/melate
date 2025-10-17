# Phase 3: Data Visualization - Implementation Plan

## 🎯 Objective
Add interactive data visualizations to help users understand number patterns, frequency distributions, and statistical insights from historical lottery data.

## 📊 Features to Implement

### 1. **Number Frequency Chart** (Priority: High)
- **Type**: Bar chart or histogram
- **Data**: Show how many times each number has been drawn
- **Features**:
  - Color-coded bars (hot numbers in red, cold numbers in blue)
  - Interactive tooltips showing exact counts
  - Highlight excluded numbers in different color
  - Responsive design

### 2. **Hot & Cold Numbers Display** (Priority: High)
- **Type**: Visual grid/heatmap
- **Data**: Top 10 most frequent and least frequent numbers
- **Features**:
  - Visual distinction between hot (red gradient) and cold (blue gradient)
  - Number badges with draw counts
  - Quick-add to exclusion list
  - Current exclusion status indicator

### 3. **Odd/Even Distribution** (Priority: Medium)
- **Type**: Pie chart or donut chart
- **Data**: Percentage of odd vs even numbers in historical draws
- **Features**:
  - Show overall distribution
  - Show distribution in generated numbers
  - Comparison view

### 4. **Number Range Distribution** (Priority: Medium)
- **Type**: Grouped bar chart
- **Data**: Distribution across ranges (1-10, 11-20, 21-30, etc.)
- **Features**:
  - Visual breakdown of where winning numbers tend to fall
  - Overlay current generation strategy
  - Historical vs current comparison

### 5. **Recent Trends** (Priority: Low)
- **Type**: Line chart
- **Data**: Number frequency over last N draws
- **Features**:
  - See which numbers are "heating up" or "cooling down"
  - Adjustable time window (last 10, 20, 50 draws)
  - Trend indicators

## 🛠️ Technology Stack

### Charting Library Options

**Option 1: Recharts** (Recommended)
- ✅ React-native, composable charts
- ✅ Great TypeScript support
- ✅ Responsive by default
- ✅ Clean API, easy to customize
- ✅ Good documentation
- ❌ Larger bundle size (~100KB)

**Option 2: Chart.js with react-chartjs-2**
- ✅ Very popular, mature
- ✅ Lots of examples
- ✅ Smaller bundle size (~60KB)
- ❌ Less "React-like" API
- ❌ More imperative style

**Decision**: Use **Recharts** for better React integration and developer experience.

## 📁 File Structure

```
src/
├── ui/
│   ├── components/
│   │   ├── charts/
│   │   │   ├── FrequencyBarChart.tsx       # Main frequency visualization
│   │   │   ├── HotColdGrid.tsx             # Hot/cold numbers display
│   │   │   ├── OddEvenPieChart.tsx         # Odd/even distribution
│   │   │   ├── RangeDistributionChart.tsx  # Number range breakdown
│   │   │   └── ChartContainer.tsx          # Shared chart wrapper
│   │   ├── StatisticsPanel.tsx             # Container for all charts
│   │   └── [existing components...]
│   └── hooks/
│       ├── useChartData.ts                 # Hook for processing chart data
│       └── [existing hooks...]
├── core/
│   └── analytics.ts                        # New: Analytics utilities
└── __tests__/
    └── analytics.test.ts                   # Tests for analytics functions
```

## 🔧 Implementation Steps

### Step 1: Install Dependencies
```bash
npm install recharts
npm install -D @types/recharts
```

### Step 2: Create Analytics Utilities
Create `src/core/analytics.ts` with functions:
- `calculateFrequencyDistribution()` - Get draw count per number
- `getHotNumbers()` - Top N most frequent numbers
- `getColdNumbers()` - Top N least frequent numbers
- `calculateOddEvenRatio()` - Odd vs even percentage
- `calculateRangeDistribution()` - Numbers per range (1-10, 11-20, etc.)

### Step 3: Create Chart Components
Build reusable chart components:
1. **FrequencyBarChart.tsx** - Main frequency visualization
2. **HotColdGrid.tsx** - Visual hot/cold number grid
3. **OddEvenPieChart.tsx** - Pie chart for odd/even split
4. **RangeDistributionChart.tsx** - Range distribution bars

### Step 4: Create Data Hook
`useChartData.ts` - Process CSV data for charts:
- Load and parse CSV data
- Calculate all statistics
- Memoize results for performance
- Handle loading states

### Step 5: Create Statistics Panel
`StatisticsPanel.tsx` - Container component:
- Collapsible sections for each chart
- Tab interface for switching views
- Loading states
- Error handling

### Step 6: Integrate into App
Update `App.tsx`:
- Add Statistics Panel to layout
- Toggle visibility
- Coordinate with existing components

### Step 7: Styling
- Add chart-specific CSS
- Ensure responsive design
- Color scheme matching existing UI
- Accessibility (ARIA labels, keyboard navigation)

### Step 8: Testing
- Unit tests for analytics functions
- Component tests for charts
- Integration tests for data flow
- Visual regression tests (optional)

## 🎨 Design Considerations

### Color Palette
- **Hot Numbers**: `#ef4444` (red-500) → `#dc2626` (red-600)
- **Cold Numbers**: `#3b82f6` (blue-500) → `#2563eb` (blue-600)
- **Neutral**: `#6b7280` (gray-500)
- **Accent**: `#8b5cf6` (purple-500) - existing brand color

### Responsive Breakpoints
- **Mobile** (<768px): Stacked charts, simplified views
- **Tablet** (768-1024px): 2-column grid
- **Desktop** (>1024px): 3-column grid or tabbed interface

### Performance
- Lazy load chart components
- Memoize expensive calculations
- Debounce user interactions
- Virtual scrolling for large datasets (if needed)

## 📈 Success Metrics

### Functionality
- ✅ All charts render correctly with real data
- ✅ Interactive features work (tooltips, clicks)
- ✅ Responsive on all screen sizes
- ✅ No performance issues with large datasets

### Code Quality
- ✅ All tests passing (target: 80%+ coverage for new code)
- ✅ TypeScript strict mode compliant
- ✅ ESLint clean
- ✅ Accessible (WCAG 2.1 AA)

### User Experience
- ✅ Charts load quickly (<2 seconds)
- ✅ Clear, intuitive visualizations
- ✅ Helpful tooltips and labels
- ✅ Smooth animations

## 🚀 Estimated Timeline

- **Step 1-2**: Install deps + Analytics utilities - 1-2 hours
- **Step 3**: Chart components - 3-4 hours
- **Step 4**: Data hook - 1 hour
- **Step 5**: Statistics Panel - 1-2 hours
- **Step 6**: Integration - 1 hour
- **Step 7**: Styling - 2 hours
- **Step 8**: Testing - 2-3 hours

**Total**: ~12-15 hours of development time

## 📝 Deliverables

1. ✅ Analytics utility functions with tests
2. ✅ 4+ chart components
3. ✅ Custom data processing hook
4. ✅ Integrated statistics panel
5. ✅ Comprehensive styling
6. ✅ Test coverage >80% for new code
7. ✅ Updated documentation
8. ✅ Phase 3 summary document

## 🔄 Future Enhancements (Phase 4?)

After Phase 3, consider:
- Export charts as images (PNG/SVG)
- Custom date range filtering
- Compare multiple games side-by-side
- Machine learning predictions (advanced)
- Social sharing of statistics

---

**Ready to start?** Let's begin with Step 1: Installing dependencies and creating the analytics utilities! 🚀
