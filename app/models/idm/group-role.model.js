'use strict'

/**
 * Model for group role
 * @module GroupRoleModel
 */

const { Model } = require('objection')

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

  static get relationMappings () {
    return {
      roles: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'role.model',
        join: {
          from: 'groupRoles.roleId',
          to: 'roles.roleId'
        }
      }
    }
  }
}

module.exports = GroupRoleModel
