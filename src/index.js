require('module-alias/register')

const express = require('express')
const exphbs = require('express-handlebars')
const config = require('@config')

const middlewares = require('@libs/middlewares')
const account = require('@services/account')
const helpers = require('@libs/helpers')
const path = require("path")

const app = express()
const hbs = exphbs.create({ helpers: helpers, extname: '.hbs' })

app.engine('.hbs', hbs.engine)
app.set('view engine', '.hbs')

app.use(middlewares.logger)

app.use('/static', express.static(path.join(__dirname, '../static')))

app.get('/', (req, res) => {
  res.render('landing', { title: 'Goblin' })
})

// list accounts
app.get('/sync', async (req, res) => {
  account
    .getAccounts()
    .then((allAccounts) => {
      console.log(allAccounts)
      allAccounts.forEach((acc) => {
        account.syncAccount(acc.id)
      })
    })
    .finally(() => {
      res.send('OK!')
    })
})

app.listen(config.port, () => {
  console.log(
    `Goblin is listening at http://localhost:${config.port}`
  )
})
