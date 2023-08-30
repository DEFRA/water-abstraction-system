'use strict'

/**
 * Model for user
 * @module UserModel
 */

const { hashSync } = require('bcryptjs')

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

  static generateHashedPassword (password) {
    // 10 is the number of salt rounds to perform to generate the salt. The legacy code uses
    // const salt = bcrypt.genSaltSync(10) to pre-generate the salt before passing it to hashSync(). But this is
    // intended for operations where you need to hash a large number of values. If you just pass in a number bcrypt will
    // autogenerate the salt for you.
    // https://github.com/kelektiv/node.bcrypt.js#usage
    return hashSync(password, 10)
  }
}

module.exports = UserModel
