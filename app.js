const express = require('express')
const app = express()
require('express-async-errors')
const cors = require('cors')
const middleware = require('./middleware/exceptionHandler')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use(middleware.errorHandler)
app.use(middleware.unkownEndpoint)

module.exports = app