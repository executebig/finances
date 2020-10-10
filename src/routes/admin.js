const express = require('express')
const multer = require('multer')
const mime = require('mime-types')
const app = express.Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './temp/uploaded')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(
      null,
      req.params.id +
        '-' +
        uniqueSuffix +
        '.' +
        mime.extension(file.mimetype)
    )
  }
})
const upload = multer({ storage: storage })

const account = require('@services/account')
const db = require('@services/airtable')
const clog = require('@services/clog')
const tx = require('@libs/tx')
const pathStore = require('@libs/pathstore')
const config = require('@config')
const { result } = require('lodash')

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
      txs: d
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

app.post(
  '/transactions/receipt/:id',
  upload.single('file'),
  (req, res) => {
    const fullUrl = config.host + '/uploads/' + pathStore.generatePath(req.file.filename)

    const data = {
      Receipt: [
        {
          url: fullUrl
        }
      ]
    }

    db.updateTx(req.params.id, data).finally(() => {
      res.status(200).send(req.file);
    })
  }
)

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
