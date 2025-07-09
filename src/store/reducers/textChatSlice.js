import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isTextChatEnabled: false, // default to false, assuming chat is disabled initially
};

const textChatSlice = createSlice({
  name: 'textChat',
  initialState,
  reducers: {
    toggleTextChat: (state) => {
      state.isTextChatEnabled = !state.isTextChatEnabled;
    },
    enableTextChat: (state) => {
      state.isTextChatEnabled = true;
    },
    disableTextChat: (state) => {
      state.isTextChatEnabled = false;
    },
    setTextChatState: (state, action) => {
      state.isTextChatEnabled = action.payload;
    },
  },
});

export const { toggleTextChat, enableTextChat, disableTextChat, setTextChatState } = textChatSlice.actions;

export default textChatSlice.reducer;
