/**
 * Module for the Utils class.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @version 1.0.0
 */

import jwt from 'jsonwebtoken'
import { User, Game, Webhook } from './models/games-service.js'
import dashify from 'dashify'
import fetch from 'node-fetch'

/**
 * Encapsulates the Utils class.
 */
export class Utils {
  /**
   * Constructor for the Utils class.
   */
  constructor () {
    this.acceptedConsoles = {
      nes: true,
      snes: true,
      gb: true,
      gbc: true,
      gba: true,
      md: true,
      n64: true,
      ps: true,
      ps2: true,
      dc: true,
      pc: true
    }

    this.convertedConsoleNames = {
      famicom: 'nes',
      nintendo: 'nes',
      'nintendo entertainment system': 'nes',
      'super nintendo entertainment system': 'snes',
      'super nintendo': 'snes',
      'super famicom': 'snes',
      gameboy: 'gb',
      'game boy': 'gb',
      'gameboy color': 'gbc',
      'game boy color': 'gbc',
      gameboycolor: 'gbc',
      'gameboy advance': 'gba',
      'game boy advance': 'gba',
      gameboyadvance: 'gba',
      'mega drive': 'md',
      megadrive: 'md',
      'sega mega drive': 'md',
      'sega megadrive': 'md',
      segamegadrive: 'md',
      nintendo64: 'n64',
      'nintendo 64': 'n64',
      ultra64: 'n64',
      'ultra 64': 'n64',
      playstation: 'ps',
      'play station': 'ps',
      playstation1: 'ps',
      'playstation 1': 'ps',
      psx: 'ps',
      playstation2: 'ps2',
      'play station2': 'ps2',
      'play station 2': 'ps2',
      'sega dreamcast': 'dc',
      segadreamcast: 'dc',
      'sega dream cast': 'dc',
      dreamcast: 'dc',
      'dream cast': 'dc'
    }
  }

  /**
   * Gets an object containing the list of links used to navigate the API.
   *
   * @param {object} req - Express request object.
   * @param {object} localLinks - Additional links to be included in the response.
   * @returns {object} - An object containing the list of links used to navigate the API.
   */
  getLinks (req, localLinks) {
    const fullUrl = req.protocol + '://' + process.env.APP_URI + '/api/'
    const linksObject = {}
    const globalLinks = {
      index: ''
    }
    // Adds a different set of global links depending on whether the user is authenticated or not.
    if (!Object.prototype.hasOwnProperty.call(req, 'user')) {
      globalLinks.login = 'login'
      globalLinks.register = 'register'
    } else {
      globalLinks.myPostedGames = 'games/' + 'find-posted-by?user=' + req.user.email
      globalLinks.gamesPostedByUser = 'games/find-posted-by?user={user}'
      globalLinks.currentlyPostedGames = 'games'
      globalLinks.currentlyPostedGamesForConsole = 'games/{console}'
      globalLinks.webhooks = 'webhooks'
    }
    // Add local links.
    for (const [key, value] of Object.entries(localLinks)) {
      linksObject[key] = {}
      linksObject[key].href = fullUrl + value
    }
    // Add global links.
    for (const [key, value] of Object.entries(globalLinks)) {
      linksObject[key] = {}
      linksObject[key].href = fullUrl + value
    }
    // Always removes trailing slash.
    for (const [key] of Object.entries(linksObject)) {
      if (linksObject[key].href.length > 0 && linksObject[key].href.charAt(linksObject[key].href.length - 1) === '/') {
        linksObject[key].href = linksObject[key].href.substring(0, linksObject[key].href.length - 1)
      }
    }
    return linksObject
  }

  /**
   * Creates a Mongoose Game model from the contents of req.body.
   *
   * @param {object} req - Express request object.
   * @param {string} resourceId - The resourceId to be given to the Game model.
   * @returns {object} - A Mongoose Game model.
   */
  getGameModelFromRequestData (req, resourceId) {
    return new Game({
      gameTitle: req.body.gameTitle,
      console: req.body.console,
      condition: req.body.condition,
      imageUrl: req.body.imageUrl,
      city: req.body.city,
      price: req.body.price,
      description: req.body.description,
      owner: req.user.email,
      resourceId: resourceId
    })
  }

