/**
 * Routes specific to the Resource Service application.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import express from 'express'

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
    for (const [key, value] of Object.entries(localLinks)) {
      linksObject[key] = {}
      linksObject[key]['href'] = fullUrl + value
    }
    for (const [key, value] of Object.entries(globalLinks)) {
      linksObject[key] = {}
      linksObject[key]['href'] = fullUrl + value
    }
    for (const [key, value] of Object.entries(linksObject)) {
      if (linksObject[key]['href'].length > 0 && linksObject[key]['href'].charAt(linksObject[key]['href'].length - 1) === '/') {
        linksObject[key]['href'] = linksObject[key]['href'].substring(0, linksObject[key]['href'].length - 1);
      }
    }
    return linksObject
  }
}