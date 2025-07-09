import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  didClickCtaLink: false,
};

const callToActionSlice = createSlice({
  name: 'callToAction',
  initialState,
  reducers: {
    setDidClickCtaLink: (state) => {
      state.didClickCtaLink = true;
    },
  },
});

export const { setDidClickCtaLink } = callToActionSlice.actions;
export default callToActionSlice.reducer;
