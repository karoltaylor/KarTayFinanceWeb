# Finance Manager - Best Practices Implementation

This is a React-based Finance Manager application built following modern best practices with proper separation of concerns.

## Project Structure

```
src/pages/FinanceManager/
├── FinanceManager.jsx              # Main component (container)
├── FinanceManager.module.css       # Main styles
├── index.js                        # Export entry point
├── README.md                       # Documentation
│
├── components/                     # All UI components
│   ├── Sidebar/
│   │   ├── Sidebar.jsx
│   │   └── Sidebar.module.css
│   ├── WalletList/
│   │   ├── WalletList.jsx
│   │   └── WalletList.module.css
│   ├── WalletCard/
│   │   ├── WalletCard.jsx
│   │   └── WalletCard.module.css
│   ├── AddWalletForm/
│   │   ├── AddWalletForm.jsx
│   │   └── AddWalletForm.module.css
│   ├── WalletDetailView/
│   │   ├── WalletDetailView.jsx
│   │   └── WalletDetailView.module.css
│   ├── SummaryView/
│   │   ├── SummaryView.jsx
│   │   └── SummaryView.module.css
│   ├── StatsGrid/
│   │   ├── StatsGrid.jsx
│   │   └── StatsGrid.module.css
│   ├── FileUploader/
│   │   ├── FileUploader.jsx
│   │   └── FileUploader.module.css
│   ├── TransactionList/
│   │   ├── TransactionList.jsx
│   │   └── TransactionList.module.css
│   ├── TransactionItem/
│   │   ├── TransactionItem.jsx
│   │   └── TransactionItem.module.css
│   └── WalletOverview/
│       ├── WalletOverview.jsx
│       └── WalletOverview.module.css
│
├── utils/                          # Utility functions
│   └── financeUtils.js
│
└── constants/                      # Constants and configuration
    └── constants.js
```

## Best Practices Implemented

### 1. **Separation of Concerns**
- Each component has its own directory
- JSX and CSS are separated using CSS Modules
- Business logic is extracted to utility functions
- Constants are centralized in a dedicated file

### 2. **Component Architecture**
- **Container Component**: `FinanceManager.jsx` manages state and logic
- **Presentational Components**: All components in `components/` focus on UI
- **Single Responsibility**: Each component has one clear purpose
- **Reusable Components**: `StatsGrid`, `WalletCard`, `TransactionItem` are highly reusable

### 3. **CSS Modules**
- Scoped styles prevent naming conflicts
- Naming convention: `ComponentName.module.css`
- No inline styles or global CSS classes (except for lucide-react icons)
- Responsive design with media queries

### 4. **Code Organization**
- Clear folder structure by feature
- Logical component hierarchy
- Utility functions separated from components
- Constants centralized for easy maintenance

### 5. **Modern React Patterns**
- Functional components with hooks
- Proper props destructuring
- Event handler composition
- Controlled components for forms

### 6. **Accessibility**
- Semantic HTML elements (`<main>`, `<aside>`, `<header>`)
- ARIA labels where needed
- Keyboard navigation support
- Focus management in forms

### 7. **Maintainability**
- JSDoc comments in utility functions
- Descriptive variable and function names
- Consistent code formatting
- Modular and testable code

### 8. **Performance Considerations**
- Minimal re-renders with proper state management
- Event handler optimization (stopPropagation)
- Efficient array operations
- CSS transitions for smooth UX

## Usage

### Import the component:
```javascript
import FinanceManager from './pages/FinanceManager';
```

### Use in your app:
```javascript
function App() {
  return <FinanceManager />;
}
```

## Features

- **Multi-Wallet Management**: Create and manage multiple wallets
- **Transaction Import**: Upload transactions via CSV or JSON
- **Statistics Dashboard**: View income, expenses, and balance across all wallets
- **Detailed Views**: Individual wallet details with transaction history
- **Summary View**: Overview of all wallets and overall financial health
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## File Format Support

### CSV Format:
```
date,description,amount,category
2024-01-15,Grocery Shopping,-45.50,Food & Dining
2024-01-16,Salary,2500.00,Income
```

### JSON Format:
```json
[
  {
    "date": "2024-01-15",
    "description": "Grocery Shopping",
    "amount": -45.50,
    "category": "Food & Dining"
  },
  {
    "date": "2024-01-16",
    "description": "Salary",
    "amount": 2500.00,
    "category": "Income"
  }
]
```

## Customization

### Adding New Categories
Edit `src/pages/FinanceManager/constants/constants.js`:
```javascript
export const TRANSACTION_CATEGORIES = [
  'General',
  'Your New Category',
  // ... more categories
];
```

### Styling
Each component has its own CSS Module. Modify the respective `.module.css` file to change styles.

### Adding Features
1. Create new component in `components/` directory
2. Add utility functions in `utils/` if needed
3. Update constants in `constants/` if required
4. Import and use in parent components

## Dependencies

- React 18+
- lucide-react (for icons)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ support required
- CSS Grid and Flexbox support required
