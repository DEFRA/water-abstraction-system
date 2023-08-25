'use strict'

/**
 * Model for role
 * @module RoleModel
 */

const IDMBaseModel = require('./idm-base.model.js')

class RoleModel extends IDMBaseModel {
  static get tableName () {
    return 'roles'
  }

  static get idColumn () {
    return 'roleId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }
}

module.exports = RoleModel
