require('dotenv').config()

module.exports = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || "http://localhost:3000",
  sessionKey: process.env.SESSION_KEY,
  mercury: {
    key: process.env.MERCURY_KEY
  },
  airtable: {
    key: process.env.AIRTABLE_KEY,
    base: process.env.AIRTABLE_BASE
  },
  oauth: {
    client: process.env.OAUTH_CLIENT,
    secret: process.env.OAUTH_SECRET
  }
}
