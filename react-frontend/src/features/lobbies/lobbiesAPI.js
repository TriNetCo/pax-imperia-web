import { handleResponse, handleError } from 'src/app/apiUtils';

const baseUrl = process.env.REACT_APP_PAX_BACKEND_URL;
const headers = new Headers();

function getHeaders() {
    let token = localStorage.getItem('currentUserToken');
    if (token) {
        headers.append('Authorization', 'Bearer ' + token);
    }

    return headers;
}

const lobbiesApi = {
    fetchAllLobbies: function() {
        let params = {
            method: 'get',
            cache: 'no-cache',
            headers: getHeaders(),
        };

        return fetch(baseUrl + '/lobbies/', params)
            .then(handleResponse);
    }
};

export default lobbiesApi;
