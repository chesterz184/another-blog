var path = require('path')
var express = require('express')
var session = require('express-session')
var MongoStore = require('connect-mongo')(session)
var flash = require('connect-flash')
var config = require('config-lite')(__dirname)
var routes = require('./routes/')
var pkg = require('./package')
var formidable = require('express-formidable')
var sassMiddleware = require('node-sass-middleware')

var app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

var srcPath = __dirname + '/public/scss'
var destPath = __dirname + '/public/css'
app.use('/css', sassMiddleware({
	src: srcPath,
	dest: destPath,
	debug: true,
	outputStyle: 'compressed'
}))

app.use(express.static(path.join(__dirname, 'public')))

//session
app.use(session({
	name : config.session.key,
	secret : config.session.secret,
	resave : true,
	saveUninitialized: false,
	cookie: {
		maxAge: config.session.maxAge
	},
	store: new MongoStore({
		url: config.mongodb
	})
}))

//flash
app.use(flash())

//表单
app.use(formidable({
	uploadDir: path.join(__dirname, 'public/img'),
	keepExtensions: true //保留后缀
}))

//传入的全局属性
app.locals.blog = {
	title: pkg.name,
	description: pkg.description
}

app.use(function (req, res, next) {
	res.locals.user = req.session.user
	res.locals.success = req.flash('success').toString()
	res.locals.error = req.flash('error').toString()
	next()
})

routes(app)

app.listen(config.port, function() {
	console.log(`${pkg.name} listening on port ${config.port}`)
})

console.log('srcPath is ' + srcPath)
console.log('destPath is ' + destPath)