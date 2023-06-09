/**
 * Routes for the Games collection of the Games Service (RESTful).
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import express from 'express'
import { GamesController } from '../../../controllers/api/games-controller.js'
import { Authentication } from '../../../authentication.js'

export const router = express.Router()

const controller = new GamesController()

const auth = new Authentication()

// Map HTTP verbs and route paths to controller actions.

router.post('/find-posted-by', auth.authenticateJWT, (req, res, next) => controller.findPostedByUser(req, res, next))

router.param('console', (req, res, next, id) => controller.loadConsole(req, res, next, id))

router.param('id', (req, res, next, id) => controller.loadGame(req, res, next, id))

router.get('/', auth.authenticateJWT, (req, res, next) => controller.findAll(req, res, next))

router.get('/:console', auth.authenticateJWT, (req, res, next) => controller.findAllGamesForConsole(req, res, next))

router.get('/:console/:id', auth.authenticateJWT, (req, res, next) => controller.findGame(req, res, next))

router.get('/:console/:id', auth.authenticateJWT, (req, res, next) => controller.findGame(req, res, next))

router.post('/', auth.authenticateJWT, (req, res, next) => controller.create(req, res, next))

router.put('/:console/:id', auth.authenticateJWT, auth.ensureUserIsGameOwner, (req, res, next) => controller.update(req, res, next))

router.delete('/:console/:id', auth.authenticateJWT, auth.ensureUserIsGameOwner, (req, res, next) => controller.delete(req, res, next))
