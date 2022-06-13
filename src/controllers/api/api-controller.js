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
          links: req.linksUtil.getLinks(req, {
              login: 'login',
              register: 'register'
          })
      })
    }
    next()
  }

  async register (req, res, next) {
    res.redirect(307, 'http://localhost:8081/api/register')
  }
}
