'use strict'

/**
 * Model for user
 * @module UserModel
 */

const IDMBaseModel = require('./idm-base.model.js')

class UserModel extends IDMBaseModel {
  static get tableName () {
    return 'users'
  }

  static get idColumn () {
    return 'userId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes () {
    return [
      'userData',
      'role'
    ]
  }
}

module.exports = UserModel
