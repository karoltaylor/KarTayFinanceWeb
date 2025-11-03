import React, { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/financeUtils';
import styles from './TanStackTableTransactions.module.css';

const columnHelper = createColumnHelper();

export default function TanStackTableTransactions({ 
  transactions = [], 
  loading = false,
  pagination = {},
  onPageChange,
  onSortChange,
  onFilterChange,
  onRowsPerPageChange
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [page, setPage] = useState(Math.max(0, (pagination.currentPage || 1) - 1)); // Convert 1-based to 0-based, ensure >= 0
  const [rowsPerPage, setRowsPerPage] = useState(pagination.limit || 1000);

  // Sync internal state with parent pagination state
  useEffect(() => {
    const zeroBasedPage = Math.max(0, (pagination.currentPage || 1) - 1);
    const maxPage = Math.max(0, Math.ceil((pagination.totalCount || transactions.length) / (pagination.limit || 1000)) - 1);
    const safePage = Math.min(zeroBasedPage, maxPage);
    
    console.log('🔄 TanStackTableTransactions pagination sync:', {
      parentCurrentPage: pagination.currentPage,
      parentTotalCount: pagination.totalCount,
      parentLimit: pagination.limit,
      zeroBasedPage,
      maxPage,
      safePage,
      transactionsLength: transactions.length
    });
    
    setPage(safePage);
    setRowsPerPage(pagination.limit || 1000);
  }, [pagination.currentPage, pagination.limit, pagination.totalCount, transactions.length]);

  // Calculate paginated transactions for display
  const paginatedTransactions = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginated = transactions.slice(startIndex, endIndex);
    
    console.log('📄 Client-side pagination:', {
      page,
      rowsPerPage,
      startIndex,
      endIndex,
      totalTransactions: transactions.length,
      paginatedCount: paginated.length
    });
    
    return paginated;
  }, [transactions, page, rowsPerPage]);

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format number with specified decimals
  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined) return '-';
    return parseFloat(num).toFixed(decimals);
  };

  // Define columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('date', {
        id: 'date',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            📅 Date
          </Box>
        ),
        cell: (info) => (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500,
              color: 'text.secondary',
              fontSize: '0.8rem'
            }}
          >
            {formatDate(info.getValue())}
          </Typography>
        ),
        enableSorting: true,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('asset_name', {
        id: 'asset_name',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            💰 Asset Name
          </Box>
        ),
        cell: (info) => (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '0.875rem'
            }}
          >
            {info.getValue() || '-'}
          </Typography>
        ),
        enableSorting: true,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('asset_type', {
        id: 'asset_type',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            🏷️ Type
          </Box>
        ),
        cell: (info) => (
          <Chip 
            label={info.getValue() || '-'} 
            size="small" 
            variant="outlined"
            color="primary"
            sx={{ 
              fontWeight: 500,
              fontSize: '0.75rem',
              height: '24px'
            }}
          />
        ),
        enableSorting: true,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('transaction_type', {
        id: 'transaction_type',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            🔄 Action
          </Box>
        ),
        cell: (info) => {
          const type = info.getValue()?.toLowerCase();
          const colorMap = {
            'buy': 'success',
            'sell': 'error',
            'deposit': 'info',
            'withdrawal': 'warning',
            'transfer': 'secondary'
          };
          const iconMap = {
            'buy': '📈',
            'sell': '📉',
            'deposit': '⬇️',
            'withdrawal': '⬆️',
            'transfer': '↔️'
          };
          return (
            <Chip 
              label={`${iconMap[type] || '📊'} ${info.getValue() || '-'}`}
              size="small" 
              color={colorMap[type] || 'default'}
              variant="filled"
              sx={{ 
                fontWeight: 600,
                fontSize: '0.75rem',
                height: '26px',
                '& .MuiChip-label': {
                  px: 1
                }
              }}
            />
          );
        },
        enableSorting: true,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('volume', {
        id: 'volume',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            📊 Volume
          </Box>
        ),
        cell: (info) => (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500,
              color: 'text.primary',
              fontSize: '0.875rem'
            }}
          >
            {formatNumber(info.getValue(), 4)}
          </Typography>
        ),
        enableSorting: true,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('item_price', {
        id: 'item_price',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            💵 Price
          </Box>
        ),
        cell: (info) => {
          const currency = info.row?.original?.currency || 'USD';
          const value = info.getValue();
          return (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500,
              color: 'text.primary',
              fontSize: '0.875rem'
            }}
          >
            {formatCurrency(Number(value || 0), currency)}
          </Typography>
          );
        },
        enableSorting: true,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('transaction_amount', {
        id: 'transaction_amount',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            💸 Amount
          </Box>
        ),
        cell: (info) => {
          const amount = info.getValue() || 0;
          const isPositive = amount >= 0;
          const currency = info.row?.original?.currency || 'USD';
          return (
            <Typography 
              variant="body2" 
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
                color: isPositive ? 'success.main' : 'error.main',
                backgroundColor: alpha(isPositive ? '#4caf50' : '#f44336', 0.1),
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'inline-block',
                minWidth: '60px',
                textAlign: 'center'
              }}
            >
              {isPositive ? '+' : ''}{formatCurrency(Number(amount), currency)}
            </Typography>
          );
        },
        enableSorting: true,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('currency', {
        id: 'currency',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            🌍 Currency
          </Box>
        ),
        cell: (info) => (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500,
              color: 'text.secondary',
              fontSize: '0.8rem'
            }}
          >
            {info.getValue() || 'USD'}
          </Typography>
        ),
        enableSorting: true,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('fee', {
        id: 'fee',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            💳 Fee
          </Box>
        ),
        cell: (info) => {
          const currency = info.row?.original?.currency || 'USD';
          const value = info.getValue();
          return (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500,
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            {formatCurrency(Number(value || 0), currency)}
          </Typography>
          );
        },
        enableSorting: true,
        enableGlobalFilter: true,
      }),
    ],
    []
  );

  // Transform transactions data
  const data = useMemo(() => {
    return paginatedTransactions.map((transaction, index) => ({
      id: transaction.id || transaction._id || index,
      date: transaction.date,
      asset_name: transaction.asset_name,
      asset_type: transaction.asset_type,
      transaction_type: transaction.transaction_type,
      volume: transaction.volume,
      item_price: transaction.item_price,
      transaction_amount: transaction.transaction_amount,
      currency: transaction.currency,
      fee: transaction.fee,
    }));
  }, [paginatedTransactions]);

  // Create table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: rowsPerPage,
      },
    },
  });

  // Handle page change
  const handleChangePage = (event, newPage) => {
    // Update local state for client-side pagination
    setPage(newPage);
    table.setPageIndex(newPage);
    
    // Don't call onPageChange for client-side pagination
    // The component handles pagination internally
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    table.setPageSize(newRowsPerPage);
    setPage(0);
    table.setPageIndex(0);
    
    // For client-side pagination, we don't need to call the parent
    // The component handles everything internally
  };

  // Handle sorting
  const handleSort = (columnId) => {
    const column = table.getColumn(columnId);
    if (column) {
      column.toggleSorting();
      if (onSortChange) {
        const sortInfo = column.getIsSorted();
        onSortChange({
          field: columnId,
          order: sortInfo === 'asc' ? 'asc' : 'desc'
        });
      }
    }
  };

  return (
    <Box className={styles.container}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 600, 
          color: 'primary.main',
        }}>
          📊 Transactions ({transactions.length})
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search transactions..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          <Tooltip title="Filter Options">
            <IconButton size="small">
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableCell
                      key={header.id}
                      sx={{
                        backgroundColor: alpha('#1976d2', 0.08),
                        borderBottom: '2px solid',
                        borderBottomColor: 'primary.main',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: 'primary.main',
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        '&:hover': header.column.getCanSort() ? {
                          backgroundColor: alpha('#1976d2', 0.12),
                        } : {},
                      }}
                      onClick={() => header.column.getCanSort() && handleSort(header.column.id)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <Box sx={{ ml: 1 }}>
                            {header.column.getIsSorted() === 'asc' ? (
                              <ArrowUpIcon fontSize="small" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ArrowDownIcon fontSize="small" />
                            ) : (
                              <Box sx={{ width: 16, height: 16 }} />
                            )}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    backgroundColor: index % 2 === 0 ? 'transparent' : alpha('#f5f5f5', 0.3),
                    '&:hover': {
                      backgroundColor: alpha('#1976d2', 0.04),
                      transition: 'background-color 0.2s ease',
                    },
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      sx={{
                        borderBottom: '1px solid',
                        borderBottomColor: alpha('#000', 0.08),
                        fontSize: '0.875rem',
                        padding: '8px 16px',
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={pagination.totalCount || transactions.length}
          page={Math.min(page, Math.max(0, Math.ceil((pagination.totalCount || transactions.length) / rowsPerPage) - 1))}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[25, 50, 100, 500, 1000]}
          sx={{
            borderTop: '2px solid',
            borderTopColor: 'divider',
            backgroundColor: alpha('#f5f5f5', 0.5),
          }}
        />
      </Paper>
    </Box>
  );
}
