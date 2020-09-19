const logger = (req, res, next) => {
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

  next()
}

module.exports = { logger }