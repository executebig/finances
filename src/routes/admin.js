const express = require('express')
const app = express.Router()

const account = require('@services/account')
const db = require('@services/airtable')
const clog = require('@services/clog')
const tx = require('@libs/tx')

app.use(async (req, res, next) => {
  res.locals.layout = 'admin'
  res.locals.userData = req.user._json
  next()
})

app.get('/', (req, res) => {
  res.render('admin/dashboard', {
    title: 'Dashboard',
    showLogs: true
  })
})

app.get('/transactions', (req, res) => {
  require('@services/airtable')
    .getTx({ showAll: true })
    .then((d) => {
      const stats = {
        balance: tx.sum(d),
        curMonthRev: tx.curMonthRev(d),
        curMonthExp: tx.curMonthExp(d)
      }

      res.render('admin/transactions', {
        title: 'Transactions',
        txs: d,
        stats: stats
      })
    })
})

// list accounts
app.get('/sync', async (req, res) => {
  account
    .getAccounts()
    .then((allAccounts) => {
      allAccounts.forEach((acc) => {
        account.syncAccount(acc.id)
      })
    })
    .finally(() => {
      res.send('OK!')
    })
})

app.get('/clearCache', (req, res) => {
  db.clearCache()
  res.send('OK!')
})

module.exports = app
