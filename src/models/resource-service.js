/**
 * Mongoose model for Resource Service application Image.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import mongoose from 'mongoose'

// Create a schema for the Image documents.
const imageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: '`{PATH}` is required!',
    trim: true,
    maxLength: [1000, '`{PATH}` ({VALUE}) exceeds the limit of ({MAXLENGTH}) characters.'],
    minLength: [4, '`{PATH}` ({VALUE}) is beneath the limit ({MINLENGTH}) characters.']
  },
  location: {
    type: String,
    maxLength: [1000, '`{PATH}` ({VALUE}) exceeds the limit of ({MAXLENGTH}) characters.'],
    minLength: [4, '`{PATH}` ({VALUE}) is beneath the limit ({MINLENGTH}) characters.']
  },
  description: {
    type: String,
    maxLength: [1000, '`{PATH}` ({VALUE}) exceeds the limit of ({MAXLENGTH}) characters.'],
    minLength: [4, '`{PATH}` ({VALUE}) is beneath the limit ({MINLENGTH}) characters.']
  },
  owner: {
    type: String,
    index: true
  }
}, {
  timestamps: true,
  versionKey: false
})

// Create a model using the schema.
export const Image = mongoose.model('Image', imageSchema)
