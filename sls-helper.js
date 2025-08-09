require('dotenv').config();

module.exports.allowedOrigins = process.env.API_ALLOWED_ORIGIN_LIST
  ? process.env.API_ALLOWED_ORIGIN_LIST.split(',').map((o) => o.trim())
  : [];
