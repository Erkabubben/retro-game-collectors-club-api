/**
 * The starting point of the application.
 *
 * @author Mats Loock
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import helmet from 'helmet'
import logger from 'morgan'
import { router } from './routes/router.js'
import { connectDB } from './config/mongoose.js'
import { Utils } from './utils.js'

/**
 * The main function of the application.
 */
const main = async () => {
  // Checks that database is functional (no use starting the application otherwise).
  console.log(process.env.DB_CONNECTION_STRING)
  await connectDB()

  // Creates an Express application.
  const app = express()

  // Set various HTTP headers to make the application little more secure (https://www.npmjs.com/package/helmet).
  app.use(helmet())

  // Set up a morgan logger using the dev format for log entries.
  app.use(logger('dev'))

  // Set Express to use JSON and extend the JSON file size limit (default is 100kb)
  app.use(express.json({ limit: '500kb' }))

  const utils = new Utils()

  // Middleware to be executed before the routes.
  app.use((req, res, next) => {
    // Utils: Add Utils to the Request-object to make it available in controllers.
    req.utils = utils

    next()
  })

  // Register routes.
  app.use('/', router)

  // Error handler.
  app.use(function (err, req, res, next) {
    err.status = err.status || 500

    return res
      .status(err.status)
      .json({
        status: err.status,
        message: err.message,
        links: req.utils.getLinks(req, {})
      })
  })

  if (process.env.RESET_DBS === 'true') {
    if (process.env.ADD_TESTDATA === 'true') {
      utils.resetDatabases(true)
    } else {
      utils.resetDatabases(false)
    }
  }

  // Starts the HTTP server listening for connections.
  app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
    console.log('Press Ctrl-C to terminate...')
  })
}

main().catch(console.error)
