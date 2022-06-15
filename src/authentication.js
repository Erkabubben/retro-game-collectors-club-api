/**
 * Routes for the Images collection of the Resource Service (RESTful).
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import express from 'express'
import createError from 'http-errors'
import jwt from 'jsonwebtoken'

/**
 * Encapsulates a controller.
 */
export class Authentication {
  /**
   * Authenticates the user by verifying the enclosed JWT.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  authenticateJWT = (req, res, next) => {
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
  ensureUserIsResourceOwner = (req, res, next) => {
    try {
      if (req.user.email !== req.game.owner) {
        throw Error
      }
      next()
    } catch (error) {
      next(createError(404))
    }
  }
}
