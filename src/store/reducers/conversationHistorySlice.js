import { createSlice } from '@reduxjs/toolkit';

const conversationHistorySlice = createSlice({
  name: 'conversationHistory',
  initialState: {
    history: [],
  },
  reducers: {
    setConversationHistory: (state, action) => {
      state.history = [...action.payload];
    },
    clearConversationHistory: (state) => {
      state.history = [];
    },
  },
});

export const { setConversationHistory, clearConversationHistory } = conversationHistorySlice.actions;

export default conversationHistorySlice.reducer;
