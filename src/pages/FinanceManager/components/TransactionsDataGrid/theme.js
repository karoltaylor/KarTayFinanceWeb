import { createTheme } from '@mui/material/styles';

// Custom theme configuration for the DataGrid
export const dataGridTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        columnHeaders: {
          backgroundColor: 'rgba(25, 118, 210, 0.08)',
          borderBottom: '2px solid #1976d2',
        },
        columnHeader: {
          fontWeight: 600,
          fontSize: '0.875rem',
          color: '#1976d2',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.12)',
          },
          '&.MuiDataGrid-columnHeader--sorted': {
            backgroundColor: 'rgba(25, 118, 210, 0.15)',
          },
        },
        cell: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          fontSize: '0.875rem',
          padding: '8px 16px',
        },
        row: {
          '&:nth-of-type(even)': {
            backgroundColor: 'rgba(245, 245, 245, 0.3)',
          },
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
            transition: 'background-color 0.2s ease',
          },
        },
        footerContainer: {
          borderTop: '2px solid #e0e0e0',
          backgroundColor: 'rgba(245, 245, 245, 0.5)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '0.75rem',
        },
        label: {
          paddingLeft: '8px',
          paddingRight: '8px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

// Alternative dark theme
export const dataGridDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
    },
    secondary: {
      main: '#f48fb1',
      light: '#fce4ec',
      dark: '#ad1457',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          backgroundColor: '#1e1e1e',
          color: '#ffffff',
        },
        columnHeaders: {
          backgroundColor: 'rgba(144, 202, 249, 0.08)',
          borderBottom: '2px solid #90caf9',
        },
        columnHeader: {
          color: '#90caf9',
          '&:hover': {
            backgroundColor: 'rgba(144, 202, 249, 0.12)',
          },
        },
        cell: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        },
        row: {
          '&:nth-of-type(even)': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
          '&:hover': {
            backgroundColor: 'rgba(144, 202, 249, 0.08)',
          },
        },
      },
    },
  },
});
