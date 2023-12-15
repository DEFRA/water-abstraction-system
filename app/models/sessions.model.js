'use strict'

/**
 * Model for sessions
 * @module SessionstModel
 */

const BaseModel = require('./base.model.js')

class SessionsModel extends BaseModel {
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

module.exports = SessionsModel
