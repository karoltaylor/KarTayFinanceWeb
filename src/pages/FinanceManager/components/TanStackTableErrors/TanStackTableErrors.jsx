import React, { useState, useMemo } from 'react';
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
  Alert,
  AlertTitle,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import styles from './TanStackTableErrors.module.css';

const columnHelper = createColumnHelper();

export default function TanStackTableErrors({ 
  errors = [], 
  loading = false,
  walletId = null,
  walletName = null
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Define columns for error table
  const columns = useMemo(
    () => [
      columnHelper.accessor('wallet_info', {
        id: 'wallet_info',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            💼 Wallet
          </Box>
        ),
        cell: (info) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                color: 'primary.main',
                fontSize: '0.875rem'
              }}
            >
              {walletName || 'Unknown Wallet'}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.75rem',
                fontFamily: 'monospace'
              }}
            >
              ID: {walletId || 'N/A'}
            </Typography>
          </Box>
        ),
        enableSorting: false,
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
              fontSize: '0.875rem'
            }}
          >
            #{info.getValue()}
          </Typography>
        ),
        enableSorting: true,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('error_type', {
        id: 'error_type',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            ⚠️ Error Type
          </Box>
        ),
        cell: (info) => {
          const errorType = info.getValue()?.toLowerCase();
          const colorMap = {
            'validation': 'warning',
            'format': 'error',
            'missing': 'info',
            'duplicate': 'secondary',
            'invalid': 'error'
          };
          const iconMap = {
            'validation': '⚠️',
            'format': '❌',
            'missing': 'ℹ️',
            'duplicate': '🔄',
            'invalid': '🚫'
          };
          return (
            <Chip 
              label={`${iconMap[errorType] || '❓'} ${info.getValue() || 'Unknown'}`}
              size="small" 
              color={colorMap[errorType] || 'default'}
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
      columnHelper.accessor('error_message', {
        id: 'error_message',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            💬 Message
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
      columnHelper.accessor('field_name', {
        id: 'field_name',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            🏷️ Field
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
      columnHelper.accessor('value', {
        id: 'value',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            📊 Value
          </Box>
        ),
        cell: (info) => (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500,
              color: 'text.primary',
              fontSize: '0.875rem',
              maxWidth: 200,
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
      columnHelper.accessor('suggestion', {
        id: 'suggestion',
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            💡 Suggestion
          </Box>
        ),
        cell: (info) => (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 400,
              color: 'info.main',
              fontSize: '0.8rem',
              maxWidth: 250,
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

  // Transform errors data
  const data = useMemo(() => {
    return errors.map((error, index) => ({
      id: error.id || index,
      wallet_info: `${walletName || 'Unknown'} (${walletId || 'N/A'})`, // For global filtering
      row_number: error.row_number || error.line_number || index + 1,
      error_type: error.error_type || error.type || 'Unknown',
      error_message: error.error_message || error.message || 'No message provided',
      field_name: error.field_name || error.field || '-',
      value: error.value || error.invalid_value || '-',
      suggestion: error.suggestion || error.fix_suggestion || '-',
    }));
  }, [errors, walletId, walletName]);

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

  if (errors.length === 0) {
    return null;
  }

  return (
    <Box className={styles.container}>
      <Alert severity="warning" sx={{ mb: 2 }}>
        <AlertTitle>⚠️ Transaction Errors Detected</AlertTitle>
        Found {errors.length} error(s) in the uploaded data. Please review and fix these issues.
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          color: 'error.main',
        }}>
          🚨 Error Details ({errors.length})
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
          <Tooltip title="Filter Error Types">
            <IconButton size="small">
              <WarningIcon />
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
          count={errors.length}
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
