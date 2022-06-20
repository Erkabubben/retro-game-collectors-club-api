/**
 * Routes for the Webhooks collection of the Games Service (RESTful).
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import express from 'express'
import { WebhooksController } from '../../../controllers/api/webhooks-controller.js'
import { Authentication } from '../../../authentication.js'

export const router = express.Router()

const auth = new Authentication()

const controller = new WebhooksController()

// Map HTTP verbs and route paths to controller actions.

router.param('id', (req, res, next, id) => controller.loadWebhook(req, res, next, id))

router.get('/', auth.authenticateJWT, (req, res, next) => controller.getCurrentUserWebhooks(req, res, next))

router.get('/:id', auth.authenticateJWT, auth.ensureUserIsWebhookOwner, (req, res, next) => controller.findWebhook(req, res, next))

router.post('/', auth.authenticateJWT, (req, res, next) => controller.create(req, res, next))

router.delete('/:id', auth.authenticateJWT, auth.ensureUserIsWebhookOwner, (req, res, next) => controller.delete(req, res, next))

// Routes for Webhook testing.

router.post('/hook-test-0', (req, res, next) => controller.hookTest(0, req, res, next))

router.post('/hook-test-1', (req, res, next) => controller.hookTest(1, req, res, next))
