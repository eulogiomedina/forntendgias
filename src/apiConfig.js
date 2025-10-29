// apiConfig.js 
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
export const FEATURE_GAMIFY = process.env.REACT_APP_FEATURE_GAMIFY === "true";
export const APP_ENV = process.env.REACT_APP_ENV || "development";

export default API_URL;
