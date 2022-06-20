/**
 * Module for the APIController.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import { User } from '../../models/games-service.js'
import fetch from 'node-fetch'

/**
 * Encapsulates a controller.
 */
export class APIController {
  /**
   * The API entry point, which returns a 'Welcome' message along with links.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async index (req, res, next) {
    if (req.utils.authenticateJWT(req)) {
      res.json({
        message: 'Welcome to the LNU Game Collectors Club API! Please use the links to navigate (you are currently logged in as ' + req.user.email + '.)',
        links: req.utils.getLinks(req, {})
      })
    } else {
      res.json({
        message: 'Welcome to the LNU Game Collectors Club API! Please use the links to navigate (you are currently not logged in.)',
        links: req.utils.getLinks(req, {})
      })
    }
    next()
  }

  /**
   * Registers a new user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async register (req, res, next) {
    // Ensures user is not already registered.
    const existingUser = await User.findOne({ email: req.body.email })
    if (existingUser !== null) {
      res.status(409)
      res.json({
        message: 'A user account is already registered on the provided Email address.',
        status: 409,
        links: req.utils.getLinks(req, {})
      })
      return
    }
    // Ensures provided password is valid.
    if (!Object.prototype.hasOwnProperty.call(req.body, 'password') || req.body.password.length < 10 || req.body.password.length > 1000) {
      res.status(400)
      res.json({
        message: 'A password with a length of at least 10 and no more than 1000 characters needs to be provided.',
        status: 400,
        links: req.utils.getLinks(req, {})
      })
      return
    }
    // Creates and validates a new user.
    const user = new User({ email: req.body.email })
    try {
      await user.validate()
    } catch (error) {
      next(error)
      return
    }
    try {
      // Attempts to register user credentials at the Auth service.
      const bodyJSON = JSON.stringify({
        email: req.body.email,
        password: req.body.password
      })
      const response = await fetch(process.env.AUTH_SERVICE_URI + '/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: bodyJSON
      })
      const responseJSON = await response.json()
      // Save user if Auth service response is OK.
      if (responseJSON.status === 200 || responseJSON.status === 201) {
        await user.save()
        res.json(responseJSON)
        res.status(responseJSON.status)
      }
    } catch (error) {
      next(error)
    }
  }
}
