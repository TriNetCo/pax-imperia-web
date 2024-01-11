import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import usersReducer from '../features/users/usersSlice';
import lobbiesReducer from '../features/lobbies/lobbiesSlice';
import socketMiddleware from '../modules/socketMiddleware';
import { websocketReducer } from '../modules/websocket';

const websocketFactory = (host) => {
    return new WebSocket(host);
};

export const store = configureStore({
    reducer: {
        counter: counterReducer,
        users: usersReducer,
        lobbies: lobbiesReducer,
        websocket: websocketReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(socketMiddleware(websocketFactory)),
});
