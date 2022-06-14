/**
 * Module for the ImagesController.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import { Game, User } from '../../models/games-service.js'
import createError from 'http-errors'
import fetch from 'node-fetch'

/**
 * Encapsulates a controller.
 */
export class APIController {
  /**
   * Finds the metadata of all the images belonging to the user, and returns it as an
   * array in a JSON response.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async index (req, res, next) {
    if (req.linksUtil.authenticateJWT(req)) {
      res.json({
          message: 'Welcome to the LNU Game Collectors Club API! Please use the links to navigate (you are currently logged in as ' + req.user.email + '.)',
          links: req.linksUtil.getLinks(req, {
              myAccount: 'me',
          })
      })
    } else {
      res.json({
          message: 'Welcome to the LNU Game Collectors Club API! Please use the links to navigate (you are currently not logged in.)',
          links: req.linksUtil.getLinks(req, {})
      })
    }
    next()
  }

  async register (req, res, next) {
    const users = await User.find({ email: req.body.email })
    if (users.length > 0) {
      res.status(409)
      res.json({
        message: 'A user account is already registered on the provided Email address.',
        status: 409,
        links: req.linksUtil.getLinks(req, {})
      })
      return
    }
    if (req.body.password.length < 10 || req.body.password.length > 1000) {
      res.status(400)
      res.json({
        message: 'The password length needs to be at least 10 and no more than 1000 characters.',
        status: 400,
        links: req.linksUtil.getLinks(req, {})
      })
      return
    }
    var user = null
    try {
      user = new User({
        email: req.body.email,
        //username: req.body.username,
        //city: req.body.city
        //imageUrl: req.body.imageUrl,
        //profileInfo: req.body.profileInfo
      })
    } catch (error) {
      next(error)
      return
    }
    try {
      await user.save()
    } catch (error) {
      next(error)
      return
    }
    try {
      const bodyJSON = JSON.stringify({
        email: req.body.email,
        password: req.body.password
      })
      const response = await fetch('http://localhost:8081/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: bodyJSON
      })
      const responseJSON = await response.json()
      console.log(responseJSON)
      if (responseJSON.status === 200 || responseJSON.status === 201) {
        console.log('NEW USER ADDED')
        res.json(responseJSON)
        res.status(responseJSON.status)
      }
    } catch (error) {
      await user.delete()
      next(error)
      return
    }
  }
}
