import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { createCollection, fetchCollections } from '../../utils/saved-api';

/**
 * SavePostSheet 컴포넌트 — 저장할 컬렉션 선택 다이얼로그
 * - 기본 저장(미분류) / 기존 컬렉션 선택 / 새 컬렉션 만들기
 *
 * Props:
 * @param {boolean} isOpen - 다이얼로그 표시 여부 [Required]
 * @param {function} onClose - 닫기 시 실행할 함수 [Required]
 * @param {function} onSave - 컬렉션 선택 시 실행 (collectionId 또는 null 전달) [Required]
 * @param {string} userId - 보호자 계정 id [Required]
 *
 * Example usage:
 * <SavePostSheet isOpen={ isOpen } onClose={ close } onSave={ handleSave } userId={ user.id } />
 */
function SavePostSheet({ isOpen, onClose, onSave, userId }) {
  const [collections, setCollections] = useState([]);
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;
    fetchCollections(userId).then(setCollections).catch(() => setCollections([]));
    setNewName('');
  }, [isOpen, userId]);

  /** 새 컬렉션 생성 후 바로 저장 */
  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setIsCreating(true);
    try {
      const collection = await createCollection(userId, name);
      onSave(collection.id);
    } catch {
      /* 생성 실패 시 시트 유지 */
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={ isOpen } onClose={ onClose } fullWidth maxWidth="xs">
      <DialogTitle sx={ { fontWeight: 900, fontSize: '1.05rem' } }>컬렉션에 저장</DialogTitle>
      <DialogContent sx={ { px: 0 } }>
        <List disablePadding>
          <ListItemButton onClick={ () => onSave(null) } sx={ { px: 3 } }>
            <ListItemIcon sx={ { minWidth: 40 } }>
              <BookmarkBorderIcon />
            </ListItemIcon>
            <ListItemText
              primary="기본 저장"
              secondary="컬렉션 없이 저장"
              slotProps={ {
                primary: { sx: { fontSize: '0.9rem', fontWeight: 700 } },
                secondary: { sx: { fontSize: '0.72rem' } },
              } }
            />
          </ListItemButton>
          { collections.map((collection) => (
            <ListItemButton key={ collection.id } onClick={ () => onSave(collection.id) } sx={ { px: 3 } }>
              <ListItemIcon sx={ { minWidth: 40 } }>
                <FolderOutlinedIcon />
              </ListItemIcon>
              <ListItemText
                primary={ collection.name }
                secondary={ `게시물 ${collection.saved_count}개` }
                slotProps={ {
                  primary: { sx: { fontSize: '0.9rem', fontWeight: 700 } },
                  secondary: { sx: { fontSize: '0.72rem' } },
                } }
              />
            </ListItemButton>
          )) }
        </List>

        {/* 새 컬렉션 만들기 */}
        <Box sx={ { display: 'flex', gap: 1, px: 3, pt: 1.5, alignItems: 'center' } }>
          <CreateNewFolderOutlinedIcon sx={ { color: 'text.secondary' } } />
          <TextField
            value={ newName }
            onChange={ (event) => setNewName(event.target.value) }
            placeholder="새 컬렉션 이름"
            size="small"
            fullWidth
            slotProps={ { htmlInput: { maxLength: 50 } } }
            onKeyDown={ (event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleCreate();
              }
            } }
          />
          <Button
            variant="contained"
            onClick={ handleCreate }
            disabled={ !newName.trim() || isCreating }
            sx={ { fontWeight: 700, flexShrink: 0 } }
          >
            만들기
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default SavePostSheet;
