/**
 * Routes specific to the Resource Service application.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import express from 'express'
import { router as gamesRouter } from './games-router.js'
import { router as webhooksRouter } from './webhooks-router.js'
import { APIController } from '../../../controllers/api/api-controller.js'

export const router = express.Router()

const controller = new APIController()

// Map HTTP verbs and route paths to controller actions.
router.get('/', (req, res, next) => controller.index(req, res, next))

router.use('/games', gamesRouter)
router.use('/webhooks', webhooksRouter)

router.get('/auth-welcome', (req, res, next) => res.redirect(process.env.AUTH_SERVICE_URI + '/api/'))
router.post('/login', (req, res, next) => res.redirect(307, process.env.AUTH_SERVICE_URI + '/api/login'))
router.post('/register', (req, res, next) => controller.register(req, res, next))
