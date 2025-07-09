import React, { useState, useRef, useEffect } from 'react';
import { TextField, Typography } from '@mui/material';
import R from '../../resources';

const AVTextInput = ({ label, onSubmit }) => {
  const [labelText, setLabelText] = useState(label ? label : R.strings.SEARCH_PLACEHOLDER);
  const [currentText, setCurrentText] = useState('');
  const ref = useRef();

  const handleTextChange = (event) => {
    setCurrentText(event.target.value);
  };

  const handleSubmit = (event) => {
    if (event.key === 'Enter') {
      // Prevent the default behavior (like form submission)
      event.preventDefault();
      onSubmit(currentText); // Emit the final message to the parent component
      setCurrentText(''); // Optionally, clear the input after submit
    }
  };

  // Focus input on component mount
  useEffect(() => {
    ref.current.focus(); // Focus the input field when the component renders
  }, []);

  return (
    <>
      <Typography
        variant="body2"
        sx={{
          color: '#ddd', // Label color
          fontWeight: 600,
          mb: 1, // Margin bottom to space out from the TextField
          whiteSpace: 'pre-line', // Ensures that line breaks are honored in the label
          textAlign: 'center', // Align label to the left
        }}
      >
        {labelText}
      </Typography>
      <TextField
        id="av-text-input"
        variant="filled"
        fullWidth
        value={currentText}
        onChange={handleTextChange}
        onKeyDown={handleSubmit}  // Using onKeyDown for Enter key detection
        multiline
        minRows={3}
        inputRef={ref} // Ref is forwarded here
        inputProps={{ 'aria-label': 'send', enterKeyHint: 'send' }}
        sx={{
          backgroundColor: '#212121', // Slight dark background for filled variant
          borderRadius: '8px', // Optional: add a border radius if needed
          '& .MuiFilledInput-root': {
            color: '#ddd', // Text color as per Typography
            fontWeight: 600,
            fontStyle: 'normal', // Match the typography style
            paddingTop: '8px', // Adjust padding to remove excess space
            caretColor: '#ddd',
            '&:hover': {
              backgroundColor: '#212121', // Darker background color on hover
            },
            '&.Mui-focused': {
              backgroundColor: '#212121', // Focused background color
              borderBottom: '2px solid #ddd',
              transition: 'border-bottom-color 0.3s ease',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#ddd', // Label color as per Typography
            fontWeight: 600,
          },
        }}
      />
    </>
  );
};

export default AVTextInput;
