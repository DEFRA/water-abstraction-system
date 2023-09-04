'use strict'

/**
 * Model for role
 * @module RoleModel
 */

const { Model } = require('objection')

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

  static get relationMappings () {
    return {
      groupRoles: {
        relation: Model.HasManyRelation,
        modelClass: 'group-role.model',
        join: {
          from: 'roles.roleId',
          to: 'groupRoles.roleId'
        }
      },
      userRoles: {
        relation: Model.HasManyRelation,
        modelClass: 'user-role.model',
        join: {
          from: 'roles.roleId',
          to: 'userRoles.roleId'
        }
      },
      groups: {
        relation: Model.ManyToManyRelation,
        modelClass: 'group.model',
        join: {
          from: 'roles.roleId',
          through: {
            from: 'groupRoles.roleId',
            to: 'groupRoles.groupId'
          },
          to: 'groups.groupId'
        }
      },
      users: {
        relation: Model.ManyToManyRelation,
        modelClass: 'user.model',
        join: {
          from: 'roles.roleId',
          through: {
            from: 'userRoles.roleId',
            to: 'userRoles.userId'
          },
          to: 'users.userId'
        }
      }
    }
  }
}

module.exports = RoleModel
