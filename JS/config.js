const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://boxes-app.onrender.com/api'
    : 'http://localhost:3000/api';

const config = {
    API_URL: process.env.NODE_ENV === 'production' 
        ? 'https://your-render-app.onrender.com'
        : 'http://localhost:3000'
};

export { API_URL };
export default config;