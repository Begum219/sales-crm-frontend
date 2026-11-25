import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthProvider'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1E3A5F', // koyu lacivert
    },
    secondary: {
      main: '#4A90A4', // mavi-gri ton
    },
    background: {
      default: '#F4F6F8',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)