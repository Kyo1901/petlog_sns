import { useState } from 'react';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
} from '../../utils/recent-searches';

/**
 * SearchBar 컴포넌트 — 검색 입력창 + 최근 검색어 드롭다운
 * - 포커스 시 최근 검색어 목록 표시, 검색 실행 시 자동으로 최근 검색어에 저장
 *
 * Props:
 * @param {string} value - 검색창 입력값 [Required]
 * @param {function} onChange - 입력값 변경 시 실행 (새 문자열 전달) [Required]
 * @param {function} onSubmit - 검색 실행 시 실행 (검색어 전달) [Required]
 * @param {string} placeholder - 입력창 안내 문구 [Optional, 기본값: '해시태그, 펫 이름 검색']
 *
 * Example usage:
 * <SearchBar value={ keyword } onChange={ setKeyword } onSubmit={ handleSearch } />
 */
function SearchBar({ value, onChange, onSubmit, placeholder = '해시태그, 펫 이름 검색' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [recent, setRecent] = useState([]);

  const handleFocus = () => {
    setRecent(getRecentSearches());
    setIsOpen(true);
  };

  const handleSubmit = (keyword) => {
    const name = keyword.trim();
    if (!name) return;
    setRecent(addRecentSearch(name));
    setIsOpen(false);
    onSubmit(name);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit(value);
    }
  };

  return (
    <ClickAwayListener onClickAway={ () => setIsOpen(false) }>
      <Box sx={ { position: 'relative' } }>
        <TextField
          value={ value }
          onChange={ (event) => onChange(event.target.value) }
          onFocus={ handleFocus }
          onKeyDown={ handleKeyDown }
          placeholder={ placeholder }
          size="small"
          fullWidth
          slotProps={ {
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={ { fontSize: 20, color: 'text.secondary' } } />
                </InputAdornment>
              ),
              endAdornment: value ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={ () => onChange('') } aria-label="검색어 지우기">
                    <CloseIcon sx={ { fontSize: 18 } } />
                  </IconButton>
                </InputAdornment>
              ) : null,
              sx: { borderRadius: 3, bgcolor: 'action.hover' },
            },
          } }
        />

        { isOpen && recent.length > 0 && (
          <Paper
            elevation={ 4 }
            sx={ {
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              zIndex: 2,
              borderRadius: 2,
              overflow: 'hidden',
            } }
          >
            <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 1 } }>
              <Typography sx={ { fontSize: '0.78rem', fontWeight: 700, color: 'text.secondary' } }>
                최근 검색어
              </Typography>
              <Typography
                onClick={ () => setRecent(clearRecentSearches()) }
                sx={ { fontSize: '0.72rem', color: 'primary.main', fontWeight: 700, cursor: 'pointer' } }
              >
                모두 지우기
              </Typography>
            </Box>
            <List dense disablePadding>
              { recent.map((item) => (
                <ListItem
                  key={ item }
                  disablePadding
                  secondaryAction={ (
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={ () => setRecent(removeRecentSearch(item)) }
                      aria-label={ `${item} 삭제` }
                    >
                      <CloseIcon sx={ { fontSize: 16 } } />
                    </IconButton>
                  ) }
                >
                  <ListItemButton onClick={ () => handleSubmit(item) }>
                    <ListItemIcon sx={ { minWidth: 32 } }>
                      <HistoryIcon sx={ { fontSize: 18 } } />
                    </ListItemIcon>
                    <ListItemText
                      primary={ item }
                      slotProps={ { primary: { sx: { fontSize: '0.85rem' } } } }
                    />
                  </ListItemButton>
                </ListItem>
              )) }
            </List>
          </Paper>
        ) }
      </Box>
    </ClickAwayListener>
  );
}

export default SearchBar;
