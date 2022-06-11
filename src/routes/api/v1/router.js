/**
 * Routes specific to the Resource Service application.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import express from 'express'
import { router as imagesRouter } from './images-router.js'

export const router = express.Router()

// Map HTTP verbs and route paths to controller actions.
router.get('/', (req, res) => res.json({ message: 'Welcome to the Resource Service!' }))
router.use('/images', imagesRouter)
