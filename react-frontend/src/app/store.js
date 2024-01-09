import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import usersReducer from '../features/users/usersSlice';
import lobbiesReducer from '../features/lobbies/lobbiesSlice';
import socketMiddleware from '../middleware/socketMiddleware';
import { websocketReducer } from '../modules/websocket';

export const store = configureStore({
    reducer: {
        counter: counterReducer,
        users: usersReducer,
        lobbies: lobbiesReducer,
        websocket: websocketReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(socketMiddleware),
});
