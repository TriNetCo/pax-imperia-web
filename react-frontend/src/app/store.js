import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import wsMiddleware from '../middleware/middleware';
import { websocketReducer } from '../modules/websocket';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    websocket: websocketReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(wsMiddleware),
});
