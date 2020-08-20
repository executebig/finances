const express = require('express')
const fetch = require('node-fetch')
const config = require('./config')

const app = express()

const MERCURY_URL = 'https://backend.mercury.com/api/v1'

app.use((req, res, done) => {
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
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/accounts', (req, res) => {
  fetch(`${MERCURY_URL}/accounts`, {
    method: 'get',
    withCredentials: true,
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${config.mercury.key}`,
      accept: 'application/json'
    }
  })
    .then((json) => json.json())
    .then((data) => {
      data.accounts.forEach(function (v) {
        delete v.accountNumber
        delete v.routingNumber
      })

      res.json(data)
    })
})

app.listen(config.port, () => {
  console.log(
    `Goblin is listening at http://localhost:${config.port}`
  )
})