  /**
   * Authenticates the user by verifying the enclosed JWT.
   *
   * @param {object} req - Express request object.
   * @returns {boolean} - Whether or not the request's JWT has been authenticated.
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
        email: req.jwt.email
      }
    } catch (error) {
      return false
    }
    return true
  }

  /**
   * Authenticates the user by verifying the enclosed JWT.
   *
   * @param {string} webhookType - The type of Webhook to be invoked.
   * @param {object} hookBody - JSON object that should be included as the Webhook body.
   */
  async sendWebhook (webhookType, hookBody) {
    const registeredWebhooks = await Webhook.find({ type: webhookType })
    for (let i = 0; i < registeredWebhooks.length; i++) {
      try {
        const registeredWebhook = registeredWebhooks[i]
        const bodyJSON = JSON.stringify(hookBody)
        await fetch(registeredWebhook.recipientUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: bodyJSON
        })
      } catch (error) {

      }
    }
  }

  /**
   * Ensures that the console defined in req.body is one of the accepted consoles. Also converts
   * full-length console names to the proper abbreviation by checking against convertedConsoleNames
   * object.
   *
   * @param {object} req - Express request object.
   * @returns {boolean} - Whether or not the console is valid.
   */
  validateConsole (req) {
    if (Object.prototype.hasOwnProperty.call(this.convertedConsoleNames, req.body.console.toLowerCase())) {
      req.body.console = this.convertedConsoleNames[req.body.console.toLowerCase()]
      return true
    }
    if (Object.prototype.hasOwnProperty.call(this.acceptedConsoles, req.body.console.toLowerCase())) {
      req.body.console = req.body.console.toLowerCase()
      return true
    } else {
      return false
    }
  }

  /**
   * Gets all accepted consoles as a comma-separated string.
   *
   * @returns {string} - All accepted consoles as a comma-separated string.
   */
  getSupportedConsolesString () {
    let s = ''
    for (const [key] of Object.entries(this.acceptedConsoles)) {
      s += key + ', '
    }
    s = s.substring(0, s.length - 2)
    return s
  }

  /**
   * Resets all databases and adds test data if the given boolean is set to true.
   *
   * @param {boolean} addTestData - Whether or not to add test data after database reset.
   */
  async resetDatabases (addTestData) {
    console.log('Resetting databases...')
    await User.deleteMany({})
    await Game.deleteMany({})
    await Webhook.deleteMany({})
    console.log('All data on games-service databases was deleted.')
    const response = await fetch(process.env.AUTH_SERVICE_URI + '/api/deleteAll', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer delete-all-from-games-service',
        'Content-Type': 'application/json'
      }
    })
    const responseJSON = await response.json()
    if (responseJSON.status === 200) {
      console.log(responseJSON.message)
    } else {
      console.log(responseJSON)
    }

    if (addTestData) {
      const testUsers = [
        {
          email: 'kyle.broflowski@southparkelementary.com',
          password: 'KickTheBaby'
        },
        {
          email: 'kenny.mccormick@southparkelementary.com',
          password: 'Mrrphrmphrmmphmrrphh'
        },
        {
          email: 'bebe.stevens@southparkelementary.com',
          password: 'ShoesShoesShoes'
        },
        {
          email: 'clyde.donovan@southparkelementary.com',
          password: '123456789101112'
        },
        {
          email: 'craig.tucker@southparkelementary.com',
          password: 'GoodTimesWithWeapons'
        },
        {
          email: 'randy.marsh@tegridyfarms.com',
          password: '_i_am_lorde_'
        }
      ]

      const testGames = [
        {
          gameTitle: 'The Legend of Zelda: Ocarina of Time',
          console: 'n64',
          condition: 3,
          imageUrl: 'https://en.wikipedia.org/wiki/The_Legend_of_Zelda:_Ocarina_of_Time#/media/File:The_Legend_of_Zelda_Ocarina_of_Time.jpg',
          price: 25,
          description: 'A true classic',
          owner: 'clyde.donovan@southparkelementary.com'
        },
        {
          gameTitle: 'GoldenEye 007',
          console: 'n64',
          condition: 3,
          imageUrl: 'https://en.wikipedia.org/wiki/GoldenEye_007_(1997_video_game)#/media/File:GoldenEye007box.jpg',
          price: 32,
          owner: 'randy.marsh@tegridyfarms.com'
        },
        {
          gameTitle: 'Final Fantasy VII',
          console: 'ps',
          condition: 4,
          imageUrl: 'https://en.wikipedia.org/wiki/Final_Fantasy_VII#/media/File:Final_Fantasy_VII_Box_Art.jpg',
          price: 55,
          owner: 'kyle.broflowski@southparkelementary.com'
        },
        {
          gameTitle: 'Super Mario World',
          console: 'snes',
          condition: 5,
          imageUrl: 'https://en.wikipedia.org/wiki/Super_Mario_World#/media/File:Super_Mario_World_Coverart.png',
          price: 80,
          owner: 'kyle.broflowski@southparkelementary.com'
        },
        {
          gameTitle: 'Flashback',
          console: 'snes',
          condition: 1,
          imageUrl: 'http://www.retrospelbutiken.se/images/products/10585.jpg',
          description: 'Label has been torn off from casette, but works fine.',
          price: 15,
          owner: 'craig.tucker@southparkelementary.com'
        },
        {
          gameTitle: 'Silent Hill',
          console: 'ps',
          condition: 1,
          imageUrl: 'https://en.wikipedia.org/wiki/Silent_Hill_%28video_game%29#/media/File:Silent_Hill_video_game_cover.png',
          description: 'The scariest game for the original Playstation.',
          price: 15,
          owner: 'randy.marsh@tegridyfarms.com'
        },
        {
          gameTitle: 'Mario Kart 64',
          console: 'n64',
          condition: 4,
          imageUrl: 'https://en.wikipedia.org/wiki/Mario_Kart_64#/media/File:Mario_Kart_64.jpg',
          description: 'Watch out for blue shells!',
          price: 25,
          owner: 'bebe.stevens@southparkelementary.com'
        },
        {
          gameTitle: 'Jet Force Gemini',
          console: 'n64',
          condition: 3,
          imageUrl: 'https://en.wikipedia.org/wiki/Jet_Force_Gemini#/media/File:Jet_Force_Gemini_box.jpg',
          price: 40,
          owner: 'kyle.broflowski@southparkelementary.com'
        },
        {
          gameTitle: 'The Guardian Legend',
          console: 'nes',
          condition: 5,
          imageUrl: 'https://en.wikipedia.org/wiki/The_Guardian_Legend#/media/File:TGL_Box.jpg',
          description: 'Great game in near-mint condition.',
          price: 200,
          owner: 'kyle.broflowski@southparkelementary.com'
        },
        {
          gameTitle: 'StarTropics',
          console: 'nes',
          condition: 3,
          imageUrl: 'https://en.wikipedia.org/wiki/StarTropics#/media/File:Startropics_box.jpg',
          description: 'Includes the letter with the secret code necessary to use the Sub-C.',
          price: 100,
          owner: 'clyde.donovan@southparkelementary.com'
        },
        {
          gameTitle: 'Willow',
          console: 'nes',
          condition: 4,
          imageUrl: 'https://en.wikipedia.org/wiki/Willow_(Capcom_arcade_game)#/media/File:Willow_arcade_flyer.jpg',
          price: 80,
          owner: 'clyde.donovan@southparkelementary.com'
        },
        {
          gameTitle: "Fester's Quest",
          console: 'nes',
          condition: 2,
          imageUrl: 'https://en.wikipedia.org/wiki/Fester%27s_Quest#/media/File:FestersQuest.jpg',
          price: 40,
          owner: 'clyde.donovan@southparkelementary.com'
        }
      ]

      for (let i = 0; i < testUsers.length; i++) {
        const testUser = testUsers[i]
        const user = new User({ email: testUser.email })
        await user.save()
        try {
          const bodyJSON = JSON.stringify({
            email: testUser.email,
            password: testUser.password
          })
          await fetch(process.env.AUTH_SERVICE_URI + '/api/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: bodyJSON
          })
          console.log(`Added user '${testUser.email}' to database.`)
        } catch (error) {}
      }

      for (let i = 0; i < testGames.length; i++) {
        const testGame = testGames[i]
        const gameID = testGame.console + '/' + dashify(testGame.gameTitle)
        const game = new Game({
          gameTitle: testGame.gameTitle,
          console: testGame.console,
          condition: testGame.condition,
          imageUrl: testGame.imageUrl,
          price: testGame.price,
          description: testGame.description,
          owner: testGame.owner,
          resourceId: gameID
        })
        await game.save()
        console.log(`Added game '${gameID}' to database.`)
      }

      console.log('Finished adding test data.')
    }
  }
}
