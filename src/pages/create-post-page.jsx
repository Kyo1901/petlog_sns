import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import { useNavigate, useParams } from 'react-router-dom';
import AppHeader from '../components/common/app-header';
import UnsplashPicker from '../components/ui/unsplash-picker';
import { useAuth } from '../hooks/use-auth';
import { createPost, fetchPostById, searchHashtags, updatePost } from '../utils/posts-api';

const MAX_IMAGES = 10;

/**
 * CreatePostPage 컴포넌트 — 게시물 작성 · 수정
 * ※ 수업 실습 단계: 사진 업로드 대신 Unsplash API 검색으로 이미지 URL을 저장
 *
 * Props: 없음 (URL 파라미터 postId 있으면 수정 모드)
 *
 * Example usage:
 * <Route path="/create" element={ <CreatePostPage /> } />
 */
function CreatePostPage() {
  const { postId } = useParams();
  const isEdit = Boolean(postId);
  const navigate = useNavigate();
  const { user, pets, activePet } = useAuth();

  const [petId, setPetId] = useState(activePet?.id ?? '');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [imageInput, setImageInput] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(!isEdit);

  /* 수정 모드 — 기존 게시물 불러오기 (내 게시물이 아니면 홈으로) */
  useEffect(() => {
    if (!isEdit || !user) return;
    (async () => {
      try {
        const post = await fetchPostById(postId);
        if (post.pet?.user_id !== user.id) {
          navigate('/', { replace: true });
          return;
        }
        setPetId(post.pet_id);
        setCaption(post.caption ?? '');
        setLocation(post.location ?? '');
        setImageUrls(post.images.map((image) => image.image_url));
        setTags(post.hashtags.map((tag) => tag.tag_name));
        setIsLoaded(true);
      } catch {
        navigate('/', { replace: true });
      }
    })();
  }, [isEdit, postId, user, navigate]);

  /** Unsplash에서 선택한 사진들 추가 */
  const handleAddFromUnsplash = (urls) => {
    setImageUrls((prev) => [...prev, ...urls].slice(0, MAX_IMAGES));
    setError('');
  };

  /** 이미지 URL 직접 추가 (보조 수단) */
  const handleAddImage = () => {
    const url = imageInput.trim();
    if (!url) {
      setError('이미지 URL을 입력한 뒤 추가 버튼을 눌러주세요. (Unsplash 검색 버튼을 이용하면 더 편해요)');
      return;
    }
    if (imageUrls.length >= MAX_IMAGES) {
      setError(`사진은 최대 ${MAX_IMAGES}장까지 추가할 수 있습니다.`);
      return;
    }
    setImageUrls((prev) => [...prev, url]);
    setImageInput('');
    setError('');
  };

  /** 해시태그 자동완성 옵션 검색 */
  const handleTagInput = async (event, value) => {
    const keyword = value.replace(/^#/, '');
    setTagOptions(keyword ? await searchHashtags(keyword) : []);
  };

  const handleSubmit = async () => {
    if (!petId) {
      setError('게시할 펫 프로필을 선택해주세요.');
      return;
    }
    if (imageUrls.length === 0) {
      setError('사진을 1장 이상 추가해주세요.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      if (isEdit) {
        await updatePost({ postId: Number(postId), caption, location, imageUrls, tagNames: tags });
        navigate(`/post/${postId}`, { replace: true });
      } else {
        await createPost({ petId, caption, location, imageUrls, tagNames: tags });
        navigate('/', { replace: true });
      }
    } catch (submitError) {
      setError(submitError.message ?? '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <Box sx={ { display: 'flex', justifyContent: 'center', py: 8 } }>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={ { pb: 6 } }>
      <AppHeader title={ isEdit ? '게시물 수정' : '새 게시물' } hasBack>
        <Button onClick={ handleSubmit } disabled={ isSaving } sx={ { fontWeight: 900 } }>
          { isSaving ? '저장 중...' : isEdit ? '수정' : '공유' }
        </Button>
      </AppHeader>

      <Box sx={ { p: 2, display: 'flex', flexDirection: 'column', gap: 2.5 } }>
        {/* 펫 프로필 선택 */}
        <TextField
          label="게시할 펫 프로필"
          value={ petId }
          onChange={ (event) => setPetId(Number(event.target.value)) }
          select
          disabled={ isEdit }
          fullWidth
          helperText={ isEdit ? '수정 시 펫 프로필은 변경할 수 없습니다' : undefined }
        >
          { pets.map((pet) => (
            <MenuItem key={ pet.id } value={ pet.id }>
              { pet.name } ({ pet.species })
            </MenuItem>
          )) }
        </TextField>

        {/* 이미지 추가 */}
        <Box>
          <Typography sx={ { fontSize: '0.85rem', fontWeight: 700, mb: 1 } }>
            사진 ({ imageUrls.length }/{ MAX_IMAGES })
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={ () => setIsPickerOpen(true) }
            disabled={ imageUrls.length >= MAX_IMAGES }
            startIcon={ <ImageSearchIcon /> }
            sx={ { py: 1.2, fontWeight: 700 } }
          >
            Unsplash에서 사진 검색해서 추가
          </Button>
          <Box sx={ { display: 'flex', gap: 1, mt: 1 } }>
            <TextField
              value={ imageInput }
              onChange={ (event) => setImageInput(event.target.value) }
              placeholder="또는 이미지 URL 직접 붙여넣기 (https://...)"
              size="small"
              fullWidth
              onKeyDown={ (event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleAddImage();
                }
              } }
            />
            <Button variant="outlined" onClick={ handleAddImage } sx={ { flexShrink: 0 } }>
              추가
            </Button>
          </Box>

          { imageUrls.length > 0 && (
            <Box sx={ { display: 'flex', gap: 1, overflowX: 'auto', mt: 1.5, pb: 1 } }>
              { imageUrls.map((url, index) => (
                <Box key={ `${url}-${index}` } sx={ { position: 'relative', flexShrink: 0 } }>
                  <Box
                    component="img"
                    src={ url }
                    alt={ `${index + 1}번째 사진` }
                    sx={ {
                      width: 88,
                      height: 88,
                      objectFit: 'cover',
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider',
                      display: 'block',
                    } }
                  />
                  <IconButton
                    size="small"
                    onClick={ () => setImageUrls((prev) => prev.filter((_, i) => i !== index)) }
                    aria-label="사진 제거"
                    sx={ {
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      bgcolor: 'background.paper',
                      border: 1,
                      borderColor: 'divider',
                      width: 22,
                      height: 22,
                      '&:hover': { bgcolor: 'background.paper' },
                    } }
                  >
                    <CloseIcon sx={ { fontSize: 13 } } />
                  </IconButton>
                </Box>
              )) }
            </Box>
          ) }
        </Box>

        {/* 본문 */}
        <TextField
          label="본문"
          value={ caption }
          onChange={ (event) => setCaption(event.target.value) }
          multiline
          rows={ 4 }
          fullWidth
          placeholder="우리 아이의 오늘을 기록해보세요"
          slotProps={ { htmlInput: { maxLength: 500 } } }
          helperText={ `${caption.length}/500` }
        />

        {/* 해시태그 (자동완성) */}
        <Autocomplete
          multiple
          freeSolo
          options={ tagOptions }
          value={ tags }
          onChange={ (event, next) => setTags(next.map((tag) => tag.replace(/^#/, ''))) }
          onInputChange={ handleTagInput }
          renderInput={ (params) => (
            <TextField
              { ...params }
              label="해시태그"
              placeholder="입력 후 Enter (예: 강아지, 산책)"
              helperText="# 없이 입력해도 자동으로 붙어요"
            />
          ) }
        />

        {/* 위치 태그 */}
        <TextField
          label="위치 (동 단위)"
          value={ location }
          onChange={ (event) => setLocation(event.target.value) }
          fullWidth
          placeholder="예: 역삼동"
          helperText="개인정보 보호를 위해 동 단위까지만 입력해주세요"
        />

        { error && <Alert severity="error">{ error }</Alert> }
      </Box>

      {/* Unsplash 사진 검색 다이얼로그 */}
      <UnsplashPicker
        isOpen={ isPickerOpen }
        onClose={ () => setIsPickerOpen(false) }
        onSelect={ handleAddFromUnsplash }
        maxCount={ MAX_IMAGES - imageUrls.length }
      />
    </Box>
  );
}

export default CreatePostPage;
