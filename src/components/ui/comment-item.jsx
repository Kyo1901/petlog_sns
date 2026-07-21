import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import AddReactionOutlinedIcon from '@mui/icons-material/AddReactionOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import PetAvatar from '../common/pet-avatar';
import { formatRelativeTime } from '../../utils/format-date';

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '👍'];

/**
 * CommentItem 컴포넌트 — 댓글 1개 (이모지 반응 + 답글 버튼 + 삭제)
 *
 * Props:
 * @param {object} comment - 댓글 객체 (pet, reactions 포함) [Required]
 * @param {number} myPetId - 현재 선택된 내 펫 id [Required]
 * @param {string} myUserId - 로그인한 보호자 계정 id (내 댓글 판별용) [Required]
 * @param {boolean} isReply - 답글(대댓글) 여부 [Optional, 기본값: false]
 * @param {function} onReply - 답글 달기 클릭 시 실행 (comment 전달) [Optional]
 * @param {function} onDelete - 삭제 클릭 시 실행 (comment 전달) [Optional]
 * @param {function} onToggleReaction - 이모지 반응 토글 (comment, emoji, isActive 전달) [Required]
 * @param {function} onReport - 타인 댓글 신고 클릭 시 실행 (comment 전달, 없으면 버튼 숨김) [Optional]
 *
 * Example usage:
 * <CommentItem comment={ comment } myPetId={ 1 } onToggleReaction={ handleReaction } />
 */
function CommentItem({ comment, myPetId, myUserId, isReply = false, onReply, onDelete, onToggleReaction, onReport }) {
  const [anchorEl, setAnchorEl] = useState(null);

  /* 이모지별 집계: { emoji: { count, isMine } } */
  const reactionSummary = (comment.reactions ?? []).reduce((acc, reaction) => {
    const entry = acc[reaction.emoji] ?? { count: 0, isMine: false };
    entry.count += 1;
    if (reaction.pet_id === myPetId) entry.isMine = true;
    acc[reaction.emoji] = entry;
    return acc;
  }, {});

  const isMyComment = comment.pet?.user_id === myUserId;

  return (
    <Box sx={ { display: 'flex', gap: 1.5, pl: isReply ? 6 : 2, pr: 2, py: 1.2 } }>
      <PetAvatar pet={ comment.pet } size={ isReply ? 28 : 34 } />
      <Box sx={ { flexGrow: 1, minWidth: 0 } }>
        <Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
          <Typography sx={ { fontSize: '0.8rem', fontWeight: 700 } }>{ comment.pet?.name }</Typography>
          <Typography sx={ { fontSize: '0.68rem', color: 'text.secondary' } }>
            { formatRelativeTime(comment.created_at) }
          </Typography>
        </Box>
        <Typography sx={ { fontSize: '0.85rem', whiteSpace: 'pre-line', mt: 0.2 } }>
          { comment.content }
        </Typography>

        {/* 이모지 반응 + 액션 */}
        <Box sx={ { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 0.5 } }>
          { Object.entries(reactionSummary).map(([emoji, info]) => (
            <Chip
              key={ emoji }
              label={ `${emoji} ${info.count}` }
              size="small"
              onClick={ () => onToggleReaction(comment, emoji, info.isMine) }
              variant={ info.isMine ? 'filled' : 'outlined' }
              color={ info.isMine ? 'primary' : 'default' }
              sx={ { fontSize: '0.7rem', height: 22 } }
            />
          )) }
          <IconButton
            size="small"
            onClick={ (event) => setAnchorEl(event.currentTarget) }
            aria-label="이모지 반응 추가"
            sx={ { width: 26, height: 26, color: 'text.secondary' } }
          >
            <AddReactionOutlinedIcon sx={ { fontSize: 16 } } />
          </IconButton>
          { !isReply && onReply && (
            <Typography
              onClick={ () => onReply(comment) }
              sx={ { fontSize: '0.72rem', color: 'text.secondary', cursor: 'pointer', fontWeight: 700 } }
            >
              답글 달기
            </Typography>
          ) }
          { isMyComment && onDelete && (
            <IconButton
              size="small"
              onClick={ () => onDelete(comment) }
              aria-label="댓글 삭제"
              sx={ { width: 26, height: 26, color: 'text.secondary' } }
            >
              <DeleteOutlineIcon sx={ { fontSize: 16 } } />
            </IconButton>
          ) }
          { !isMyComment && onReport && (
            <IconButton
              size="small"
              onClick={ () => onReport(comment) }
              aria-label="댓글 신고"
              sx={ { width: 26, height: 26, color: 'text.secondary' } }
            >
              <FlagOutlinedIcon sx={ { fontSize: 16 } } />
            </IconButton>
          ) }
        </Box>

        <Menu anchorEl={ anchorEl } open={ Boolean(anchorEl) } onClose={ () => setAnchorEl(null) }>
          <Box sx={ { display: 'flex', px: 1 } }>
            { REACTION_EMOJIS.map((emoji) => (
              <MenuItem
                key={ emoji }
                onClick={ () => {
                  onToggleReaction(comment, emoji, reactionSummary[emoji]?.isMine ?? false);
                  setAnchorEl(null);
                } }
                sx={ { px: 1, fontSize: '1.1rem', minHeight: 40 } }
              >
                { emoji }
              </MenuItem>
            )) }
          </Box>
        </Menu>
      </Box>
    </Box>
  );
}

export default CommentItem;
