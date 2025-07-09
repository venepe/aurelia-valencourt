import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTextChat, enableTextChat } from '../../store/reducers/textChatSlice';
import { IconButton, Snackbar, Alert } from '@mui/material';
import { Keyboard, Mic, MicOff } from '@mui/icons-material';

const TextChatToggleButton = ({ speechError }) => {
  const dispatch = useDispatch();
  const isTextChatEnabled = useSelector(state => state.textChat.isTextChatEnabled);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (speechError && speechError.length > 0) {
      dispatch(enableTextChat());
    }
  }, [speechError, dispatch]);

  const handleToggle = () => {
    if (speechError) {
      setShowError(true);
    } else {
      dispatch(toggleTextChat());
    }
  };

  const handleClose = () => {
    setShowError(false);
  };

  return (
    <>
      <IconButton
        onClick={handleToggle}
        color="primary"
        style={styles.button}
      >
        {speechError ? <MicOff /> : isTextChatEnabled ? <Mic /> : <Keyboard />}
      </IconButton>

      <Snackbar
        open={showError}
        autoHideDuration={8000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={handleClose} sx={{ width: '100%' }}>
          {speechError}
        </Alert>
      </Snackbar>
    </>
  );
};

const styles = {
  button: {
    display: 'flex',
    alignItems: 'center',
    color: '#ddd',
  },
};

export default TextChatToggleButton;
