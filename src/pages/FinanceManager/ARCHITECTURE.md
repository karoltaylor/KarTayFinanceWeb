# Finance Manager Architecture

## Component Hierarchy

```
FinanceManager (Container)
│
├── Sidebar
│   ├── Header (inline)
│   ├── Summary Button (inline)
│   ├── WalletList
│   │   └── WalletCard (multiple)
│   └── AddWalletForm
│
└── Main Content (conditional)
    │
    ├── WalletDetailView (when wallet selected)
    │   ├── Header (inline)
    │   ├── StatsGrid
    │   ├── FileUploader
    │   └── TransactionList
    │       └── TransactionItem (multiple)
    │
    └── SummaryView (when no wallet selected)
        ├── Header (inline)
        ├── StatsGrid
        └── WalletOverview
            └── Wallet Cards (multiple, inline)
```

## Data Flow

### State Management
```
FinanceManager (Root State)
├── wallets: Array<Wallet>
│   └── Wallet: {
│       id: number,
│       name: string,
│       balance: number,
│       transactions: Array<Transaction>
│   }
│
└── selectedWalletId: number | null
```

### Props Flow (Top-Down)
```
FinanceManager
│
├─> Sidebar
│   ├─> wallets
│   ├─> selectedWalletId
│   ├─> onSelectWallet()
│   ├─> onAddWallet()
│   └─> onRemoveWallet()
│
└─> Main Content
    ├─> WalletDetailView
    │   ├─> wallet (derived from selectedWalletId)
    │   └─> onFileUpload()
    │
    └─> SummaryView
        ├─> wallets
        ├─> stats (calculated)
        └─> onSelectWallet()
```

### Events Flow (Bottom-Up)
```
User Interactions
│
├─> Select Wallet
│   └─> WalletCard.onClick() → onSelectWallet(id) → setSelectedWalletId()
│
├─> Add Wallet
│   └─> AddWalletForm.onSubmit() → onAddWallet(name) → setWallets()
│
├─> Remove Wallet
│   └─> WalletCard.onRemove() → onRemoveWallet(id) → setWallets()
│
└─> Upload Transactions
    └─> FileUploader.onChange() → onFileUpload(id, file) → setWallets()
```

## Component Responsibilities

### Container Components
- **FinanceManager**: State management, business logic, data flow orchestration

### Layout Components
- **Sidebar**: Navigation and wallet list display
- **WalletDetailView**: Individual wallet details and transactions
- **SummaryView**: Aggregate statistics and overview

### Presentational Components
- **WalletList**: Renders list of wallet cards
- **WalletCard**: Displays individual wallet information
- **AddWalletForm**: Form for creating new wallets
- **StatsGrid**: Displays statistics in a grid layout
- **FileUploader**: Handles file upload UI
- **TransactionList**: Renders list of transactions
- **TransactionItem**: Displays individual transaction
- **WalletOverview**: Grid of wallet summary cards

## Utility Functions

### financeUtils.js
- `calculateStats(transactions)`: Calculate income and expenses
- `calculateAllWalletsStats(wallets)`: Calculate overall statistics
- `formatCurrency(amount)`: Format numbers as currency
- `formatDate(dateString)`: Format date strings

## Styling Strategy

### CSS Modules
- Each component has its own scoped styles
- No global namespace pollution
- Clear component-style relationship
- Easy to maintain and update

### Naming Convention
```css
/* ComponentName.module.css */
.container { }      /* Main wrapper */
.header { }         /* Header section */
.title { }          /* Title text */
.button { }         /* Button element */
.active { }         /* State modifier */
.positive { }       /* Type modifier */
```

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## File Upload Flow

```
1. User selects file
   ↓
2. FileUploader.onChange() triggered
   ↓
3. onFileUpload(walletId, file) called
   ↓
4. File is read as text
   ↓
5. Parse as JSON (try first) or CSV (fallback)
   ↓
6. Create transaction objects
   ↓
7. Update wallet with new transactions
   ↓
8. Recalculate wallet balance
   ↓
9. Update state with setWallets()
   ↓
10. UI re-renders with new data
```

## Performance Considerations

### Optimization Strategies
1. **State Updates**: Immutable state updates using spread operator
2. **Array Operations**: Efficient map/filter/reduce operations
3. **Event Handlers**: Event propagation stopped where needed
4. **CSS Transitions**: Hardware-accelerated transforms
5. **Component Structure**: Shallow component tree for fast rendering

### Potential Improvements
- Add React.memo() for expensive components
- Implement useCallback() for event handlers
- Add useMemo() for expensive calculations
- Consider virtualization for large transaction lists
- Add debouncing for search/filter features

## Testing Strategy

### Unit Tests
- Utility functions (financeUtils.js)
- Individual components with different props
- Form validation and submission

### Integration Tests
- Wallet creation flow
- Transaction upload flow
- Navigation between views
- Data persistence

### E2E Tests
- Complete user workflows
- File upload with different formats
- Multi-wallet management
- Error handling scenarios

## Future Enhancements

### Potential Features
1. Transaction filtering and search
2. Date range selection
3. Category-based charts
4. Export functionality
5. Transaction editing/deletion
6. Budget tracking
7. Recurring transactions
8. Multi-currency support
9. Data persistence (localStorage/backend)
10. User authentication
