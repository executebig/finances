require('module-alias/register')

const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const minifyHTML = require('express-minify-html')
const compression = require('compression')
const sassMiddleware = require('node-sass-middleware')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const cors = require('cors')
const cron = require('cron').CronJob

const config = require('@config')

const middlewares = require('@libs/middlewares')
const helpers = require('@libs/helpers')
const TX = require('@libs/tx')
const passport = require('@services/passport')
const clog = require('@services/clog')

const app = express()
const hbs = exphbs.create({
  helpers: helpers,
  extname: '.hbs'
})
const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use(cors())
app.use(bodyParser.json())
app.use(
  minifyHTML({
    override: true,
    exception_url: false,
    htmlMinifier: {
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeEmptyAttributes: true,
      minifyJS: true
    }
  })
)
app.use(compression())
app.engine('.hbs', hbs.engine)
app.set('view engine', '.hbs')
app.use(
  sassMiddleware({
    src: path.join(__dirname, './styles'),
    dest: path.join(__dirname, '../static/assets/css'),
    outputStyle: 'compressed',
    prefix: '/static/assets/css/'
  })
)

app.use(middlewares.logger)
app.use(cookieParser())
app.use(
  expressSession({
    secret: config.sessionKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: false
    }
  })
)
app.use(passport.initialize())
app.use(passport.session()) // Persistent Sessions

app.use(
  '/static',
  express.static(path.join(__dirname, '../static'))
)

app.get('/', (req, res) => {
  const page = req.query.page ? Number(req.query.page) : 1
  const pageSize = 25

  require('@services/airtable')
    .getTx()
    .then((d) => {
      const totalPages = Math.ceil(d.length / pageSize)

      if (page > Math.ceil(d.length / pageSize)) {
        res.render('denied', { title: 'Access Denied' })
      } else {
        let pageData = d.slice((page - 1) * pageSize, page * pageSize)

        res.render('landing', {
          title: 'Transparent Finances',
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

app.get('/category/:category', (req, res) => {
  const category = req.params.category.toLowerCase()
  const slugify = (str) =>
    str
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '')

  require('@services/airtable')
    .getTx()
    .then((d) => {
      let filtered_data = d.filter(
        (tx) => slugify(tx.category) === category
      )

      res.render('landing', {
        title: 'Transaction Logs: #' + category,
        filtered: true,
        txs: filtered_data,
        balance: TX.sum(filtered_data),
        donation: TX.sumRev(filtered_data),
        expense: TX.sumExp(filtered_data),
        noPagination: true
      })
    })
})

app.get('/denied', (req, res) => {
  res.render('denied', { title: 'Access Denied' })
})
app.use('/api', require('@routes/api'))
app.use('/auth', require('@routes/auth'))
app.use(
  '/admin',
  middlewares.isUserAuthenticated,
  require('@routes/admin')
)

server.listen(config.port, () => {
  console.log(`Server started at ${config.host}`)
})

clog.start(io)

/** Synchronize all transactions @ 2am Eastern Time Every Day */

let dailySync = new cron(
  '0 0 2 * * *',
  () => {
    console.log('Executing daily sync...')

    const account = require('@services/account')
    account.getAccounts().then((allAccounts) => {
      allAccounts.forEach((acc) => {
        account.syncAccount(acc.id)
      })
    }).finally(() => {
      console.log('Daily sync complete!')
    })
  },
  null,
  true,
  'America/New_York'
)

dailySync.start()
