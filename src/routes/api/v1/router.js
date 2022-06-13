/**
 * Routes specific to the Resource Service application.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import express from 'express'
import { router as gamesRouter } from './games-router.js'
import { APIController } from '../../../controllers/api/api-controller.js'

export const router = express.Router()

const controller = new APIController()

// Map HTTP verbs and route paths to controller actions.
router.get('/', (req, res, next) => controller.index(req, res, next))

router.use('/games', gamesRouter)

router.get('/auth-welcome', (req, res) => res.redirect('http://localhost:8081/api/'))
router.post('/login', (req, res) => res.redirect(307, 'http://localhost:8081/api/login'))
router.post('/register', (req, res) => controller.register(req, res, next))
