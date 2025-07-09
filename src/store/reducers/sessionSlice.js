import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sessionId: null
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
    }
  }
});

export const { setSessionId } = sessionSlice.actions;
export default sessionSlice.reducer;
