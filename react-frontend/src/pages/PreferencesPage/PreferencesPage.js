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
                FPS:
                <select name="fps" value={preferences.fps || ''} onChange={handlePreferenceChange}>
                    <option value="">-- Select a Framerate --</option>
                    <option value="60">60</option>
                    <option value="1">1</option>
                </select>
            </label>
            <br />
            <label>
                Language:
                <select name="language" value={preferences.language || ''} onChange={handlePreferenceChange}>
                    <option value="">-- Select a language --</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                </select>
            </label>
        </div>
    );
};

export default PreferencesPage;
