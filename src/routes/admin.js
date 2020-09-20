const express = require("express")
const app = express.Router()

const account = require('@services/account')
const clog = require('@services/clog')

app.use(async (req, res, next) => {
    res.locals.layout = 'admin'
    res.locals.userData = req.user._json
    next()
})

app.get("/", (req, res) => {
    res.render('dashboard', { title: "Dashboard" })
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

module.exports = app