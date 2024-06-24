const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

const mongoUrl = config.DB_URL
mongoose.connect(mongoUrl)

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})
