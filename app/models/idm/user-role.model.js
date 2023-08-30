'use strict'

/**
 * Model for user role
 * @module UserRoleModel
 */

const IDMBaseModel = require('./idm-base.model.js')

class UserRoleModel extends IDMBaseModel {
  static get tableName () {
    return 'userRoles'
  }

  static get idColumn () {
    return 'userRoleId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }
}

module.exports = UserRoleModel
