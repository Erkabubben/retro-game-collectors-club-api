/**
 * Module for the ImagesController.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import { Game, Webhook } from '../../models/games-service.js'
import createError from 'http-errors'
import dashify from 'dashify'
import fetch from 'node-fetch'

/**
 * Encapsulates a controller.
 */
export class GamesController {
  /**
   * Provide req.image to the route if :id is present.
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
      
      // If no image found send a 404 (Not Found).
      if (!game) {
        next(createError(404, 'Game with id not found.'))
        return
      }

      // Provide the image to req.
      req.game = game

      // Next middleware.
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Provide req.image to the route if :id is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The value of the id for the task to load.
   */
  async loadConsole (req, res, next, id) {
    try {
      // Provide the console to req.
      req.console = id
      // Next middleware.
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Takes an Game Mongoose model and returns a regular object.
   *
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
   * Finds the metadata of all the images belonging to the user, and returns it as an
   * array in a JSON response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async findAll (req, res, next) {
    try {
      const games = await Game.find({ owner: req.user.email })
      const gameObjects = []
      games.forEach(image => {
        gameObjects.push(this.ObjectFromGameModel(req, image))
      })
      const message = gameObjects.length > 0 ? 'You have a total of ' + gameObjects.length + ' game ads posted.' : 'You currently have no game ads posted.'
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
   * Finds the metadata of all the games for a certain console, and returns it as an
   * array in a JSON response.
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
   * Finds the metadata of an image in the database and returns it as a JSON response.
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
   * Creates a new image with metadata, based on the form content. The image
   * is stored in the Image Service, the metadata in the Resource Service database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async create (req, res, next) {
    try {
      if (!req.body.hasOwnProperty('gameTitle') || !req.body.hasOwnProperty('console')
        || req.body.gameTitle === '' || req.body.console === '' ) {
        res.status(500)
        res.json({
          status: 500,
          message: 'Required fields \'gameTitle\' and \'console\' are missing.',
          links: req.utils.getLinks(req, {}),
        })
        return
      }

      var gameID = dashify(req.body.console) + '/' + dashify(req.body.gameTitle)
      var game0 = await Game.find({ resourceId: gameID })
      if (game0.length > 0) {
        var i = 1
        while (true) {
          const games = await Game.find({ resourceId: gameID + '(' + i + ')' })
          if (games.length === 0) {
            gameID = gameID + '(' + i + ')'
            break
          }
          i++
        }
      }

      const game = req.utils.getGameModelFromRequestData(req, gameID)

      const responseGame = this.ObjectFromGameModel(req, game)
      await game.validate()

      await game.save()

      req.utils.sendWebhook(req, 'on-create-game', {
        message: 'Webhook: on-create-game',
        resource: responseGame
      })

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
   * Deletes an image from the Image Service and its image metadata
   * from the database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async delete (req, res, next) {
    try {
      const gameTitle = req.game.gameTitle
      await req.game.delete()
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
   * Updates an image stored in the Image Service and/or image metadata
   * stored in the database. Old database entry is replaced by new data.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async update (req, res, next) {
    try {
      const resourceId = req.game.resourceId
      const gameTitle = req.game.gameTitle

      // Create a new game based on the form contents
      const newGame = req.utils.getGameModelFromRequestData(req, resourceId)

      await newGame.validate()

      // Delete the original game metadata stored in the database
      await req.game.delete()

      await newGame.save()

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

  /**
   * Partially updates an image stored in the Image Service and/or image metadata
   * stored in the database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async partialUpdate (req, res, next) {
    try {
      // Only make PUT request to image service if input data contains data and contentType
      if ((req.body.data !== undefined && req.body.data !== null) && (req.body.contentType !== undefined && req.body.contentType !== null)) {
        // Make PUT request to Image Service
        const body = {
          data: req.body.data,
          contentType: req.body.contentType
        }

        const response = await this.ImageServiceFetchRequest('put', 'images/' + req.image._id, body)

        if (response.status !== 204) {
          throw Error
        }
      }

      // Update description and location if they have been defined in the input data
      if (req.body.description !== undefined && req.body.description !== null) {
        req.image.description = req.body.description
      }

      if (req.body.location !== undefined && req.body.location !== null) {
        req.image.location = req.body.location
      }

      // Save updated image metadata to database
      await req.image.save()

      res
        .status(204)
        .json()
    } catch (error) {
      next(error)
    }
  }
}
