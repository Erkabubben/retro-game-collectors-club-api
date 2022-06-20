/**
 * Module for the WebhooksController.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import { Webhook } from '../../models/games-service.js'
import createError from 'http-errors'

/**
 * Encapsulates a controller.
 */
export class WebhooksController {
  /**
   * Provide req.webhook to the route if :id is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The value of the id for the task to load.
   */
  async loadWebhook (req, res, next, id) {
    try {
      const webhook = await Webhook.findOne({ _id: id })
      // If no webhook found send a 404 (Not Found).
      if (!webhook) {
        next(createError(404, 'Webhook with id not found.'))
        return
      }
      // Provide the webhook to req.
      req.webhook = webhook
      // Next middleware.
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Takes a Webhook Mongoose model and returns a regular object.
   *
   * @param {object} req - Express request object.
   * @param {Webhook} webhook - A Webhook Mongoose model.
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
   * Creates a Mongoose Webhook model from the contents of req.body.
   *
   * @param {object} req - Express request object.
   * @returns {object} - A Mongoose Webhook model.
   */
  getWebhookModelFromRequestData (req) {
    const webhook = new Webhook({
      type: req.body.type,
      recipientUrl: req.body.recipientUrl,
      owner: req.user.email
    })
    return webhook
  }

  /**
   * Finds all Webhooks belonging to the user and returns them as an array in
   * a JSON response.
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
      // Ensure req.body has the required 'type' and 'recipientUrl' properties.
      if (!Object.prototype.hasOwnProperty.call(req.body, 'type') || !Object.prototype.hasOwnProperty.call(req.body, 'recipientUrl') ||
        req.body.type === '' || req.body.recipientUrl === '') {
        res.status(500)
        res.json({
          status: 500,
          message: 'Required fields \'type\' and \'recipientUrl\' are missing.',
          links: req.utils.getLinks(req, {})
        })
        return
      }
      // Ensure the exact same hook is not already registered.
      const existingWebhook = await Webhook.findOne({ type: req.body.type, recipientUrl: req.body.recipientUrl, owner: req.user.email })
      if (existingWebhook !== null) {
        res.status(409)
        res.json({
          status: 409,
          message: 'You have already registered this exact Webhook.',
          resource: this.ObjectFromWebhookModel(req, existingWebhook),
          links: req.utils.getLinks(req, {})
        })
        return
      }
      // Validate and save the hook to the database.
      const webhook = this.getWebhookModelFromRequestData(req)
      const responseWebhook = this.ObjectFromWebhookModel(req, webhook)
      await webhook.validate()
      await webhook.save()
      // Include the registered Webhook in the response.
      res.status(201)
      res.json({
        message: 'A new Webhook was registered.',
        status: 201,
        resource: responseWebhook,
        links: req.utils.getLinks(req, {})
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Finds a specific Webhook in the database and returns it as a JSON response.
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
        links: req.utils.getLinks(req, {})
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Deletes a registered Webhook from the database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async delete (req, res, next) {
    try {
      const recipientUrl = req.webhook.recipientUrl
      const type = req.webhook.type
      if (Object.prototype.hasOwnProperty.call(req, 'webhook')) {
        await req.webhook.delete()
        res
          .status(200)
          .json({
            status: 200,
            message: `Your Webhook registered for URL ${recipientUrl} on event type ${type} was deleted.`,
            links: req.utils.getLinks(req, {})
          })
      }
    } catch (error) {
      next(error)
    }
  }

  /**
   * Used to check whether Webhooks are working.
   *
   * @param {number} testID - Which test hook route the hook has been received on.
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async hookTest (testID, req, res, next) {
    try {
      const message = `Webhook received on test route ${testID}: ` + req
      console.log(`Webhook received on test route ${testID}: `)
      console.log(req.body)
      res.status(200)
      res.json({
        message: message,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  }
}
