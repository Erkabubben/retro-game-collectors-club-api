/**
 * Module for the ImagesController.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import { Game } from '../../models/games-service.js'
import createError from 'http-errors'
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
  async loadImage (req, res, next, id) {
    try {
      // Get the image.
      const image = await Game.findById(id)

      // If no image found send a 404 (Not Found).
      if (!image) {
        next(createError(404, 'Image with id not found'))
        return
      }

      // Provide the image to req.
      req.image = image

      // Next middleware.
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Takes an Image Mongoose model and returns a regular object.
   *
   * @param {Game} game - An Image Mongoose model.
   * @returns {object} - A regular object.
   */
  ObjectFromGameModel (game) {
    return {
      gameTitle: game.gameTitle,
      console: game.console,
      condition: game.condition,
      imageUrl: game.imageUrl,
      city: game.city,
      price: game.price,
      description: game.description,
      owner: game.owner
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
      const images = await Game.find({ owner: req.user.email })
      const imageObjects = []
      images.forEach(image => {
        imageObjects.push(this.ObjectFromGameModel(image))
      })
      res.json(imageObjects)
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
  async find (req, res, next) {
    try {
      res.json(this.ObjectFromGameModel(req.image))
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
      const game = new Game({
          gameTitle: req.body.gameTitle,
          console: req.body.console,
          condition: req.body.condition,
          imageUrl: req.body.imageUrl,
          city: req.body.city,
          price: req.body.price,
          description: req.body.description,
          owner: req.user.email
        })

      const responseGame = this.ObjectFromGameModel(game)

      await game.save()

      res
        .status(200)
        .json(responseGame)
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
      // Make DELETE request to Image Service
      const response = await this.ImageServiceFetchRequest('delete', 'images/' + req.image._id)

      if (response.status !== 204) {
        throw Error
      }

      await req.image.delete()
      res
        .json({
          status: 204,
          message: 'Image deleted'
        })
        .status(204)
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
      const id = req.image._id
      const imageUrl = req.image.imageUrl

      // Delete the original image metadata stored in the database
      await req.image.delete()

      // Create a new image based on the form contents
      const newImage = new Game({
        imageUrl: imageUrl,
        _id: id,
        owner: req.user.email
      })

      newImage.description = req.body.description
      newImage.location = req.body.location

      await newImage.save()

      res
        .status(204)
        .json()
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
