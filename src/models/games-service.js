/**
 * Mongoose model for Resource Service application Image.
 *
 * @author Erik Lindholm <elimk06@student.lnu.se>
 * @author Mats Loock
 * @version 1.0.0
 */

import mongoose from 'mongoose'

// Create a schema for the Image documents.
const gameSchema = new mongoose.Schema({
  gameTitle: {
    type: String,
    required: '`{PATH}` is required!',
    trim: true,
    maxLength: [1000, '`{PATH}` ({VALUE}) exceeds the limit of ({MAXLENGTH}) characters.'],
    minLength: [1, '`{PATH}` ({VALUE}) is beneath the limit ({MINLENGTH}) characters.']
  },
  console: {
    type: String,
    required: '`{PATH}` is required!',
    trim: true,
    maxLength: [1000, '`{PATH}` ({VALUE}) exceeds the limit of ({MAXLENGTH}) characters.'],
    minLength: [1, '`{PATH}` ({VALUE}) is beneath the limit ({MINLENGTH}) characters.']
  },
  resourceId: {
    type: String,
    required: 'VALIDATION ERROR: `{PATH}` is required!',
    trim: true
  },
  condition: {
    type: Number,
    required: '`{PATH}` is required!',
    max: [5, '`{PATH}` ({VALUE}) exceeds the limit of ({MAX}).'],
    min: [1, '`{PATH}` ({VALUE}) is beneath the limit ({MIN}).']
  },
  imageUrl: {
    type: String,
    required: '`{PATH}` is required!',
    trim: true,
    maxLength: [1000, '`{PATH}` ({VALUE}) exceeds the limit of ({MAXLENGTH}) characters.'],
    minLength: [4, '`{PATH}` ({VALUE}) is beneath the limit ({MINLENGTH}) characters.']
  },
  city: {
    type: String,
    maxLength: [1000, '`{PATH}` ({VALUE}) exceeds the limit of ({MAXLENGTH}) characters.'],
    minLength: [4, '`{PATH}` ({VALUE}) is beneath the limit ({MINLENGTH}) characters.']
  },
  price: {
    type: Number,
    required: '`{PATH}` is required!',
    max: [10000000000, '`{PATH}` ({VALUE}) exceeds the limit of ({MAX}).'],
    min: [0.01, '`{PATH}` ({VALUE}) is beneath the limit ({MIN}).']
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
export const Game = mongoose.model('Game', gameSchema)

// Create a schema for the User documents.
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: 'VALIDATION ERROR: `{PATH}` is required!',
    trim: true,
    unique: true,
    maxlength: [100, 'VALIDATION ERROR: `{PATH}` ({VALUE}) exceeds the limit of ({MAXLENGTH}) characters.'],
    minlength: [4, 'VALIDATION ERROR: `{PATH}` ({VALUE}) is beneath the limit ({MINLENGTH}) characters.']
  },
  username: {
    type: String,
    //required: '`{PATH}` is required!',
    trim: true,
    //unique: [true, '`{PATH}` is not unique!'],
    maxLength: [100, '`{PATH}` ({VALUE}) exceeds the limit of ({MAXLENGTH}) characters.'],
    minLength: [3, '`{PATH}` ({VALUE}) is beneath the limit ({MINLENGTH}) characters.']
  },
  city: {
    type: String,
    //required: '`{PATH}` is required!',
    trim: true,
    maxLength: [1000, '`{PATH}` ({VALUE}) exceeds the limit of ({MAXLENGTH}) characters.'],
    minLength: [1, '`{PATH}` ({VALUE}) is beneath the limit ({MINLENGTH}) characters.']
  },
  profileBody: {
    type: String,
    trim: true,
    maxLength: [2000, '`{PATH}` ({VALUE}) exceeds the limit of ({MAX}).'],
  },
  imageUrl: {
    type: String,
    trim: true,
    maxLength: [1000, '`{PATH}` ({VALUE}) exceeds the limit of ({MAXLENGTH}) characters.']
  }
}, {
  timestamps: true,
  versionKey: false
})

// Create a model using the schema.
export const User = mongoose.model('User', userSchema)