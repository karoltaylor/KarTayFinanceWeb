# Pagination Testing Strategy

## Overview
This document outlines a comprehensive testing strategy for pagination functionality in the FinanceManager application, specifically focusing on handling large datasets (132+ transactions) and ensuring all data is accessible.

## Current Issue
- **Problem**: Only 100 transactions were visible despite 132 existing in the database
- **Root Cause**: Default pagination limit was set to 100
- **Solution**: Increased default limit to 1000 and added higher page size options

## Testing Levels

### 1. Unit Tests
**Location**: `src/pages/FinanceManager/components/TanStackTableTransactions/TanStackTableTransactions.pagination.test.jsx`

**Test Cases**:
- ✅ Small dataset (25 transactions) - single page
- ✅ Medium dataset (150 transactions) - multiple pages
- ✅ Large dataset (132 transactions) - all on one page with high limit
- ✅ Page navigation (next/previous)
- ✅ Rows per page changes
- ✅ Edge cases (empty dataset, invalid page numbers)

**Key Assertions**:
```javascript
// Verify correct transaction count display
expect(screen.getByText('1-132 of 132')).toBeInTheDocument();

// Verify pagination controls
expect(screen.queryByLabelText('Go to next page')).not.toBeInTheDocument();

// Verify API calls
expect(mockOnPageChange).toHaveBeenCalledWith(2);
```

### 2. Integration Tests
**Location**: `src/pages/FinanceManager/FinanceManager.pagination.test.jsx`

**Test Cases**:
- ✅ Large dataset loading (132+ transactions)
- ✅ Pagination with lower limits (100 per page)
- ✅ Rows per page changes to show all data
- ✅ API error handling
- ✅ State synchronization between components

**Key Assertions**:
```javascript
// Verify API called with correct parameters
expect(getTransactionsByWallet).toHaveBeenCalledWith('wallet-1', 1, 1000);

// Verify UI updates correctly
await waitFor(() => {
  expect(screen.getByText('1-132 of 132')).toBeInTheDocument();
});
```

### 3. End-to-End Tests (Recommended)
**Tools**: Cypress or Playwright

**Test Scenarios**:
```javascript
describe('Pagination E2E Tests', () => {
  it('should display all 132 transactions', () => {
    cy.visit('/finance-manager');
    cy.get('[data-testid="wallet-card"]').first().click();
    cy.get('[data-testid="transactions-table"]').should('contain', '1-132 of 132');
    cy.get('[data-testid="transaction-row"]').should('have.length', 132);
  });

  it('should navigate through pages correctly', () => {
    cy.visit('/finance-manager');
    cy.get('[data-testid="wallet-card"]').first().click();
    
    // Change to 50 rows per page
    cy.get('[data-testid="rows-per-page"]').select('50');
    cy.get('[data-testid="pagination-info"]').should('contain', '1-50 of 132');
    
    // Go to next page
    cy.get('[data-testid="next-page"]').click();
    cy.get('[data-testid="pagination-info"]').should('contain', '51-100 of 132');
  });
});
```

## Automated Testing Strategy

### 1. Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:pagination"
    }
  }
}
```

### 2. CI/CD Pipeline
```yaml
# .github/workflows/pagination-tests.yml
name: Pagination Tests
on: [push, pull_request]

jobs:
  pagination-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:pagination
      - run: npm run test:e2e:pagination
```

### 3. Test Data Management
```javascript
// test-utils/mockData.js
export const generateTestTransactions = (count, options = {}) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `txn-${index + 1}`,
    wallet_id: options.walletId || 'wallet-1',
    transaction_amount: options.amount || (Math.random() * 1000 - 500),
    transaction_date: options.date || new Date(2024, 0, index + 1).toISOString(),
    description: options.description || `Transaction ${index + 1}`,
    category: options.category || (index % 2 === 0 ? 'Income' : 'Expense'),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
};

// Test scenarios
export const PAGINATION_TEST_SCENARIOS = {
  SMALL: { count: 25, expectedPages: 1 },
  MEDIUM: { count: 150, expectedPages: 2 },
  LARGE: { count: 132, expectedPages: 1 },
  VERY_LARGE: { count: 1000, expectedPages: 10 }
};
```

### 4. Performance Testing
```javascript
// performance/pagination.test.js
describe('Pagination Performance', () => {
  it('should handle 1000+ transactions without performance degradation', async () => {
    const startTime = performance.now();
    
    const transactions = generateTestTransactions(1000);
    render(<TanStackTableTransactions transactions={transactions} />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 100ms
    expect(renderTime).toBeLessThan(100);
  });
});
```

## Monitoring and Alerting

### 1. Production Monitoring
```javascript
// utils/paginationMonitor.js
export const trackPaginationMetrics = (action, data) => {
  // Track pagination events
  analytics.track('pagination_action', {
    action, // 'page_change', 'rows_per_page_change', 'load_all'
    page: data.currentPage,
    limit: data.limit,
    totalCount: data.totalCount,
    userId: getCurrentUserId()
  });
  
  // Alert if pagination seems stuck
  if (data.currentPage > data.totalPages) {
    alerting.sendAlert('PAGINATION_ERROR', {
      message: 'Page number exceeds total pages',
      data
    });
  }
};
```

### 2. Error Tracking
```javascript
// utils/errorTracking.js
export const trackPaginationErrors = (error, context) => {
  errorTracking.captureException(error, {
    tags: {
      component: 'pagination',
      action: context.action
    },
    extra: {
      paginationState: context.pagination,
      userAgent: navigator.userAgent
    }
  });
};
```

## Best Practices

### 1. Test Data Isolation
- Use unique test data for each test
- Clean up test data after each test
- Use factories for generating test data

### 2. Assertion Strategy
- Test both positive and negative cases
- Verify API calls with correct parameters
- Check UI state changes
- Validate error handling

### 3. Performance Considerations
- Test with realistic data sizes
- Monitor render times
- Test memory usage with large datasets
- Implement virtual scrolling for very large datasets

## Implementation Checklist

- [x] Increase default pagination limit to 1000
- [x] Add higher rows per page options (500, 1000)
- [x] Create unit tests for pagination component
- [x] Create integration tests for FinanceManager
- [ ] Add data-testid attributes for E2E testing
- [ ] Implement E2E tests with Cypress/Playwright
- [ ] Add performance monitoring
- [ ] Set up CI/CD pipeline for automated testing
- [ ] Create test data factories
- [ ] Add error tracking and alerting

## Future Enhancements

1. **Virtual Scrolling**: For datasets > 1000 transactions
2. **Infinite Scroll**: Alternative to pagination for mobile
3. **Smart Pagination**: Auto-adjust page size based on data size
4. **Caching**: Cache paginated data for better performance
5. **Real-time Updates**: Handle data changes during pagination
