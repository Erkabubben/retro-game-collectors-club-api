/**
 * Module for the ImagesController.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import { Image } from '../../models/resource-service.js'
import createError from 'http-errors'
import fetch from 'node-fetch'

/**
 * Encapsulates a controller.
 */
export class ImagesController {
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
      const image = await Image.findById(id)

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
   * @param {Image} image - An Image Mongoose model.
   * @returns {object} - A regular object.
   */
  ObjectFromImageModel (image) {
    return {
      imageUrl: image.imageUrl,
      id: image._id,
      updatedAt: image.updatedAt,
      createdAt: image.createdAt,
      description: image.description,
      location: image.location
    }
  }

  /**
   * Makes a Fetch request to the Image Service.
   *
   * @param {string} method - The HTTP verb to be used.
   * @param {string} url - Relative path to be concatenated to the end of the Image Service base URL.
   * @param {object} body - An object to be included as the body of the request (optional).
   * @returns {Response} - The response to the Fetch request.
   */
  async ImageServiceFetchRequest (method, url, body) {
    if (body === null) {
      const response = await fetch(process.env.IMAGE_SERVICE_URL + url, {
        method: method,
        headers: {
          'PRIVATE-TOKEN': process.env.IMAGE_SERVICE_TOKEN,
          'Content-Type': 'application/json'
        }
      })
      return response
    } else {
      const bodyJSON = JSON.stringify(body)
      const response = await fetch(process.env.IMAGE_SERVICE_URL + url, {
        method: method,
        headers: {
          'PRIVATE-TOKEN': process.env.IMAGE_SERVICE_TOKEN,
          'Content-Type': 'application/json'
        },
        body: bodyJSON
      })
      return response
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
      const images = await Image.find({ owner: req.user.email })
      const imageObjects = []
      images.forEach(image => {
        imageObjects.push(this.ObjectFromImageModel(image))
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
      res.json(this.ObjectFromImageModel(req.image))
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
      // Make POST request to Image Service
      const body = {
        data: req.body.data,
        contentType: req.body.contentType
      }

      const response = await this.ImageServiceFetchRequest('post', 'images', body)

      if (response.status !== 201) {
        throw Error
      }

      const responseJSON = await response.json()

      const image = new Image({
        imageUrl: responseJSON.imageUrl,
        _id: responseJSON.id,
        owner: req.user.email,
        description: req.body.description,
        location: req.body.location
      })

      const responseImage = this.ObjectFromImageModel(image)

      await image.save()

      res
        .status(200)
        .json(responseImage)
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
      // Make PUT request to Image Service
      const body = {
        data: req.body.data,
        contentType: req.body.contentType
      }

      const response = await this.ImageServiceFetchRequest('put', 'images/' + req.image._id, body)

      if (response.status !== 204) {
        throw Error
      }

      const id = req.image._id
      const imageUrl = req.image.imageUrl

      // Delete the original image metadata stored in the database
      await req.image.delete()

      // Create a new image based on the form contents
      const newImage = new Image({
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
