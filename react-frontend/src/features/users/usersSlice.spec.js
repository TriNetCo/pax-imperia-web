import usersReducer, {
} from './usersSlice';

describe('counter reducer', () => {
    it('should handle initial state', () => {
        expect(usersReducer(undefined, { type: 'unknown' })).toEqual({
            'currentRequestId': undefined,
            'loading': 'idle',
            'users': [],
        });
    });
});
