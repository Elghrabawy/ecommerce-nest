import { config } from 'dotenv';

// Load environment variables once, centrally
const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';

config({ path: envFile });

export default envFile;
