# Transaction API Response Format

## Expected API Endpoint

```
GET /api/transactions
```

## Expected Response Format

The API should return an array of transaction objects with the following structure:

```json
[
  {
    "id": "string|number",
    "asset_name": "string",
    "asset_type": "string",
    "date": "string (ISO 8601 date)",
    "transaction_type": "string",
    "volume": "number",
    "item_price": "number",
    "transaction_amount": "number",
    "currency": "string",
    "fee": "number",
    "created_at": "string (ISO 8601 datetime)"
  }
]
```

---

## Field Descriptions

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string \| number | Unique identifier for the transaction | `"txn_123456"` or `123456` |
| `asset_name` | string | Name of the asset/security | `"Bitcoin"`, `"AAPL"`, `"Gold"` |
| `asset_type` | string | Type/category of asset | `"Crypto"`, `"Stock"`, `"Commodity"` |
| `date` | string | Transaction date (ISO 8601) | `"2024-01-15"` or `"2024-01-15T14:30:00Z"` |
| `transaction_type` | string | Type of transaction | `"BUY"`, `"SELL"`, `"TRANSFER"` |
| `volume` | number | Quantity/volume of asset | `0.5`, `100`, `2.3456` |
| `item_price` | number | Price per unit of asset | `45000.00`, `150.25` |
| `transaction_amount` | number | Total transaction amount | `22500.00`, `15025.00` |
| `currency` | string | Currency code | `"USD"`, `"EUR"`, `"GBP"` |
| `fee` | number | Transaction fee | `5.00`, `0.25` |
| `created_at` | string | When record was created (ISO 8601) | `"2024-01-15T14:30:00Z"` |

---

## Example API Response

```json
[
  {
    "id": "txn_001",
    "asset_name": "Bitcoin",
    "asset_type": "Cryptocurrency",
    "date": "2024-01-15",
    "transaction_type": "BUY",
    "volume": 0.5,
    "item_price": 45000.00,
    "transaction_amount": 22500.00,
    "currency": "USD",
    "fee": 25.00,
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": "txn_002",
    "asset_name": "Apple Inc.",
    "asset_type": "Stock",
    "date": "2024-01-16",
    "transaction_type": "BUY",
    "volume": 100,
    "item_price": 150.25,
    "transaction_amount": 15025.00,
    "currency": "USD",
    "fee": 5.00,
    "created_at": "2024-01-16T14:45:00Z"
  },
  {
    "id": "txn_003",
    "asset_name": "Ethereum",
    "asset_type": "Cryptocurrency",
    "date": "2024-01-17",
    "transaction_type": "SELL",
    "volume": 2.0,
    "item_price": 2500.00,
    "transaction_amount": 5000.00,
    "currency": "USD",
    "fee": 15.00,
    "created_at": "2024-01-17T09:15:00Z"
  }
]
```

---

## Transaction Types

The `transaction_type` field should use one of these values:

| Type | Description | Color Coding |
|------|-------------|--------------|
| `BUY` | Asset purchase | Green |
| `SELL` | Asset sale | Red |
| `TRANSFER` | Asset transfer | Blue |

**Note:** Transaction types are case-insensitive in the UI and will be displayed in uppercase.

---

## Display Format in UI

### Desktop View (9 Columns)

The transaction table displays these columns:

1. **Date** (100px) - Formatted as "Jan 15, 2024"
2. **Asset Name** (150px) - Full asset name
3. **Asset Type** (100px) - Badge/tag display
4. **Type** (90px) - Color-coded badge (BUY/SELL/TRANSFER)
5. **Volume** (100px) - Right-aligned, 4 decimal places
6. **Item Price** (100px) - Right-aligned, 2 decimal places
7. **Amount** (110px) - Right-aligned, 2 decimal places, color-coded
8. **Currency** (80px) - Center-aligned
9. **Fee** (80px) - Right-aligned, 2 decimal places

**Total width:** ~950px (will scroll horizontally on smaller screens)

### Mobile View

On screens < 768px, transactions display as cards with:
- Asset name (prominent)
- Date
- Asset type and transaction type badges
- Volume, price, amount, currency, and fee with labels
- Responsive 2-column grid layout

---

## Data Validation

### Required Validations

1. **Date Format**
   - Must be valid ISO 8601 date
   - Frontend will format for display
   - If invalid, displays as-is

