import React, { useState, useEffect } from 'react';

const PreferencesPage = () => {
    const [preferences, setPreferences] = useState({});

    useEffect(() => {
        const storedPreferences = localStorage.getItem('preferences');
        if (storedPreferences) {
            setPreferences(JSON.parse(storedPreferences));
        }
    }, []);

    const handlePreferenceChange = (event) => {
        const { name, value } = event.target;
        setPreferences((prevPreferences) => ({
            ...prevPreferences,
            [name]: value,
        }));
    };

    useEffect(() => {
        localStorage.setItem('preferences', JSON.stringify(preferences));
    }, [preferences]);

    return (
        <div>
            <h1>Preferences</h1>
            <label>
                Galaxy FPS:
                <select name="fps" value={preferences.fps || ''} onChange={handlePreferenceChange}>
                    <option value="">-- Select a Framerate --</option>
                    <option value="60">60</option>
                    <option value="30">30</option>
                    <option value="15">15</option>
                    <option value="4">4</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                    <option value="0">0</option>
                </select>
            </label>
            <br />
            <label>
                Seed:
                <input type="text" id="seed" name="seed" value={preferences.seed || 'Axd2IJCs;s'} onInput={handlePreferenceChange}>
                </input>
            </label>
            <div><a href="/">Back</a></div>
        </div>
    );
};

export default PreferencesPage;
