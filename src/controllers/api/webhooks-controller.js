/**
 * Module for the ImagesController.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import { Webhook } from '../../models/games-service.js'
import createError from 'http-errors'
import dashify from 'dashify'

/**
 * Encapsulates a controller.
 */
export class WebhooksController {
  /**
   * Provide req.image to the route if :id is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The value of the id for the task to load.
   */
  async loadWebhook (req, res, next, id) {
    try {
      // Provide the webhook to req.
      const webhook = await Webhook.findOne({ _id: id })

      // If no image found send a 404 (Not Found).
      if (!webhook) {
        next(createError(404, 'Webhook with id not found.'))
        return
      }
      // Provide the webhook to req.
      req.webhook = webhook
      console.log(req.webhook)
      // Next middleware.
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Takes an Game Mongoose model and returns a regular object.
   *
   * @param {Game} webhook - A Game Mongoose model.
   * @returns {object} - A regular object.
   */
  ObjectFromWebhookModel (req, webhook) {
    return {
      type: webhook.type,
      recipientUrl: webhook.recipientUrl,
      owner: webhook.owner,
      createdAt: webhook.createdAt,
      href: req.protocol + '://' + process.env.APP_URI + '/api/webhooks/' + webhook._id
    }
  }

  /**
   * Gets an object containing the list of links used to navigate the API.
   *
   * @param {object} req - Express request object.
   * @returns {object} - An object containing the list of links used to navigate the API.
   */
  getWebhookModelFromRequestData (req) {
    const webhook = new Webhook({
      type: req.body.type,
      recipientUrl: req.body.recipientUrl,
      owner: req.user.email,
    })
    return webhook
  }

  /**
   * Finds the metadata of all the images belonging to the user, and returns it as an
   * array in a JSON response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async getCurrentUserWebhooks (req, res, next) {
    try {
      const webhooks = await Webhook.find({ owner: req.user.email })
      const webhookObjects = []
      webhooks.forEach(webhook => {
        webhookObjects.push(this.ObjectFromWebhookModel(req, webhook))
      })
      const message = webhookObjects.length > 0 ? 'You have a total of ' + webhookObjects.length + ' Webhooks registered.' : 'You currently have no Webhooks registered.'
      res.status(200)
      res.json({
        message: message,
        status: 200,
        resources: webhookObjects,
        links: req.linksUtil.getLinks(req, {})
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
      if (!req.body.hasOwnProperty('type') || !req.body.hasOwnProperty('recipientUrl')
        || req.body.type === '' || req.body.recipientUrl === '' ) {
        res.status(500)
        res.json({
          status: 500,
          message: 'Required fields \'type\' and \'recipientUrl\' are missing.',
          links: req.linksUtil.getLinks(req, {}),
        })
        return
      }

      const existingWebhook = await Webhook.findOne({ type: req.body.type, recipientUrl: req.body.recipientUrl, owner: req.user.email })
      if (existingWebhook !== null) {
        res.status(409)
        res.json({
          status: 409,
          message: 'You have already registered this exact Webhook.',
          resource: this.ObjectFromWebhookModel(req, existingWebhook),
          links: req.linksUtil.getLinks(req, {}),
        })
        return
      }

      const webhook = this.getWebhookModelFromRequestData(req)
      const responseWebhook = this.ObjectFromWebhookModel(req, webhook)
      await webhook.validate()
      await webhook.save()

      res.status(201)
      res.json({
        message: 'A new Webhook was registered.',
        status: 201,
        resource: responseWebhook,
        links: req.linksUtil.getLinks(req, {})
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
  async findWebhook (req, res, next) {
    try {
        res.status(200)
        res.json({
          status: 200,
          resource: this.ObjectFromWebhookModel(req, req.webhook),
          links: req.linksUtil.getLinks(req, {})
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
      const recipientUrl = req.webhook.recipientUrl
      const type = req.webhook.type
      if (req.hasOwnProperty('webhook')) {
        await req.webhook.delete()
        res
          .status(200)
          .json({
            status: 200,
            message: `Your Webhook registered for URL ${recipientUrl} on event type ${type} was deleted.`,
            links: req.linksUtil.getLinks(req, {})
          })
      }
    } catch (error) {
      next(error)
    }
  }
}
