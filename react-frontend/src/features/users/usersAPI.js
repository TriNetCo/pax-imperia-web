import { handleResponse, handleError } from './apiUtils';
const baseUrl = process.env.REACT_APP_PAX_BACKEND_URL;

const headers = new Headers();

function getHeaders() {
    let token = localStorage.getItem('currentUserToken');
    if (token) {
        headers.append('Authorization', 'Bearer ' + token);
    }

    return headers;
}

const usersApi = {
    fetchAllUsers: function() {
        let params = {
            method: 'get',
            cache: 'no-cache',
            headers: getHeaders(),
        };

        return fetch(baseUrl + '/users/', params)
            .then(handleResponse);
    },
    deleteUser: function(userId) {
        let params = { method: 'delete', headers: getHeaders() };
        return fetch(baseUrl + '/users/' + userId, params)
            .then(handleResponse)
            .catch(handleError);
    }
};

export default usersApi;
