require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  mysql: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
  redisUrl: process.env.REDIS_URL,
  oauth: {
    tokenUrl: process.env.OAUTH_TOKEN_URL,
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    audience: process.env.OAUTH_AUDIENCE,
  },
};
