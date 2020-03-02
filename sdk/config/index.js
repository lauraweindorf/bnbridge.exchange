import development from "./index.dev";
import production from "./index.prod";
const env = process.env.APP_ENV || 'development';

const config = {
    development,
    production
};

export default config[env];
