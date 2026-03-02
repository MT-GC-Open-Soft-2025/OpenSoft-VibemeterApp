// Allow overriding the API base URL at build time via Vite env var
// Example: VITE_API_BASE_URL="http://localhost:8000"
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "https://api.wellbee.live";

export default baseUrl;
