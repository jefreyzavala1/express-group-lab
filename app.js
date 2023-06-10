const express = require('express')
const morgan = require('morgan')
const userRoutes = require('./routes/userRoutes')
const app = express()
const jsxEngine =  require('jsx-view-engine')

app.use(express.json())
app.use(express.static('public'))
app.use(morgan('combined'))
app.set('view engine','jsx')
app.engine('jsx',jsxEngine())
app.use('/users', userRoutes)

module.exports = app