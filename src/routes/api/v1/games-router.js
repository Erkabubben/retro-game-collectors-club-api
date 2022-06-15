/**
 * Routes for the Images collection of the Resource Service (RESTful).
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import express from 'express'
import { GamesController } from '../../../controllers/api/games-controller.js'
import createError from 'http-errors'
import jwt from 'jsonwebtoken'

export const router = express.Router()

/**
 * Authenticates the user by verifying the enclosed JWT.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const authenticateJWT = (req, res, next) => {
  // Parses the authorization header of the request
  const authorization = req.headers.authorization?.split(' ')

  // Checks that request contains a Bearer header
  if (authorization?.[0] !== 'Bearer') {
    next(createError(401, 'Bearer token is missing.'))
    return
  }

  try {
    // Decodes the RSA key from base64
    const publicKey = Buffer.from(process.env.ACCESS_TOKEN_SECRET, 'base64').toString()
    // Verifies the JWT
    req.jwt = jwt.verify(authorization[1], publicKey)
    // Creates an object with user data based on the contents of the JWT
    req.user = {
      email: req.jwt.email,
    }
    next()
  } catch (error) {
    // Returns an error if JWT validation fails
    next(createError(403, 'JWT Validation failed.'))
  }
}

/**
 * Ensures that the requested resource is owned by the user by checking
 * the resource owner against the user specified in the JWT.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const ensureUserIsResourceOwner = (req, res, next) => {
  try {
    if (req.user.email !== req.image.owner) {
      throw Error
    }
    next()
  } catch (error) {
    next(createError(404))
  }
}

const controller = new GamesController()

// Map HTTP verbs and route paths to controller actions.
router.param('console', (req, res, next, id) => controller.loadConsole(req, res, next, id))

router.param('id', (req, res, next, id) => controller.loadGame(req, res, next, id))

router.get('/', authenticateJWT, (req, res, next) => controller.findAll(req, res, next))

router.get('/:console/:id', authenticateJWT, (req, res, next) => controller.findGame(req, res, next))

//router.get('/:id', authenticateJWT, (req, res, next) => controller.findGame(req, res, next))

router.post('/', authenticateJWT, (req, res, next) => controller.create(req, res, next))

router.put('/:id', authenticateJWT, ensureUserIsResourceOwner, (req, res, next) => controller.update(req, res, next))

router.patch('/:id', authenticateJWT, ensureUserIsResourceOwner, (req, res, next) => controller.partialUpdate(req, res, next))

router.delete('/:id', authenticateJWT, ensureUserIsResourceOwner, (req, res, next) => controller.delete(req, res, next))
