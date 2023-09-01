'use strict'

/**
 * Model for group role
 * @module GroupRoleModel
 */

const IDMBaseModel = require('./idm-base.model.js')

class GroupRoleModel extends IDMBaseModel {
  static get tableName () {
    return 'groupRoles'
  }

  static get idColumn () {
    return 'groupRoleId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }
}

module.exports = GroupRoleModel
