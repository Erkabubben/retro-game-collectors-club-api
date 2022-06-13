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
      console.log(`${key}: ${value}`)
      linksObject[key] = {}
      linksObject[key]['href'] = fullUrl + value
    }
    for (const [key, value] of Object.entries(globalLinks)) {
      console.log(`${key}: ${value}`)
      linksObject[key] = {}
      linksObject[key]['href'] = fullUrl + value
    }
    /*for (const [key, value] of Object.entries(linksObject)) {
      if (key['href'].length > 0 && key['href'].charAt(key['href'].length - 1) === '/') {
        linksObject[key]['href'].length--;
      }
    }*/
    return linksObject
  }
}