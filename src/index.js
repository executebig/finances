require('module-alias/register')

const express = require('express')
const exphbs = require('express-handlebars')
const path = require("path")
const cookieSession = require('cookie-session')
const minifyHTML = require('express-minify-html')
const compression = require('compression')
const sassMiddleware = require('node-sass-middleware')
const bodyParser = require('body-parser')
const cors = require('cors')

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
    res.render('landing', { title: 'Finances', txs: d })
  })
})

app.get("/denied", (req, res) => {
  res.render("denied", {title: "Access Denied"})
})
app.use("/api", require("@routes/api"))
app.use("/auth", require("@routes/auth"))
app.use("/admin", middlewares.isUserAuthenticated , require("@routes/admin"))

server.listen(config.port, () => {
  console.log(`Server started at ${config.host}`)
});

clog.start(io)