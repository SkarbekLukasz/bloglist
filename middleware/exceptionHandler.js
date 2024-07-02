const User = require('../models/user')
const logger = require('../utils/logger')
const jwt = require('jsonwebtoken')

const requestLogger = (request, response, next) => {
  logger.info('Method: ', request.method)
  logger.info('Path: ', request.path)
  logger.info('Body: ', request.body)
  logger.info('---')
  next()
}

const unkownEndpoint = (request, response) => {
  response.status(400).send({ error: 'unkown endoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if(error.name === 'ValidationError') {
    return response.status(400).json({ error: 'invalid request data' })
  } else if(error.name === 'CastError') {
    return response.status(400).json({ error: 'Invalid id' })
  } else if(error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'Expected `username` to be unique' })
  } else if(error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' })
  } else if(error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'token invalid' })
  }
  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if(authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.replace('Bearer ', '')
    request.body = { ...request.body, token: token }
  }
  next()
}

const userExtractor = async (request, response, next) => {
  if(request.body.token) {
    const decodedToken = jwt.verify(request.body.token, process.env.SECRET)
    if(!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(decodedToken.id)
    request.body.user = user
  }
  next()
}

module.exports = { requestLogger, unkownEndpoint, errorHandler, tokenExtractor, userExtractor }