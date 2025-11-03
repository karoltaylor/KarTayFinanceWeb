import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TanStackTableTransactions from './TanStackTableTransactions';
import TanStackTableErrors from '../TanStackTableErrors/TanStackTableErrors';

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

const mockErrors = [
  {
    id: '1',
    row_number: 5,
    error_type: 'validation',
    error_message: 'Invalid date format',
    field_name: 'date',
    value: '2024-13-45',
    suggestion: 'Use YYYY-MM-DD format'
  },
  {
    id: '2',
    row_number: 12,
    error_type: 'missing',
    error_message: 'Required field is missing',
    field_name: 'asset_name',
    value: '',
    suggestion: 'Provide asset name'
  }
];

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('TanStackTableTransactions', () => {
  it('renders transactions table with correct title', () => {
    renderWithTheme(
      <TanStackTableTransactions 
        transactions={mockTransactions}
        loading={false}
      />
    );

    // Check if main title is rendered
    expect(screen.getByText('📊 Transactions (2)')).toBeInTheDocument();
  });

  it('renders with empty transactions array', () => {
    renderWithTheme(
      <TanStackTableTransactions 
        transactions={[]}
        loading={false}
      />
    );

    expect(screen.getByText('📊 Transactions (0)')).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderWithTheme(
      <TanStackTableTransactions 
        transactions={mockTransactions}
        loading={false}
      />
    );

    expect(screen.getByPlaceholderText('Search transactions...')).toBeInTheDocument();
  });
});

describe('TanStackTableErrors', () => {
  it('renders error table with correct title when errors exist', () => {
    renderWithTheme(
      <TanStackTableErrors 
        errors={mockErrors}
        loading={false}
      />
    );

    // Check if main title is rendered
    expect(screen.getByText('🚨 Error Details (2)')).toBeInTheDocument();
    expect(screen.getByText('⚠️ Transaction Errors Detected')).toBeInTheDocument();
  });

  it('does not render when no errors', () => {
    const { container } = renderWithTheme(
      <TanStackTableErrors 
        errors={[]}
        loading={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders search input when errors exist', () => {
    renderWithTheme(
      <TanStackTableErrors 
        errors={mockErrors}
        loading={false}
      />
    );

    expect(screen.getByPlaceholderText('Search errors...')).toBeInTheDocument();
  });
});