2. **Numeric Fields**
   - `volume`: Should be positive number
   - `item_price`: Should be positive number
   - `transaction_amount`: Can be positive or negative
   - `fee`: Should be positive number
   - Null/undefined values display as "-"

3. **String Fields**
   - Empty strings will display as "-"
   - Long strings will be truncated with ellipsis

---

## Currency Handling

- Default currency: `"USD"`
- Currency code should be ISO 4217 standard (3-letter code)
- Display format: Currency is shown in a separate column
- No currency symbol in amount (handled by currency column)

---

## Calculation Notes

### Transaction Amount

The `transaction_amount` field should represent:
- **For BUY**: Negative value (money spent)
- **For SELL**: Positive value (money received)
- **For TRANSFER**: Can be either (depending on context)

**Formula:**
```
transaction_amount = volume × item_price ± fees (depending on transaction type)
```

### Display Rules

- **Positive amounts**: Display with `+` prefix in green
- **Negative amounts**: Display with `-` prefix in red
- **Zero amounts**: Display as "0.00" in default color

---

## Sorting

Transactions are displayed in **reverse chronological order** (newest first):
- Sorted by `date` field
- Array is reversed before display: `[...transactions].reverse()`

---

## Error Handling

### Missing Fields

If a field is missing or null:
- Display as `"-"` for text fields
- Display as `"0.00"` for numeric fields (via formatNumber)
- Currency defaults to `"USD"`
- Asset type/transaction type show as `"-"`

### Invalid Data

- Invalid dates: Display as-is without formatting
- Non-numeric values in numeric fields: Display as `"-"`
- Unknown transaction types: Display without color coding

---

## Performance Considerations

- **Large Datasets**: Component handles arrays of any size
- **Horizontal Scrolling**: Enabled for tablets and smaller desktops
- **Responsive**: Card view for mobile prevents cramping
- **Monospace Font**: Used for numeric values for better alignment

---

## Example cURL Request

```bash
curl -X GET \
  'https://your-api.com/api/transactions' \
  -H 'X-User-ID: user_123' \
  -H 'Content-Type: application/json'
```

---

## Integration with Frontend

### API Service Call

```javascript
import { getTransactions } from '../services/api';

const transactions = await getTransactions();
// Returns array of transaction objects
```

### Component Usage

```jsx
import TransactionList from './components/TransactionList/TransactionList';

<TransactionList transactions={transactions} />
```

### Data Flow

```
API Response → getTransactions()
              ↓
     Array of transaction objects
              ↓
     TransactionList component
              ↓
     TransactionItem (for each transaction)
              ↓
     Rendered table/card view
```

---

## Testing

### Sample Test Data

```javascript
const sampleTransaction = {
  id: "test_001",
  asset_name: "Test Asset",
  asset_type: "Test Type",
  date: "2024-01-15",
  transaction_type: "BUY",
  volume: 1.23456,
  item_price: 100.50,
  transaction_amount: 124.09,
  currency: "USD",
  fee: 0.50,
  created_at: "2024-01-15T10:00:00Z"
};
```

### Expected Display

- Date: "Jan 15, 2024"
- Asset Name: "Test Asset"
- Asset Type: Badge showing "TEST TYPE"
- Type: Green badge showing "BUY"
- Volume: "1.2346"
- Item Price: "100.50"
- Amount: "+124.09" (in green)
- Currency: "USD"
- Fee: "0.50"

---

## Backend Requirements

Your backend API should:

1. ✅ Return transactions as array of objects
2. ✅ Include all required fields
3. ✅ Use ISO 8601 date format
4. ✅ Use consistent currency codes
5. ✅ Include proper CORS headers
6. ✅ Support user-specific filtering (via X-User-ID header)
7. ✅ Return 200 status code on success
8. ✅ Return empty array `[]` if no transactions

---

## Future Enhancements

Potential additional fields that could be added:

- `wallet_id`: Which wallet the transaction belongs to
- `notes`: User notes about the transaction
- `tags`: Array of tags for categorization
- `status`: Transaction status (pending, completed, failed)
- `counterparty`: Other party in the transaction
- `exchange`: Trading platform/exchange name
- `reference_number`: External reference ID

To add these fields, update:
1. Grid columns in CSS files
2. Table headers in TransactionList.jsx
3. Data display in TransactionItem.jsx

---

**Last Updated:** 2025-01-09

**Status:** ✅ Implemented and ready for API integration

