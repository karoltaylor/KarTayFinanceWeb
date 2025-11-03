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
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { formatCurrency } from '../../utils/financeUtils';
import {
  Search as SearchIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import { getUnprocessedTransactionErrors, getWalletTransactionErrors } from '../../../../services/api';
import logger from '../../../../services/logger';
import styles from './TanStackTableUnprocessedErrors.module.css';

const columnHelper = createColumnHelper();

export default function TanStackTableUnprocessedErrors({ walletId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  console.log('🔍 TanStackTableUnprocessedErrors render - data length:', data.length, 'loading:', loading, 'error:', error);
  console.log('🔍 TanStackTableUnprocessedErrors render - data:', data);
  console.log('🔍 TanStackTableUnprocessedErrors render - will show success message:', data.length === 0 && !loading && !error);

  // Fetch unprocessed errors (scoped to wallet when provided)
  const fetchUnprocessedErrors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📥 Fetching transaction errors...', { walletId });
      const response = walletId 
        ? await getWalletTransactionErrors(walletId)
        : await getUnprocessedTransactionErrors();
      
      console.log('🔍 Raw API response:', response);
      console.log('🔍 Response type:', typeof response);
      console.log('🔍 Response keys:', Object.keys(response || {}));
      
      // Transform the response data - try multiple possible structures
      let errors = [];
      
      if (Array.isArray(response)) {
        // Response is directly an array
        errors = response;
        console.log('🔍 Response is direct array');
      } else if (response?.errors) {
        // Response has errors property
        errors = response.errors;
        console.log('🔍 Response has errors property');
      } else if (response?.data) {
        // Response has data property
        errors = response.data;
        console.log('🔍 Response has data property');
      } else if (response?.transaction_errors) {
        // Response has transaction_errors property
        errors = response.transaction_errors;
        console.log('🔍 Response has transaction_errors property');
      } else {
        console.log('🔍 Unknown response structure, trying to extract any array');
        // Try to find any array in the response
        for (const key in response) {
          if (Array.isArray(response[key])) {
            errors = response[key];
            console.log(`🔍 Found array in key: ${key}`);
            break;
          }
        }
      }
      
      console.log('🔍 Final extracted errors array:', errors);
      console.log('🔍 Errors array length:', errors.length);
      console.log('🔍 First error (if any):', errors[0]);
      
      setData(errors);
      
      console.log('✅ Unprocessed errors loaded:', errors.length);
      console.log('🔍 Unprocessed errors data:', errors);
      console.log('🔍 Full response:', response);
      logger.transaction('Unprocessed errors loaded successfully', walletId || null, {
        error_count: errors.length
      });
    } catch (err) {
      console.error('❌ Error fetching transaction errors:', err);
      setError('Failed to load transaction errors. Please try again.');
      logger.error('transaction', 'Failed to fetch transaction errors', { wallet_id: walletId }, err);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or walletId changes
  useEffect(() => {
    fetchUnprocessedErrors();
  }, [walletId]);

  // Define columns for unprocessed errors table
  const columns = useMemo(
    () => [
      columnHelper.accessor('wallet_id', {
        id: 'wallet_id',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            💼 Wallet ID
          </Box>
        ),
        cell: (info) => (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              color: 'primary.main',
              fontSize: '0.875rem',
              fontFamily: 'Monaco, Courier New, monospace'
            }}
          >
            {info.getValue() || 'N/A'}
          </Typography>
        ),
        enableSorting: true,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('row_number', {
        id: 'row_number',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            📍 Row
          </Box>
        ),
        cell: (info) => (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '0.875rem',
              fontFamily: 'Monaco, Courier New, monospace'
            }}
          >
            #{info.getValue()}
          </Typography>
        ),
        enableSorting: true,
        enableGlobalFilter: true,
      }),
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
            {info.getValue() || '-'}
          </Typography>
        ),
        enableSorting: true,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('asset_name', {
        id: 'asset_name',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            💰 Asset
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
      columnHelper.accessor('transaction_type', {
        id: 'transaction_type',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            🔄 Type
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
              fontSize: '0.875rem',
              fontFamily: 'Monaco, Courier New, monospace'
            }}
          >
            {info.getValue() || '-'}
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
              fontSize: '0.875rem',
              fontFamily: 'Monaco, Courier New, monospace'
            }}
          >
            {value == null ? '-' : formatCurrency(Number(value), currency)}
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
                textAlign: 'center',
                fontFamily: 'Monaco, Courier New, monospace'
              }}
            >
              {isPositive ? '+' : ''}{formatCurrency(Number(amount), currency)}
            </Typography>
          );
        },
        enableSorting: true,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('error_message', {
        id: 'error_message',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            ⚠️ Error
          </Box>
        ),
        cell: (info) => (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500,
              color: 'error.main',
              fontSize: '0.875rem',
              maxWidth: 300,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={info.getValue()}
          >
            {info.getValue() || '-'}
          </Typography>
        ),
        enableSorting: true,
        enableGlobalFilter: true,
      }),
    ],
    []
  );

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
    setPage(newPage);
    table.setPageIndex(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    table.setPageSize(newRowsPerPage);
    setPage(0);
    table.setPageIndex(0);
  };

  // Handle sorting
  const handleSort = (columnId) => {
    const column = table.getColumn(columnId);
    if (column) {
      column.toggleSorting();
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchUnprocessedErrors();
  };

  if (loading) {
    return (
      <Box className={styles.container}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading unprocessed errors...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={styles.container}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Error Loading Unprocessed Errors</AlertTitle>
          {error}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box className={styles.container}>
        <Alert severity="success" sx={{ mb: 2 }}>
          <AlertTitle>✅ No Transaction Errors for this Wallet</AlertTitle>
          All transactions have been processed successfully for the selected wallet.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className={styles.container}>
      <Alert severity="warning" sx={{ mb: 2 }}>
        <AlertTitle>⚠️ Transaction Errors for Selected Wallet</AlertTitle>
        Found {data.length} transaction(s) that could not be processed for this wallet. Please review and fix these issues.
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 600, 
          color: 'error.main',
        }}>
          🚨 Unprocessed Errors ({data.length})
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search errors..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />
          <Tooltip title="Refresh Data">
            <IconButton size="small" onClick={handleRefresh}>
              <RefreshIcon />
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
          borderColor: 'error.light'
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
                        backgroundColor: alpha('#f44336', 0.08),
                        borderBottom: '2px solid',
                        borderBottomColor: 'error.main',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: 'error.main',
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        '&:hover': header.column.getCanSort() ? {
                          backgroundColor: alpha('#f44336', 0.12),
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
                    backgroundColor: index % 2 === 0 ? 'transparent' : alpha('#ffebee', 0.3),
                    '&:hover': {
                      backgroundColor: alpha('#f44336', 0.04),
                      transition: 'background-color 0.2s ease',
                    },
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      sx={{
                        borderBottom: '1px solid',
                        borderBottomColor: alpha('#f44336', 0.2),
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
          count={data.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: '2px solid',
            borderTopColor: 'error.light',
            backgroundColor: alpha('#ffebee', 0.5),
          }}
        />
      </Paper>
    </Box>
  );
}
