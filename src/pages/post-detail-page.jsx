import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate, useParams } from 'react-router-dom';
import AppHeader from '../components/common/app-header';
import PetAvatar from '../components/common/pet-avatar';
import CommentItem from '../components/ui/comment-item';
import ImageSlider from '../components/ui/image-slider';
import { useAuth } from '../hooks/use-auth';
import { addComment, deleteComment, fetchComments, toggleReaction } from '../utils/comments-api';
import { formatRelativeTime } from '../utils/format-date';
import { deletePost, fetchLikedPostIds, fetchPostById, setLike } from '../utils/posts-api';

/**
 * PostDetailPage 컴포넌트 — 게시물 상세 (댓글 · 답글 · 이모지 반응 · 더보기 메뉴)
 *
 * Props: 없음 (URL 파라미터 postId 사용)
 *
 * Example usage:
 * <Route path="/post/:postId" element={ <PostDetailPage /> } />
 */
function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, activePet } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [snack, setSnack] = useState('');
  const [hasError, setHasError] = useState(false);

  const loadComments = useCallback(async () => {
    const rows = await fetchComments(postId);
    setComments(rows);
    setPost((prev) => (prev ? { ...prev, comments_count: rows.length } : prev));
  }, [postId]);

  useEffect(() => {
    (async () => {
      try {
        const row = await fetchPostById(postId);
        setPost(row);
        if (activePet) {
          const liked = await fetchLikedPostIds(activePet.id, [row.id]);
          setIsLiked(liked.has(row.id));
        }
        await loadComments();
      } catch {
        setHasError(true);
      }
    })();
  }, [postId, activePet, loadComments]);

  if (hasError) {
    return (
      <Box>
        <AppHeader title="게시물" hasBack />
        <Typography sx={ { textAlign: 'center', py: 8, color: 'text.secondary' } }>
          게시물을 찾을 수 없습니다.
        </Typography>
      </Box>
    );
  }

  if (!post) {
    return (
      <Box sx={ { display: 'flex', justifyContent: 'center', py: 8 } }>
        <CircularProgress />
      </Box>
    );
  }

  const isMyPost = post.pet?.user_id === user?.id;
  const topComments = comments.filter((c) => !c.parent_comment_id);
  const repliesOf = (parentId) => comments.filter((c) => c.parent_comment_id === parentId);

  /** 좋아요 토글 (낙관적 업데이트) */
  const handleToggleLike = async () => {
    if (!activePet) return;
    const next = !isLiked;
    setIsLiked(next);
    setPost((prev) => ({ ...prev, likes_count: prev.likes_count + (next ? 1 : -1) }));
    try {
      await setLike(post.id, activePet.id, next);
    } catch {
      setIsLiked(!next);
      setPost((prev) => ({ ...prev, likes_count: prev.likes_count + (next ? -1 : 1) }));
    }
  };

  /** 댓글 · 답글 등록 */
  const handleSubmitComment = async (event) => {
    event.preventDefault();
    const content = commentText.trim();
    if (!content || !activePet) return;
    await addComment({
      postId: post.id,
      petId: activePet.id,
      content,
      parentCommentId: replyTo?.id ?? null,
    });
    setCommentText('');
    setReplyTo(null);
    await loadComments();
  };

  const handleDeleteComment = async (comment) => {
    await deleteComment(comment.id);
    await loadComments();
  };

  const handleToggleReaction = async (comment, emoji, isActive) => {
    if (!activePet) return;
    await toggleReaction(comment.id, activePet.id, emoji, isActive);
    await loadComments();
  };

  /** 게시물 링크 복사 */
  const handleCopyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/post/${post.id}`;
    await navigator.clipboard.writeText(url);
    setSnack('게시물 링크가 복사되었습니다');
    setMenuAnchor(null);
  };

  /** 게시물 삭제 */
  const handleDeletePost = async () => {
    await deletePost(post.id);
    navigate('/', { replace: true });
  };

  return (
    <Box sx={ { pb: replyTo ? 18 : 14 } }>
      <AppHeader title="게시물" hasBack>
        <IconButton onClick={ (event) => setMenuAnchor(event.currentTarget) } aria-label="더보기" sx={ { color: 'text.primary' } }>
          <MoreVertIcon />
        </IconButton>
      </AppHeader>

      {/* 작성 펫 프로필 */}
      <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5 } }>
        <Box
          onClick={ () => navigate(`/pet/${post.pet.id}`) }
          sx={ { display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', flexGrow: 1 } }
        >
          <PetAvatar pet={ post.pet } size={ 40 } />
          <Box>
            <Typography sx={ { fontSize: '0.9rem', fontWeight: 700 } }>{ post.pet.name }</Typography>
            <Typography sx={ { fontSize: '0.72rem', color: 'text.secondary' } }>
              { post.pet.species }{ post.pet.breed ? ` · ${post.pet.breed}` : '' }
            </Typography>
          </Box>
        </Box>
        <Typography sx={ { fontSize: '0.72rem', color: 'text.secondary' } }>
          { formatRelativeTime(post.created_at) }
        </Typography>
      </Box>

      <ImageSlider images={ post.images } />

      {/* 좋아요 · 댓글 수 */}
      <Box sx={ { display: 'flex', alignItems: 'center', px: 1, pt: 0.5 } }>
        <IconButton
          onClick={ handleToggleLike }
          aria-label="좋아요"
          sx={ { width: 44, height: 44, color: isLiked ? 'error.main' : 'text.primary' } }
        >
          { isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon /> }
        </IconButton>
        <Typography sx={ { fontSize: '0.85rem', fontWeight: 700, mr: 1.5 } }>{ post.likes_count }</Typography>
        <ChatBubbleOutlineIcon sx={ { fontSize: 22, mr: 0.7 } } />
        <Typography sx={ { fontSize: '0.85rem', fontWeight: 700 } }>{ post.comments_count }</Typography>
      </Box>

      {/* 본문 */}
      <Box sx={ { px: 2, pb: 2 } }>
        { post.caption && (
          <Typography sx={ { fontSize: '0.9rem', whiteSpace: 'pre-line' } }>{ post.caption }</Typography>
        ) }
        { post.hashtags?.length > 0 && (
          <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 } }>
            { post.hashtags.map((tag) => (
              <Chip
                key={ tag.id }
                label={ `#${tag.tag_name}` }
                size="small"
                onClick={ () => navigate('/explore') }
                sx={ { fontSize: '0.72rem', bgcolor: 'action.hover', color: 'primary.main', fontWeight: 700 } }
              />
            )) }
          </Box>
        ) }
        { post.location && (
          <Box sx={ { display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.8, color: 'text.secondary' } }>
            <PlaceOutlinedIcon sx={ { fontSize: 14 } } />
            <Typography sx={ { fontSize: '0.72rem' } }>{ post.location }</Typography>
          </Box>
        ) }
      </Box>

      {/* 댓글 목록 */}
      <Box sx={ { borderTop: 1, borderColor: 'divider', pt: 1 } }>
        <Typography sx={ { px: 2, py: 1, fontSize: '0.85rem', fontWeight: 900 } }>
          댓글 { post.comments_count }
        </Typography>
        { topComments.length === 0 && (
          <Typography sx={ { textAlign: 'center', py: 4, fontSize: '0.85rem', color: 'text.secondary' } }>
            첫 번째 댓글을 남겨보세요 🐾
          </Typography>
        ) }
        { topComments.map((comment) => (
          <Box key={ comment.id }>
            <CommentItem
              comment={ comment }
              myPetId={ activePet?.id }
              myUserId={ user?.id }
              onReply={ setReplyTo }
              onDelete={ handleDeleteComment }
              onToggleReaction={ handleToggleReaction }
            />
            { repliesOf(comment.id).map((reply) => (
              <CommentItem
                key={ reply.id }
                comment={ reply }
                myPetId={ activePet?.id }
                myUserId={ user?.id }
                isReply
                onDelete={ handleDeleteComment }
                onToggleReaction={ handleToggleReaction }
              />
            )) }
          </Box>
        )) }
      </Box>

      {/* 하단 고정 댓글 입력창 */}
      <Box
        sx={ {
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 480,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          zIndex: (theme) => theme.zIndex.appBar,
        } }
      >
        { replyTo && (
          <Box sx={ { display: 'flex', alignItems: 'center', px: 2, pt: 1, gap: 1 } }>
            <Typography sx={ { fontSize: '0.75rem', color: 'text.secondary', flexGrow: 1 } }>
              { replyTo.pet?.name }님에게 답글 남기는 중
            </Typography>
            <IconButton size="small" onClick={ () => setReplyTo(null) } aria-label="답글 취소">
              <CloseIcon sx={ { fontSize: 16 } } />
            </IconButton>
          </Box>
        ) }
        <Box component="form" onSubmit={ handleSubmitComment } sx={ { display: 'flex', alignItems: 'center', gap: 1, p: 1.5 } }>
          <PetAvatar pet={ activePet } size={ 32 } />
          <TextField
            value={ commentText }
            onChange={ (event) => setCommentText(event.target.value) }
            placeholder={ `${activePet?.name ?? '펫'}(으)로 댓글 달기...` }
            size="small"
            fullWidth
            slotProps={ { htmlInput: { maxLength: 500 } } }
          />
          <IconButton type="submit" color="primary" disabled={ !commentText.trim() } aria-label="댓글 등록" sx={ { width: 44, height: 44 } }>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>

      {/* 더보기 메뉴 */}
      <Menu anchorEl={ menuAnchor } open={ Boolean(menuAnchor) } onClose={ () => setMenuAnchor(null) }>
        { isMyPost && (
          <MenuItem onClick={ () => { setMenuAnchor(null); navigate(`/edit/${post.id}`); } }>
            수정
          </MenuItem>
        ) }
        { isMyPost && (
          <MenuItem onClick={ () => { setMenuAnchor(null); setIsDeleteOpen(true); } } sx={ { color: 'error.main' } }>
            삭제
          </MenuItem>
        ) }
        <MenuItem onClick={ handleCopyLink }>링크 복사 (공유)</MenuItem>
      </Menu>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={ isDeleteOpen } onClose={ () => setIsDeleteOpen(false) }>
        <DialogTitle sx={ { fontWeight: 900 } }>게시물을 삭제할까요?</DialogTitle>
        <DialogContent>
          <Typography sx={ { fontSize: '0.85rem', color: 'text.secondary' } }>
            삭제한 게시물과 댓글은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={ () => setIsDeleteOpen(false) }>취소</Button>
          <Button onClick={ handleDeletePost } color="error" variant="contained">삭제</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={ Boolean(snack) }
        autoHideDuration={ 2000 }
        onClose={ () => setSnack('') }
        message={ snack }
        anchorOrigin={ { vertical: 'bottom', horizontal: 'center' } }
      />
    </Box>
  );
}

export default PostDetailPage;
