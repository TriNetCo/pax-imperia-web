const getAppConfig = () => {
  const appEnv = process.env.REACT_APP_PAX_APP_ENV;

  switch (appEnv) {
    case 'dev':
    case 'test':
    case 'stage':
    case 'prod':
      return {
        APP_ENV:           appEnv,
        BUILD_VERSION:     process.env.REACT_APP_PAX_BUILD_VERSION,
        SOCKET_URL:        process.env.REACT_APP_PAX_SOCKET_URL,
        BACKEND_URL:       process.env.REACT_APP_PAX_BACKEND_URL,
        AUTH_DOMAIN:       process.env.REACT_APP_AUTH_DOMAIN,
        FIREBASE_API_KEY:  process.env.REACT_APP_PAX_FIREBASE_API_KEY,
        GOOGLE_PROJECT_ID: process.env.REACT_APP_PAX_GOOGLE_PROJECT_ID,
      };
    case 'local':
    default:
      return {
        APP_ENV:           appEnv ? appEnv : 'local',
        BUILD_VERSION:     process.env.REACT_APP_PAX_BUILD_VERSION,
        SOCKET_URL:        'ws://localhost:3001/websocket',
        BACKEND_URL:       'http://localhost:3001',
        AUTH_DOMAIN:       process.env.REACT_APP_AUTH_DOMAIN,
        FIREBASE_API_KEY:  process.env.REACT_APP_PAX_FIREBASE_API_KEY,
        GOOGLE_PROJECT_ID: process.env.REACT_APP_PAX_GOOGLE_PROJECT_ID,
      };
  }
};

export default getAppConfig();
