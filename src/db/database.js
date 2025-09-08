// Database service using API calls to SQLite backend
import { dbHelpers } from './apiService';

// Re-export the API-based helpers to maintain compatibility
export { dbHelpers };

// For backward compatibility, also export as default
export default dbHelpers;
