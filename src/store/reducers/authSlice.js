import { createSlice } from '@reduxjs/toolkit';
import { useEffect } from 'react';

// Initial state with default values (not accessing localStorage here)
const initialState = {
  isAuthenticated: false,
  token: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);  // Save token to localStorage
        localStorage.setItem('refresh-token', action.payload.refreshToken);  // Save refresh token to localStorage
      }
    },
    logout(state) {
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');  // Remove token from localStorage
        localStorage.removeItem('refresh-token');  // Remove refresh token from localStorage
      }
    },
    renewToken(state, action) {
      state.token = action.payload.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);  // Update token in localStorage
      }
    },
    setInitialState(state, action) {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
  },
});

export const { login, logout, renewToken, setInitialState } = authSlice.actions;
export default authSlice.reducer;

// Hook to load the token from localStorage on the client side
export function useLoadAuthState(dispatch) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refresh-token');

      if (storedToken) {
        dispatch(
          setInitialState({
            isAuthenticated: true,
            token: storedToken,
            refreshToken: storedRefreshToken,
          })
        );
      }
    }
  }, [dispatch]);
}
