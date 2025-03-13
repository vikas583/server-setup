// SnackbarProvider.tsx
import { createContext, useState, ReactNode, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertColor } from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import { CircleRightIcon } from '../assets/icons/circleRightIcon';

// Define the type for the context value
interface SnackbarContextType {
    showSnackbar: (message: string, severity?: AlertColor) => void;
}

// Create the context
const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

// Global variable to hold the snackbar function
let globalShowSnackbar: SnackbarContextType['showSnackbar'] | null = null;

// Custom styled Alert component
const CustomAlert = styled(MuiAlert)(({ theme }) => ({
    backgroundColor: '#000', // Black background
    color: theme.palette.getContrastText('#000'), // Text color
    '& .MuiAlert-icon': {
        color: theme.palette.getContrastText('#000'), // Icon color
    },
    maxWidth: '350px',
    wordWrap: 'break-word',
}));

// SnackbarProvider component
const SnackbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: AlertColor;
    }>({
        open: false,
        message: '',
        severity: 'info',
    });

    const showSnackbar = (message: string, severity: AlertColor = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Expose the showSnackbar function globally
    useEffect(() => {
        globalShowSnackbar = showSnackbar;
        return () => {
            globalShowSnackbar = null; // Clean up on unmount
        };
    }, []);

    // Function to get the appropriate icon based on severity
    const getIcon = (severity: AlertColor) => {
        switch (severity) {
            case 'success':
                return <CircleRightIcon fill='white' />;
            case 'error':
                return <ErrorIcon />;
            case 'warning':
                return <WarningIcon />;
            case 'info':
            default:
                return <InfoIcon />;
        }
    };

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <CustomAlert
                    onClose={handleClose}
                    severity={snackbar.severity}
                    icon={getIcon(snackbar.severity)}
                    sx={{ width: '100%', display:'flex', alignItems:'center', whiteSpace:'pre-wrap' }}
                >
                    {snackbar.message}
                </CustomAlert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
};

// Global function to show snackbar
export const showGlobalSnackbar = (message: string, severity: AlertColor = 'info') => {
    if (globalShowSnackbar) {
        globalShowSnackbar(message, severity);
    } else {
        console.error('SnackbarProvider is not mounted.');
    }
};

export default SnackbarProvider;