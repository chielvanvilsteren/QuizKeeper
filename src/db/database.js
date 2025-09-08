// Database service using Supabase for direct database access
import { dbHelpers } from './supabaseService';

// Re-export the Supabase-based helpers
export { dbHelpers };

// For backward compatibility, also export as default
export default dbHelpers;
