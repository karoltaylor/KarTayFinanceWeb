import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TanStackTableUnprocessedErrors from './TanStackTableUnprocessedErrors';

// Create a test theme
const theme = createTheme();

// Mock the API function
jest.mock('../../../../services/api', () => ({
  getUnprocessedTransactionErrors: jest.fn(() => Promise.resolve({
    errors: []
  }))
}));

// Mock the logger
jest.mock('../../../../services/logger', () => ({
  transaction: jest.fn(),
  error: jest.fn()
}));

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('TanStackTableUnprocessedErrors', () => {
  it('renders loading state initially', () => {
    renderWithTheme(<TanStackTableUnprocessedErrors />);
    
    expect(screen.getByText('Loading unprocessed errors...')).toBeInTheDocument();
  });

  it('renders success message when no errors', async () => {
    const { getUnprocessedTransactionErrors } = require('../../../../services/api');
    getUnprocessedTransactionErrors.mockResolvedValueOnce({ errors: [] });
    
    renderWithTheme(<TanStackTableUnprocessedErrors />);
    
    // Wait for the component to finish loading
    await screen.findByText('✅ No Unprocessed Errors');
    expect(screen.getByText('All transactions have been processed successfully!')).toBeInTheDocument();
  });
});
