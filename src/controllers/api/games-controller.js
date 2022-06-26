/**
 * Module for the GamesController.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import { Game } from '../../models/games-service.js'
import createError from 'http-errors'
import dashify from 'dashify'

/**
 * Encapsulates a controller.
 */
export class GamesController {
  /**
   * Provide req.game to the route if :id is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The value of the id for the task to load.
   */
  async loadGame (req, res, next, id) {
    try {
      // Get the game.
      const game = await Game.findOne({ resourceId: req.console + '/' + id })
      // If no game found send a 404 (Not Found).
      if (!game) {
        next(createError(404, 'Game with id not found.'))
        return
      }
      // Provide the game to req.
      req.game = game
      // Next middleware.
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Provide req.console to the route if :console is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} console - The name of the console.
   */
  async loadConsole (req, res, next, console) {
    try {
      // Provide the console to req.
      req.console = console
      // Next middleware.
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Takes a Game Mongoose model and returns a regular object.
   *
   * @param {object} req - Express request object.
   * @param {Game} game - A Game Mongoose model.
   * @returns {object} - A regular object.
   */
  ObjectFromGameModel (req, game) {
    return {
      gameTitle: game.gameTitle,
      console: game.console,
      condition: game.condition,
      imageUrl: game.imageUrl,
      city: game.city,
      price: game.price,
      description: game.description,
      owner: game.owner,
      createdAt: game.createdAt,
      href: req.protocol + '://' + process.env.APP_URI + '/api/games/' + game.resourceId
    }
  }

  /**
   * Gets all game ads in the database and returns them as an array in a JSON response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async findAll (req, res, next) {
    try {
      const games = await Game.find({})
      const gameObjects = []
      games.forEach(game => {
        gameObjects.push(this.ObjectFromGameModel(req, game))
      })
      const message = gameObjects.length > 0 ? 'There are a total of ' + gameObjects.length + ' game ads posted.' : 'There are currently no game ads posted.'
      res.status(200)
      res.json({
        message: message,
        status: 200,
        links: req.utils.getLinks(req, {}),
        resources: gameObjects
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Finds all game ads belonging to a specific user and returns them as an array in a JSON response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async findPostedByUser (req, res, next) {
    try {
      // Error response if no user is specified in query.
      if (!Object.prototype.hasOwnProperty.call(req.query, 'user')) {
        const message = '\'user\' is missing in query.'
        res.status(400)
        res.json({
          message: message,
          status: 400,
          links: req.utils.getLinks(req, {})
        })
        return
      }
      const games = await Game.find({ owner: req.query.user })
      const gameObjects = []
      games.forEach(image => {
        gameObjects.push(this.ObjectFromGameModel(req, image))
      })
      // Set message depending on whether the owner of the game ads is the authenticated user or not.
      let message = ''
      if (req.query.user === req.user.email) {
        message = gameObjects.length > 0 ? 'You have a total of ' + gameObjects.length + ' game ads posted.' : 'You currently have no game ads posted.'
      } else {
        message = gameObjects.length > 0 ? `There are a total of ${gameObjects.length} game ads posted by ${req.query.user}.` : `${req.query.user} currently have no game ads posted.`
      }
      res.status(200)
      res.json({
        message: message,
        status: 200,
        links: req.utils.getLinks(req, {}),
        resources: gameObjects
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Gets all game ads for a specific console and returns them as an array in a JSON response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async findAllGamesForConsole (req, res, next) {
    try {
      const games = await Game.find({ console: req.console })
      const gameObjects = []
      games.forEach(game => {
        gameObjects.push(this.ObjectFromGameModel(req, game))
      })
      const message = gameObjects.length > 0
        ? `There are a total of ${gameObjects.length} game ads for the ${req.console} posted.`
        : `There are currently no game ads for the ${req.console} posted.`
      res.status(200)
      res.json({
        message: message,
        status: 200,
        links: req.utils.getLinks(req, {}),
        resources: gameObjects
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Finds a specific game ad in the database and returns it as a JSON response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async findGame (req, res, next) {
    try {
      res.status(200)
      res.json({
        status: 200,
        resource: this.ObjectFromGameModel(req, req.game),
        links: req.utils.getLinks(req, {})
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Creates a new game ad based on the form content and stores it in the database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async create (req, res, next) {
    try {
      // Ensure the required 'gameTitle' and 'console' properties are included and valid.
      if (!Object.prototype.hasOwnProperty.call(req.body, 'gameTitle') || !Object.prototype.hasOwnProperty.call(req.body, 'console') ||
        req.body.gameTitle === '' || req.body.console === '') {
        res.status(500)
        res.json({
          status: 500,
          message: 'Required fields \'gameTitle\' and \'console\' are missing.',
          links: req.utils.getLinks(req, {})
        })
        return
      }
      // Ensure the specified console is valid.
      if (!req.utils.validateConsole(req)) {
        res.status(500)
        res.json({
          status: 500,
          message: 'Console is not supported. The following consoles are supported: ' + req.utils.getSupportedConsolesString() + '.',
          links: req.utils.getLinks(req, {})
        })
        return
      }
      // Assign a unique resourceID to the game ad.
      let gameID = req.body.console + '/' + dashify(req.body.gameTitle)
      const game0 = await Game.find({ resourceId: gameID })
      if (game0.length > 0) {
        let i = 1
        while (true) {
          const games = await Game.find({ resourceId: gameID + '(' + i + ')' })
          if (games.length === 0) {
            gameID = gameID + '(' + i + ')'
            break
          }
          i++
        }
      }

      // Validate and save the game ad.
      const game = req.utils.getGameModelFromRequestData(req, gameID)
      const responseGame = this.ObjectFromGameModel(req, game)
      await game.validate()
      await game.save()

      // Send Webhook.
      req.utils.sendWebhook('on-create-game', {
        message: 'Webhook: on-create-game',
        resource: responseGame
      })

      // Set response and include the newly created game ad.
      res.status(201)
      res.json({
        message: 'A new game ad was posted.',
        status: 201,
        links: req.utils.getLinks(req, {}),
        resource: responseGame
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Deletes a game ad from the database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async delete (req, res, next) {
    try {
      const gameTitle = req.game.gameTitle
      const responseGame = this.ObjectFromGameModel(req, req.game)
      // Send Webhook.
      await req.game.delete()
      req.utils.sendWebhook('on-delete-game', {
        message: 'Webhook: on-delete-game',
        resource: responseGame
      })
      res
        .status(200)
        .json({
          status: 200,
          message: `Your ad for ${gameTitle} was deleted.`,
          links: req.utils.getLinks(req, {})
        })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Updates a game ad stored in the database. Old database entry is replaced by new data.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async update (req, res, next) {
    try {
      const resourceId = req.game.resourceId
      const gameTitle = req.game.gameTitle
      // Ensure the specified console is valid.
      if (!req.utils.validateConsole(req)) {
        res.status(500)
        res.json({
          status: 500,
          message: 'Console is not supported. The following consoles are supported: ' + req.utils.getSupportedConsolesString() + '.',
          links: req.utils.getLinks(req, {})
        })
        return
      }
      // Create a new game ad based on the req.body contents and validate.
      const newGame = req.utils.getGameModelFromRequestData(req, resourceId)
      await newGame.validate()
      // Delete the original game metadata stored in the database.
      await req.game.delete()
      // Save the new game ad to the database.
      await newGame.save()
      // Send Webhook.
      const responseGame = this.ObjectFromGameModel(req, req.game)
      req.utils.sendWebhook('on-update-game', {
        message: 'Webhook: on-update-game',
        resource: responseGame
      })
      // Include updated game ad in response.
      res
        .status(200)
        .json({
          status: 200,
          message: `Your ad for ${gameTitle} was updated.`,
          links: req.utils.getLinks(req, {}),
          resource: this.ObjectFromGameModel(req, newGame)
        })
    } catch (error) {
      next(error)
    }
  }
}
