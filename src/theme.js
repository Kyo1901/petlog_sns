import { createTheme } from '@mui/material/styles';

/**
 * PetLog 디자인 시스템 테마
 * - 라이트: 포레스트 그린(#306D29) + 크림 아이보리(#FBF5DD)
 * - 다크: 딥 차콜 그린(#121712) + 라이트 그린(#6FBF63)
 */
export function getTheme(mode) {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: isDark
        ? { main: '#6FBF63', contrastText: '#0D1F0C' }
        : { main: '#306D29', dark: '#0D530E', contrastText: '#FFFFFF' },
      secondary: { main: '#E7E1B1', contrastText: '#233022' },
      background: isDark
        ? { default: '#121712', paper: '#1C231B' }
        : { default: '#FBF5DD', paper: '#FFFFFF' },
      divider: isDark ? '#2E362C' : '#E7E1B1',
      text: isDark
        ? { primary: '#F2EFE4', secondary: '#A8B3A4' }
        : { primary: '#233022', secondary: '#5C6B5A' },
    },
    typography: {
      fontFamily: '"Noto Sans KR", "Roboto", "Helvetica", "Arial", sans-serif',
      h5: { fontWeight: 900 },
      h6: { fontWeight: 700 },
      button: { fontWeight: 700 },
    },
    shape: { borderRadius: 12 },
    spacing: 8,
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none' },
        },
      },
    },
  });
}

export default getTheme;
