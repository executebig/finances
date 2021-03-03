const express = require('express')
const app = express.Router()

const account = require('@services/account')
const db = require('@services/airtable')
const TX = require('@libs/tx')

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
  db.getTx({ showAll: true }).then((d) => {
    res.render('admin/transactions', {
      title: 'Transactions',
      txs: d,
      balance: TX.sum(d),
      donation: TX.curMonthRev(d),
      expenditure: TX.curMonthExp(d)
    })
  })
})

app.get('/transactions/:id', (req, res) => {
  db.findTxById(req.params.id).then((d) => {
    res.render('admin/transaction-single', {
      title: `Tx #${d['Tx ID']}`,
      tx: d
    })
  })
})

app.post('/transactions/:id', (req, res) => {
  db.updateTx(req.params.id, req.body)
  db.clearCache()
})

app.post('/transactions/receipt/:id', (req, res) => {
  const data = {
    Receipt: [
      {
        url: req.body.receipt
      }
    ]
  }

  db.updateTx(req.params.id, data).then(() => {
    res.status(200)
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
