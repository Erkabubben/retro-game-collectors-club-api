/**
 * Routes specific to the Resource Service application.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import express from 'express'
import { router as gamesRouter } from './games-router.js'

export const router = express.Router()

// Map HTTP verbs and route paths to controller actions.
router.get('/', (req, res) => res.json({
    message: 'Welcome to the LNU Game Collectors Club API! Please use the links to navigate.',
    links: req.linksUtil.getLinks(req, {
        test: 'test',
        login: 'login',
        register: 'register'
    })
}))

router.use('/games', gamesRouter)

router.get('/auth-welcome', (req, res) => res.redirect('http://localhost:8081/api/'))
router.post('/login', (req, res) => res.redirect(307, 'http://localhost:8081/api/login'))
router.post('/register', (req, res) => res.redirect(307, 'http://localhost:8081/api/register'))
