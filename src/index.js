require('module-alias/register')

const express = require('express')
const exphbs = require('express-handlebars')
const path = require("path")
const cookieSession = require('cookie-session')

const config = require('@config')

const middlewares = require('@libs/middlewares')
const helpers = require('@libs/helpers')
const passport = require("@services/passport")
const clog = require("@services/clog")
const tx = require("@libs/tx")

const app = express()
const hbs = exphbs.create({ helpers: helpers, extname: '.hbs' })
const server = require('http').createServer(app);
const io = require('socket.io')(server)

app.engine('.hbs', hbs.engine)
app.set('view engine', '.hbs')

app.use(middlewares.logger)

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.sessionKey]
  })
)
app.use(passport.initialize())
app.use(passport.session()) // Persistent Sessions

app.use('/static', express.static(path.join(__dirname, '../static')))

app.get('/', (req, res) => {
  require('@services/airtable').getTx().then((d) => {

    const stats = {
      balance: tx.sum(d),
      curMonthRev: tx.curMonthRev(d),
      curMonthExp: tx.curMonthExp(d)
    }

    res.render('landing', { title: 'Goblin', txs: d, stats: stats })
  })
})

app.get('/debug', (req, res) => {
  require('@services/airtable').getTx().then((d) => {
    res.json(d)
  })
})

app.use("/auth", require("@routes/auth"))
app.use("/admin", middlewares.isUserAuthenticated , require("@routes/admin"))

server.listen(config.port);

clog.start(io)