import { createSlice } from '@reduxjs/toolkit';

const LOCAL_STORAGE_KEY = 'preferredUnit';

const initialState = {
  unit: 'oz', // Default to 'oz' for SSR
};

const unitsOfMeasureSlice = createSlice({
  name: 'unitsOfMeasure',
  initialState,
  reducers: {
    setUnit: (state, action) => {
      state.unit = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, action.payload);
      }
    },
    toggleUnit: (state) => {
      state.unit = state.unit === 'oz' ? 'ml' : 'oz';
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, state.unit);
      }
    },
  },
});

// ** Async action to hydrate unit from localStorage on the client **
export const hydrateUnitAsync = () => async (dispatch) => {
  if (typeof window === 'undefined') {
    return; // Prevent execution on the server
  }

  const storedUnit = localStorage.getItem(LOCAL_STORAGE_KEY) || 'oz';
  dispatch(setUnit(storedUnit));
};

export const { setUnit, toggleUnit } = unitsOfMeasureSlice.actions;
export default unitsOfMeasureSlice.reducer;
