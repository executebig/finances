const express = require('express')
const app = express.Router()

const db = require('@services/airtable')
const tx = require('@libs/tx')

app.get('/stats', (req, res) => {
  db.getTx().then((d) => {
    const stats = {
      success: true,
      balance: tx.sum(d),
      curMonthRev: tx.curMonthRev(d),
      curMonthExp: tx.curMonthExp(d)
    }

    res.json(stats)
  })
})

module.exports = app
