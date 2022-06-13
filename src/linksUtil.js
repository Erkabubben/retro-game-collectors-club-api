/**
 * Routes specific to the Resource Service application.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import express from 'express'
import jwt from 'jsonwebtoken'

/**
 * Encapsulates a controller.
 */
 export class LinksUtil {
  /**
   * Gets an object containing the list of links used to navigate the API.
   *
   * @param {object} req - Express request object.
   * @returns {object} - An object containing the list of links used to navigate the API.
   */
  getLinks (req, localLinks) {
    const fullUrl = req.protocol + '://' + process.env.APP_URI + '/api/'
    const linksObject = {}
    const globalLinks = {
      index: ''
    }
    // Add local links.
    for (const [key, value] of Object.entries(localLinks)) {
      linksObject[key] = {}
      linksObject[key]['href'] = fullUrl + value
    }
    // Add global links.
    for (const [key, value] of Object.entries(globalLinks)) {
      linksObject[key] = {}
      linksObject[key]['href'] = fullUrl + value
    }
    // Always removes trailing slash.
    for (const [key, value] of Object.entries(linksObject)) {
      if (linksObject[key]['href'].length > 0 && linksObject[key]['href'].charAt(linksObject[key]['href'].length - 1) === '/') {
        linksObject[key]['href'] = linksObject[key]['href'].substring(0, linksObject[key]['href'].length - 1);
      }
    }
    return linksObject
  }

  /**
   * Authenticates the user by verifying the enclosed JWT.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  authenticateJWT (req) {
    // Parses the authorization header of the request
    const authorization = req.headers.authorization?.split(' ')

    // Checks that request contains a Bearer header
    if (authorization?.[0] !== 'Bearer') {
      console.log('Bearer token is missing')
      return false
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
    } catch (error) {
      return false
    }
    return true
  }
}