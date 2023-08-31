'use strict'

/**
 * Model for user role
 * @module UserRoleModel
 */

const { Model } = require('objection')

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

  static get relationMappings () {
    return {
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'role.model',
        join: {
          from: 'userRoles.roleId',
          to: 'roles.roleId'
        }
      }
    }
  }
}

module.exports = UserRoleModel
