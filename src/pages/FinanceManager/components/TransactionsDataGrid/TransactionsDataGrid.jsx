import React, { useState, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Chip, Typography, Paper, alpha } from '@mui/material';
import { formatCurrency } from '../../utils/financeUtils';
import styles from './TransactionsDataGrid.module.css';

export default function TransactionsDataGrid({ 
  transactions = [], 
  loading = false,
  pagination = {},
  onPageChange,
  onSortChange,
  onFilterChange
}) {
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);

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

  // Define columns for the DataGrid
  const columns = [
    {
      field: 'date',
      headerName: '📅 Date',
      width: 130,
      sortable: true,
      filterable: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            color: 'text.secondary',
            fontSize: '0.8rem'
          }}
        >
          {formatDate(params.value)}
        </Typography>
      ),
    },
    {
      field: 'asset_name',
      headerName: '💰 Asset Name',
      width: 160,
      sortable: true,
      filterable: true,
      headerAlign: 'left',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          noWrap
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            fontSize: '0.875rem'
          }}
        >
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'asset_type',
      headerName: '🏷️ Type',
      width: 130,
      sortable: true,
      filterable: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Chip 
          label={params.value || '-'} 
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
    },
    {
      field: 'transaction_type',
      headerName: '🔄 Action',
      width: 120,
      sortable: true,
      filterable: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const type = params.value?.toLowerCase();
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
            label={`${iconMap[type] || '📊'} ${params.value || '-'}`}
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
    },
    {
      field: 'volume',
      headerName: '📊 Volume',
      width: 120,
      sortable: true,
      filterable: true,
      type: 'number',
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            color: 'text.primary',
            fontSize: '0.875rem'
          }}
        >
          {formatNumber(params.value, 4)}
        </Typography>
      ),
    },
    {
      field: 'item_price',
      headerName: '💵 Price',
      width: 120,
      sortable: true,
      filterable: true,
      type: 'number',
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            color: 'text.primary',
            fontSize: '0.875rem'
          }}
        >
          ${formatNumber(params.value, 2)}
        </Typography>
      ),
    },
    {
      field: 'transaction_amount',
      headerName: '💸 Amount',
      width: 130,
      sortable: true,
      filterable: true,
      type: 'number',
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => {
        const amount = params.value || 0;
        const isPositive = amount >= 0;
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
            {isPositive ? '+' : ''}${formatNumber(amount, 2)}
          </Typography>
        );
      },
    },
    {
      field: 'currency',
      headerName: '🌍 Currency',
      width: 100,
      sortable: true,
      filterable: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            color: 'text.secondary',
            fontSize: '0.8rem'
          }}
        >
          {params.value || 'USD'}
        </Typography>
      ),
    },
    {
      field: 'fee',
      headerName: '💳 Fee',
      width: 100,
      sortable: true,
      filterable: true,
      type: 'number',
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            color: 'text.secondary',
            fontSize: '0.875rem'
          }}
        >
          ${formatNumber(params.value, 2)}
        </Typography>
      ),
    },
  ];

  // Transform transactions data for DataGrid
  const rows = useMemo(() => {
    return transactions.map((transaction, index) => ({
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
  }, [transactions]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (onPageChange) {
      onPageChange(newPage + 1); // Convert to 1-based page number
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
  };

  // Handle sorting change
  const handleSortModelChange = (model) => {
    if (onSortChange && model.length > 0) {
      const sort = model[0];
      onSortChange({
        field: sort.field,
        order: sort.sort === 'asc' ? 'asc' : 'desc'
      });
    }
  };

  // Handle filter change
  const handleFilterModelChange = (model) => {
    if (onFilterChange) {
      onFilterChange(model);
    }
  };

  return (
    <Box className={styles.container}>
      <Typography variant="h5" gutterBottom sx={{ 
        fontWeight: 600, 
        color: 'primary.main',
        mb: 2 
      }}>
        📊 Transactions ({transactions.length})
      </Typography>
      
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box className={styles.dataGridContainer}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={pageSize}
            page={page}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSortModelChange={handleSortModelChange}
            onFilterModelChange={handleFilterModelChange}
            rowsPerPageOptions={[10, 25, 50, 100]}
            paginationMode="server"
            sortingMode="server"
            filterMode="server"
            loading={loading}
            disableSelectionOnClick
            autoHeight
            density="comfortable"
            sx={{
              border: 'none',
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              
              // Custom header styling
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: alpha('#1976d2', 0.08),
                borderBottom: '2px solid',
                borderBottomColor: 'primary.main',
                '& .MuiDataGrid-columnHeader': {
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: alpha('#1976d2', 0.12),
                  },
                  '&.MuiDataGrid-columnHeader--sorted': {
                    backgroundColor: alpha('#1976d2', 0.15),
                  }
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 600,
                }
              },
              
              // Custom cell styling
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid',
                borderBottomColor: alpha('#000', 0.08),
                fontSize: '0.875rem',
                padding: '8px 16px',
                '&:focus': {
                  outline: 'none',
                },
                '&:focus-within': {
                  outline: 'none',
                }
              },
              
              // Row styling
              '& .MuiDataGrid-row': {
                '&:nth-of-type(even)': {
                  backgroundColor: alpha('#f5f5f5', 0.3),
                },
                '&:hover': {
                  backgroundColor: alpha('#1976d2', 0.04),
                  transition: 'background-color 0.2s ease',
                },
                '&.Mui-selected': {
                  backgroundColor: alpha('#1976d2', 0.08),
                  '&:hover': {
                    backgroundColor: alpha('#1976d2', 0.12),
                  }
                }
              },
              
              // Footer styling
              '& .MuiDataGrid-footerContainer': {
                borderTop: '2px solid',
                borderTopColor: 'divider',
                backgroundColor: alpha('#f5f5f5', 0.5),
                '& .MuiTablePagination-root': {
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                    fontWeight: 500,
                    color: 'text.secondary'
                  }
                }
              },
              
              // Loading overlay
              '& .MuiDataGrid-overlay': {
                backgroundColor: alpha('#fff', 0.8),
                '& .MuiCircularProgress-root': {
                  color: 'primary.main'
                }
              },
              
              // Filter panel styling
              '& .MuiDataGrid-filterForm': {
                backgroundColor: alpha('#f5f5f5', 0.8),
                borderRadius: 1,
                padding: 1,
                margin: 1
              },
              
              // Scrollbar styling
              '& .MuiDataGrid-virtualScroller': {
                '&::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: alpha('#f1f1f1', 0.5),
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: alpha('#1976d2', 0.3),
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: alpha('#1976d2', 0.5),
                  }
                }
              }
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
