import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import usersReducer from '../features/users/usersSlice';
import socketMiddleware from '../middleware/socketMiddleware';
import { websocketReducer } from '../modules/websocket';

export const store = configureStore({
    reducer: {
        counter: counterReducer,
        users: usersReducer,
        websocket: websocketReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(socketMiddleware),
});
