import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import { hasUnsplashKey, searchUnsplashPhotos } from '../../utils/unsplash-api';

/**
 * UnsplashPicker 컴포넌트 — Unsplash 사진 검색 · 다중 선택 다이얼로그
 *
 * Props:
 * @param {boolean} isOpen - 다이얼로그 표시 여부 [Required]
 * @param {function} onClose - 닫기 시 실행할 함수 [Required]
 * @param {function} onSelect - 선택 완료 시 실행할 함수 (imageUrl 배열 전달) [Required]
 * @param {number} maxCount - 선택 가능한 최대 장수 [Optional, 기본값: 10]
 *
 * Example usage:
 * <UnsplashPicker isOpen={ open } onClose={ handleClose } onSelect={ handleSelect } maxCount={ 5 } />
 */
function UnsplashPicker({ isOpen, onClose, onSelect, maxCount = 10 }) {
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState([]);
  const [selected, setSelected] = useState(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  /** 키워드 검색 실행 */
  const handleSearch = async () => {
    const keyword = query.trim();
    if (!keyword) {
      setError('검색어를 입력해주세요. (예: 강아지, cat)');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const result = await searchUnsplashPhotos(keyword);
      setPhotos(result.photos);
      setHasSearched(true);
      if (result.photos.length === 0) {
        setError('검색 결과가 없습니다. 다른 키워드로 검색해보세요.');
      }
    } catch (searchError) {
      setError(searchError.message);
    } finally {
      setIsLoading(false);
    }
  };

  /** 사진 선택 / 해제 토글 */
  const handleToggle = (photo) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(photo.id)) {
        next.delete(photo.id);
      } else if (next.size < maxCount) {
        next.set(photo.id, photo.imageUrl);
      }
      return next;
    });
  };

  /** 선택한 사진들을 부모로 전달하고 초기화 */
  const handleConfirm = () => {
    onSelect([...selected.values()]);
    handleClose();
  };

  const handleClose = () => {
    setSelected(new Map());
    setError('');
    onClose();
  };

  return (
    <Dialog open={ isOpen } onClose={ handleClose } fullWidth maxWidth="xs">
      <DialogTitle sx={ { fontWeight: 900, fontSize: '1.05rem' } }>
        Unsplash 사진 검색
      </DialogTitle>
      <DialogContent dividers sx={ { p: 2 } }>
        { !hasUnsplashKey() ? (
          <Alert severity="warning" sx={ { fontSize: '0.8rem' } }>
            Unsplash Access Key가 설정되지 않았습니다.
            <br />
            1. unsplash.com/developers 에서 앱을 만들어 키를 발급받고
            <br />
            2. 프로젝트 .env 파일에 VITE_UNSPLASH_ACCESS_KEY=발급받은키 를 추가한 뒤
            <br />
            3. 개발 서버를 다시 시작해주세요.
          </Alert>
        ) : (
          <>
            <Box sx={ { display: 'flex', gap: 1, mb: 2 } }>
              <TextField
                value={ query }
                onChange={ (event) => setQuery(event.target.value) }
                placeholder="검색어 (예: 강아지, puppy, cat)"
                size="small"
                fullWidth
                autoFocus
                onKeyDown={ (event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSearch();
                  }
                } }
              />
              <Button
                variant="contained"
                onClick={ handleSearch }
                disabled={ isLoading }
                startIcon={ <SearchIcon /> }
                sx={ { flexShrink: 0, fontWeight: 700 } }
              >
                검색
              </Button>
            </Box>

            { error && <Alert severity="info" sx={ { mb: 1.5, fontSize: '0.8rem' } }>{ error }</Alert> }

            { isLoading && (
              <Box sx={ { display: 'flex', justifyContent: 'center', py: 5 } }>
                <CircularProgress size={ 28 } />
              </Box>
            ) }

            { !isLoading && !hasSearched && !error && (
              <Typography sx={ { textAlign: 'center', py: 5, fontSize: '0.85rem', color: 'text.secondary' } }>
                키워드를 검색해 사진을 골라보세요 🐾
              </Typography>
            ) }

            { !isLoading && photos.length > 0 && (
              <Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' } }>
                { photos.map((photo) => {
                  const isSelected = selected.has(photo.id);
                  return (
                    <Box
                      key={ photo.id }
                      onClick={ () => handleToggle(photo) }
                      sx={ {
                        position: 'relative',
                        aspectRatio: '1 / 1',
                        cursor: 'pointer',
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        outline: isSelected ? 3 : 0,
                        outlineColor: 'primary.main',
                        outlineStyle: 'solid',
                      } }
                    >
                      <Box
                        component="img"
                        src={ photo.thumbUrl }
                        alt={ photo.description }
                        title={ photo.author ? `Photo by ${photo.author} on Unsplash` : undefined }
                        loading="lazy"
                        sx={ {
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          opacity: isSelected ? 0.75 : 1,
                          bgcolor: 'action.hover',
                        } }
                      />
                      { isSelected && (
                        <CheckCircleIcon
                          sx={ {
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            fontSize: 20,
                            color: 'primary.main',
                            bgcolor: 'background.paper',
                            borderRadius: '50%',
                          } }
                        />
                      ) }
                    </Box>
                  );
                }) }
              </Box>
            ) }
          </>
        ) }
      </DialogContent>
      <DialogActions sx={ { px: 2, py: 1.5 } }>
        <Typography sx={ { fontSize: '0.75rem', color: 'text.secondary', flexGrow: 1 } }>
          { selected.size }/{ maxCount }장 선택됨
        </Typography>
        <Button onClick={ handleClose }>취소</Button>
        <Button
          variant="contained"
          onClick={ handleConfirm }
          disabled={ selected.size === 0 }
          sx={ { fontWeight: 700 } }
        >
          추가하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UnsplashPicker;
