// Stores user preferences in local storage
export default class Preferences {

    setPreference(key, value) {
        localStorage.setItem(key, value);
    }
}
