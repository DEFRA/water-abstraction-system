'use strict'

/**
 * Model for sessions
 * @module SessionModel
 */

const BaseModel = require('./base.model.js')

class SessionModel extends BaseModel {
  static get tableName () {
    return 'sessions'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes () {
    return [
      'data'
    ]
  }
}

module.exports = SessionModel
