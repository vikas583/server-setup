import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { ThemeProvider } from '@emotion/react'
import { CssBaseline } from '@mui/material'
import theme from './common/theme.js';
createRoot(document.getElementById('root')!).render(

  // <StrictMode>
  
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  // </StrictMode>
)
