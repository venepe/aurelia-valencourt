import { createSlice } from '@reduxjs/toolkit';
import supportsWebp from 'supports-webp';

const webpSlice = createSlice({
  name: 'webpSupport',
  initialState: { isSupported: true }, // Null means "checking..."
  reducers: {
    setWebPSupport: (state, action) => {
      state.isSupported = action.payload;
    },
  },
});

export const { setWebPSupport } = webpSlice.actions;

export const checkWebPSupportAsync = () => async (dispatch) => {
  if (typeof window === 'undefined') {
    return;
  }

  const isSupported = await supportsWebp;
  dispatch(setWebPSupport(isSupported));
};

export default webpSlice.reducer;
