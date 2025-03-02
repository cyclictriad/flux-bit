import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  toasts: []
};

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (state, action) => {
      const toast = {
        id: Date.now(),
        type: action.payload.type || 'info',
        message: action.payload.message,
        duration: action.payload.duration !== undefined ? action.payload.duration : 5000
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearAllToasts: (state) => {
      state.toasts = [];
    }
  }
});

// Reusable toast helper functions
export const toastActions = {
  success: (message, duration) => addToast({ type: 'success', message, duration }),
  error: (message, duration) => addToast({ type: 'error', message, duration }),
  warning: (message, duration) => addToast({ type: 'warning', message, duration }),
  info: (message, duration) => addToast({ type: 'info', message, duration })
};

export const { addToast, removeToast, clearAllToasts } = toastSlice.actions;
export default toastSlice.reducer;
