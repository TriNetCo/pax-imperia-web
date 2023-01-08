import { handleResponse, handleError } from "./apiUtils";
const baseUrl = process.env.REACT_APP_API_URL;

const headers = {}

function getHeaders() {
  let token = localStorage.getItem("currentUserToken");
  if (token) {
    headers.Authorization = "Bearer " + token
    // headers.Custom = "yes"
  }

  return headers;
}

export default {
  fetchAllUsers: function() {
    let params = {
      method: 'get',
      headers: new Headers(getHeaders()),
      mode: 'cors',
    }

    return fetch(baseUrl + "/users/", params)
      .then(handleResponse);
  },
  deleteUser: function(userId) {
    let params = { method: 'delete', headers: getHeaders() }
    return fetch(baseUrl + "/users/" + userId, params)
      .then(handleResponse)
      .catch(handleError);
  }
}