const express = require('express')
const app = express()
require('express-async-errors')
const cors = require('cors')
const middleware = require('./middleware/exceptionHandler')
const blogsRouter = require('./controllers/blogs')

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use('/api/blogs', blogsRouter)
app.use(middleware.errorHandler)
app.use(middleware.unkownEndpoint)

module.exports = app