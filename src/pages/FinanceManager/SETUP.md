# Finance Manager - Setup Guide

## Quick Start

### 1. Installation

Ensure you have the following dependencies installed:

```bash
npm install react react-dom lucide-react
# or
yarn add react react-dom lucide-react
```

### 2. Project Structure

Copy the entire `FinanceManager` folder into your `src/pages/` directory:

```
src/
└── pages/
    └── FinanceManager/
        ├── FinanceManager.jsx
        ├── FinanceManager.module.css
        ├── index.js
        ├── components/
        ├── utils/
        ├── constants/
        └── sampleData/
```

### 3. Import and Use

In your main app file (e.g., `App.jsx`):

```javascript
import React from 'react';
import FinanceManager from './pages/FinanceManager';

function App() {
  return (
    <div className="App">
      <FinanceManager />
    </div>
  );
}

export default App;
```

### 4. CSS Module Configuration

Ensure your build tool supports CSS Modules:

#### For Create React App
CSS Modules are supported out of the box. No configuration needed.

#### For Vite
CSS Modules are supported out of the box. No configuration needed.

#### For Custom Webpack
Add to your `webpack.config.js`:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.module\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]___[hash:base64:5]',
              },
            },
          },
        ],
      },
    ],
  },
};
```

## Testing the Application

### Using Sample Data

1. Start your development server
2. Open the Finance Manager page
3. Create a new wallet or use the default "Personal" wallet
4. Upload one of the sample data files:
   - `sampleData/transactions-sample.csv`
   - `sampleData/transactions-sample.json`

### Manual Testing Checklist

- [ ] Create a new wallet
- [ ] Select different wallets
- [ ] View "All Wallets Summary"
- [ ] Upload CSV file
- [ ] Upload JSON file
- [ ] Delete a wallet
- [ ] View transaction details
- [ ] Check responsive design on mobile
- [ ] Test keyboard navigation

## File Structure Explanation

```
FinanceManager/
│
├── FinanceManager.jsx           # Main container component with state
├── FinanceManager.module.css    # Main layout styles
├── index.js                     # Export entry point
│
├── components/                  # All reusable UI components
│   ├── Sidebar/                 # Left sidebar navigation
│   ├── WalletList/              # List of wallet cards
│   ├── WalletCard/              # Individual wallet display
│   ├── AddWalletForm/           # Form to create wallets
│   ├── WalletDetailView/        # Detailed wallet view
│   ├── SummaryView/             # Summary dashboard
│   ├── StatsGrid/               # Statistics grid display
│   ├── FileUploader/            # File upload component
│   ├── TransactionList/         # List of transactions
│   ├── TransactionItem/         # Individual transaction display
│   └── WalletOverview/          # Wallet overview cards
│
├── utils/                       # Utility functions
│   └── financeUtils.js          # Finance calculations
│
├── constants/                   # Configuration and constants
│   └── constants.js             # App constants
│
├── sampleData/                  # Sample data files for testing
│   ├── transactions-sample.csv
│   └── transactions-sample.json
│
├── README.md                    # Main documentation
├── ARCHITECTURE.md              # Architecture details
└── SETUP.md                     # This file
```

## Browser Requirements

- Modern browsers with ES6+ support
- CSS Grid support
- CSS Flexbox support
- FileReader API support

### Tested Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Customization Guide

### Changing Colors

Edit the CSS module files. Main colors used:

- Primary: `#4f46e5` (Indigo)
- Success: `#16a34a` (Green)
- Error: `#dc2626` (Red)
- Info: `#3b82f6` (Blue)
- Gray shades for backgrounds and text

### Adding New Transaction Categories

Edit `src/pages/FinanceManager/constants/constants.js`:

```javascript
export const TRANSACTION_CATEGORIES = [
  'General',
  'Your New Category',
  // ... add more
];
```

### Changing Date Format

Edit `src/pages/FinanceManager/utils/financeUtils.js`:

```javascript
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
```

### Changing Currency Symbol

Edit `src/pages/FinanceManager/utils/financeUtils.js`:

```javascript
export const formatCurrency = (amount) => {
  return `€${amount.toFixed(2)}`; // Change $ to € or other symbol
};
```

## Troubleshooting

### CSS Modules Not Working

**Problem**: Styles are not applying correctly
**Solution**: 
- Ensure file names end with `.module.css`
- Check that your build tool supports CSS Modules
- Verify imports: `import styles from './Component.module.css'`

### Icons Not Displaying

**Problem**: Lucide icons are not showing
**Solution**:
- Install lucide-react: `npm install lucide-react`
- Check that imports are correct: `import { Wallet } from 'lucide-react'`

### File Upload Not Working

**Problem**: CSV/JSON files don't upload
**Solution**:
- Check browser console for errors
- Verify file format matches expected structure
- Ensure file size is reasonable (< 5MB recommended)
- Check that FileReader API is supported

### State Not Updating

**Problem**: Changes don't reflect in UI
**Solution**:
- Check React DevTools for state updates
- Verify you're not mutating state directly
- Ensure proper use of `setState` functions

## Performance Tips

### For Large Transaction Lists

If you have many transactions (1000+), consider:

1. **Pagination**: Show transactions in pages
2. **Virtualization**: Use `react-window` or `react-virtualized`
3. **Lazy Loading**: Load transactions on demand
4. **Filtering**: Add date range filters

### For Multiple Wallets

With many wallets (50+), consider:

1. **Search**: Add wallet search functionality
2. **Grouping**: Group wallets by category
3. **Archiving**: Archive inactive wallets

## Adding Backend Integration

To connect to a backend API:

1. Create an API service file:
```javascript
// src/pages/FinanceManager/services/api.js
export const fetchWallets = async () => {
  const response = await fetch('/api/wallets');
  return response.json();
};

export const createWallet = async (wallet) => {
  const response = await fetch('/api/wallets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(wallet)
  });
  return response.json();
};
```

2. Use in component with useEffect:
```javascript
useEffect(() => {
  fetchWallets().then(setWallets);
}, []);
```

## Support

For issues or questions:
1. Check the README.md for feature documentation
2. Review ARCHITECTURE.md for technical details
3. Examine component code and comments
4. Test with sample data files

## Next Steps

After setup, consider:
1. Adding unit tests
2. Implementing data persistence
3. Adding more transaction categories
4. Creating charts and visualizations
5. Adding export functionality
6. Implementing user authentication
