import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TanStackTableTransactions from './TanStackTableTransactions';

// Create a test theme
const theme = createTheme();

// Mock data generator
const generateMockTransactions = (count) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `txn-${index + 1}`,
    wallet_id: 'wallet-1',
    transaction_amount: Math.random() * 1000 - 500, // Random amount between -500 and 500
    transaction_date: new Date(2024, 0, index + 1).toISOString(),
    description: `Transaction ${index + 1}`,
    category: index % 2 === 0 ? 'Income' : 'Expense',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
};

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('TanStackTableTransactions Pagination', () => {
  const mockOnPageChange = jest.fn();
  const mockOnSortChange = jest.fn();
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Pagination with different data sizes', () => {
    it('should handle small dataset (25 transactions) correctly', async () => {
      const transactions = generateMockTransactions(25);
      const pagination = {
        currentPage: 1,
        limit: 25,
        totalCount: 25,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      renderWithTheme(
        <TanStackTableTransactions
          transactions={transactions}
          pagination={pagination}
          onPageChange={mockOnPageChange}
          onSortChange={mockOnSortChange}
          onFilterChange={mockOnFilterChange}
        />
      );

      // Should show all 25 transactions
      expect(screen.getByText('1-25 of 25')).toBeInTheDocument();
      
      // Should not show pagination controls for single page
      expect(screen.queryByLabelText('Go to next page')).not.toBeInTheDocument();
    });

    it('should handle medium dataset (150 transactions) with pagination', async () => {
      const transactions = generateMockTransactions(100); // First page
      const pagination = {
        currentPage: 1,
        limit: 100,
        totalCount: 150,
        totalPages: 2,
        hasNext: true,
        hasPrev: false
      };

      renderWithTheme(
        <TanStackTableTransactions
          transactions={transactions}
          pagination={pagination}
          onPageChange={mockOnPageChange}
          onSortChange={mockOnSortChange}
          onFilterChange={mockOnFilterChange}
        />
      );

      // Should show first page info
      expect(screen.getByText('1-100 of 150')).toBeInTheDocument();
      
      // Should show next page button
      const nextButton = screen.getByLabelText('Go to next page');
      expect(nextButton).toBeInTheDocument();
      
      // Should not show previous page button on first page
      expect(screen.queryByLabelText('Go to previous page')).not.toBeInTheDocument();
    });

    it('should handle large dataset (132 transactions) correctly', async () => {
      const transactions = generateMockTransactions(132); // All transactions
      const pagination = {
        currentPage: 1,
        limit: 1000, // High limit to show all
        totalCount: 132,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      renderWithTheme(
        <TanStackTableTransactions
          transactions={transactions}
          pagination={pagination}
          onPageChange={mockOnPageChange}
          onSortChange={mockOnSortChange}
          onFilterChange={mockOnFilterChange}
        />
      );

      // Should show all 132 transactions
      expect(screen.getByText('1-132 of 132')).toBeInTheDocument();
      
      // Should not show pagination controls
      expect(screen.queryByLabelText('Go to next page')).not.toBeInTheDocument();
    });
  });

  describe('Page navigation', () => {
    it('should call onPageChange when next page is clicked', async () => {
      const transactions = generateMockTransactions(100);
      const pagination = {
        currentPage: 1,
        limit: 100,
        totalCount: 200,
        totalPages: 2,
        hasNext: true,
        hasPrev: false
      };

      renderWithTheme(
        <TanStackTableTransactions
          transactions={transactions}
          pagination={pagination}
          onPageChange={mockOnPageChange}
          onSortChange={mockOnSortChange}
          onFilterChange={mockOnFilterChange}
        />
      );

      const nextButton = screen.getByLabelText('Go to next page');
      fireEvent.click(nextButton);

      // Should call onPageChange with page 2 (1-based)
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when previous page is clicked', async () => {
      const transactions = generateMockTransactions(100);
      const pagination = {
        currentPage: 2,
        limit: 100,
        totalCount: 200,
        totalPages: 2,
        hasNext: false,
        hasPrev: true
      };

      renderWithTheme(
        <TanStackTableTransactions
          transactions={transactions}
          pagination={pagination}
          onPageChange={mockOnPageChange}
          onSortChange={mockOnSortChange}
          onFilterChange={mockOnFilterChange}
        />
      );

      const prevButton = screen.getByLabelText('Go to previous page');
      fireEvent.click(prevButton);

      // Should call onPageChange with page 1 (1-based)
      expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });
  });

  describe('Rows per page changes', () => {
    it('should handle rows per page change correctly', async () => {
      const transactions = generateMockTransactions(100);
      const pagination = {
        currentPage: 1,
        limit: 100,
        totalCount: 200,
        totalPages: 2,
        hasNext: true,
        hasPrev: false
      };

      renderWithTheme(
        <TanStackTableTransactions
          transactions={transactions}
          pagination={pagination}
          onPageChange={mockOnPageChange}
          onSortChange={mockOnSortChange}
          onFilterChange={mockOnFilterChange}
        />
      );

      // Find and click the rows per page dropdown
      const rowsPerPageSelect = screen.getByDisplayValue('100');
      fireEvent.mouseDown(rowsPerPageSelect);
      
      // Select 500 rows per page
      const option500 = screen.getByText('500');
      fireEvent.click(option500);

      // Should reset to page 1 and update rows per page
      await waitFor(() => {
        expect(screen.getByText('1-100 of 200')).toBeInTheDocument();
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty dataset', async () => {
      const pagination = {
        currentPage: 1,
        limit: 100,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      };

      renderWithTheme(
        <TanStackTableTransactions
          transactions={[]}
          pagination={pagination}
          onPageChange={mockOnPageChange}
          onSortChange={mockOnSortChange}
          onFilterChange={mockOnFilterChange}
        />
      );

      // Should show 0-0 of 0
      expect(screen.getByText('0-0 of 0')).toBeInTheDocument();
    });

    it('should handle page number out of range gracefully', async () => {
      const transactions = generateMockTransactions(50);
      const pagination = {
        currentPage: 5, // Invalid page number
        limit: 100,
        totalCount: 50,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      renderWithTheme(
        <TanStackTableTransactions
          transactions={transactions}
          pagination={pagination}
          onPageChange={mockOnPageChange}
          onSortChange={mockOnSortChange}
          onFilterChange={mockOnFilterChange}
        />
      );

      // Should still render without crashing
      expect(screen.getByText('1-50 of 50')).toBeInTheDocument();
    });
  });
});
