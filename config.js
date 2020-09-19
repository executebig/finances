require('dotenv').config()

module.exports = {
  port: process.env.PORT || 3000,
  mercury: {
    key: process.env.MERCURY_KEY
  },
  airtable: {
    key: process.env.AIRTABLE_KEY,
    base: process.env.AIRTABLE_BASE
  }
}
