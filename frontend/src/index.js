import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const root = ReactDOM.createRoot(document.getElementById('root'));

function ThemedApp() {
    const [mode, setMode] = React.useState('light');

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'light'
                        ? {
                            // Light mode colors
                            primary: {
                                main: '#2F6690',
                            },
                            background: {
                                default: '#f5f5f5',
                                paper: '#ffffff',
                            },
                        }
                        : {
                            // Dark mode colors
                            primary: {
                                main: '#90caf9',
                            },
                            background: {
                                default: '#121212',
                                paper: '#1e1e1e',
                            },
                        }),
                },
                typography: {
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                    h3: {
                        fontWeight: 700,
                    },
                },
                components: {
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                borderRadius: 12,
                            },
                        },
                    },
                },
            }),
        [mode]
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App mode={mode} setMode={setMode} />
        </ThemeProvider>
    );
}

root.render(
    <React.StrictMode>
        <ThemedApp />
    </React.StrictMode>
); 