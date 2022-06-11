/**
 * Routes for the Images collection of the Resource Service (RESTful).
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import express from 'express'
import { ImagesController } from '../../../controllers/api/images-controller.js'
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
    next(createError(401, 'Bearer token is missing'))
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
    next(createError(403, 'JWT Validation failed'))
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

const controller = new ImagesController()

// Map HTTP verbs and route paths to controller actions.

router.param('id', (req, res, next, id) => controller.loadImage(req, res, next, id))

router.get('/', authenticateJWT, (req, res, next) => controller.findAll(req, res, next))

router.get('/:id', authenticateJWT, ensureUserIsResourceOwner, (req, res, next) => controller.find(req, res, next))

router.post('/', authenticateJWT, (req, res, next) => controller.create(req, res, next))

router.put('/:id', authenticateJWT, ensureUserIsResourceOwner, (req, res, next) => controller.update(req, res, next))

router.patch('/:id', authenticateJWT, ensureUserIsResourceOwner, (req, res, next) => controller.partialUpdate(req, res, next))

router.delete('/:id', authenticateJWT, ensureUserIsResourceOwner, (req, res, next) => controller.delete(req, res, next))
