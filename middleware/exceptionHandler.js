const logger = require('../utils/logger')

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
    return response.status(400).send({ error: 'missing request data' })
  }
  next(error)
}

module.exports = { requestLogger, unkownEndpoint, errorHandler }