import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TransactionsDataGrid from './TransactionsDataGrid';

// Create a test theme
const theme = createTheme();

// Mock data for testing
const mockTransactions = [
  {
    id: '1',
    date: '2024-01-15',
    asset_name: 'Bitcoin',
    asset_type: 'Cryptocurrency',
    transaction_type: 'Buy',
    volume: 0.5,
    item_price: 45000,
    transaction_amount: 22500,
    currency: 'USD',
    fee: 25
  },
  {
    id: '2',
    date: '2024-01-16',
    asset_name: 'Ethereum',
    asset_type: 'Cryptocurrency',
    transaction_type: 'Sell',
    volume: 2.0,
    item_price: 3000,
    transaction_amount: -6000,
    currency: 'USD',
    fee: 15
  }
];

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('TransactionsDataGrid', () => {
  it('renders transactions table with correct title', () => {
    renderWithTheme(
      <TransactionsDataGrid 
        transactions={mockTransactions}
        loading={false}
      />
    );

    // Check if main title is rendered
    expect(screen.getByText('Transactions (2)')).toBeInTheDocument();
  });

  it('renders with empty transactions array', () => {
    renderWithTheme(
      <TransactionsDataGrid 
        transactions={[]}
        loading={false}
      />
    );

    expect(screen.getByText('Transactions (0)')).toBeInTheDocument();
  });
});
