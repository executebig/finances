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
  const page = req.query.page ? Number(req.query.page) : 1
  const pageSize = 25

  require('@services/airtable')
    .getTx({ showAll: true })
    .then((d) => {
      const totalPages = Math.ceil(d.length / pageSize)

      if (page > Math.ceil(d.length / pageSize)) {
        res.render('denied', { title: 'Access Denied' })
      } else {
        let pageData = d.slice((page - 1) * pageSize, page * pageSize)

        res.render('admin/transactions', {
          title: 'Transactions',
          txs: pageData,
          balance: TX.sum(d),
          donation: TX.curMonthRev(d),
          expense: TX.curMonthExp(d),
          nextPage: page + 1 <= totalPages ? page + 1 : -1,
          prevPage: page - 1 >= 1 ? page - 1 : -1
        })
      }
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

  let update = db.updateTx(req.params.id, data)
  update.then(() => {
    res.status(200).json({ success: true })
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
