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
   * @param {Game} webhook - A Game Mongoose model.
   * @returns {object} - A regular object.
   */
  ObjectFromWebhookModel (req, webhook) {
    return {
      type: webhook.type,
      recipientUrl: webhook.imageUrl,
      owner: webhook.owner,
      href: req.protocol + '://' + process.env.APP_URI + '/api/games/' + webhook._Id
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
        links: req.linksUtil.getLinks(req, {}),
        resources: webhookObjects
      })
    } catch (error) {
      next(error)
    }
  }
}
