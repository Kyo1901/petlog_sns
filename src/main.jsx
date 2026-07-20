import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import App from './App.jsx';
import { getTheme } from './theme.js';
import './index.css';

/** 시스템 다크모드 자동 감지 후 PetLog 테마 적용 */
function Root() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(() => getTheme(prefersDark ? 'dark' : 'light'), [prefersDark]);

  return (
    <ThemeProvider theme={ theme }>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
