const { request } = require("express")

const logger = (req, res, next) => {

  if (req.originalUrl.indexOf("/static") !== 0) {
    // Log all user access
    req.ip =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket
        ? req.connection.socket.remoteAddress
        : null)

    console.log(
      `User at ${req.ip} accessed ${req.originalUrl}`
    )
  }

  next()
}

// Middleware to check if the user is authenticated
const isUserAuthenticated = (req, res, next) => {
  if (req.user) {
    if (req.user._json.hd == 'executebig.org') {
      req.userData = {
        name: req.user._json.name,
        email: req.user._json.email,
        picture: req.user._json.picture
      }
      next()
    } else {
      res.redirect('/denied')
    }
  } else {
    res.redirect('/auth')
  }
}

module.exports = { logger, isUserAuthenticated }