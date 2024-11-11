'use strict'

/**
 * Model for roles (idm.roles)
 * @module RoleModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class RoleModel extends BaseModel {
  static get tableName() {
    return 'roles'
  }

  static get relationMappings() {
    return {
      groupRoles: {
        relation: Model.HasManyRelation,
        modelClass: 'group-role.model',
        join: {
          from: 'roles.id',
          to: 'groupRoles.roleId'
        }
      },
      userRoles: {
        relation: Model.HasManyRelation,
        modelClass: 'user-role.model',
        join: {
          from: 'roles.id',
          to: 'userRoles.roleId'
        }
      },
      groups: {
        relation: Model.ManyToManyRelation,
        modelClass: 'group.model',
        join: {
          from: 'roles.id',
          through: {
            from: 'groupRoles.roleId',
            to: 'groupRoles.groupId'
          },
          to: 'groups.id'
        }
      },
      users: {
        relation: Model.ManyToManyRelation,
        modelClass: 'user.model',
        join: {
          from: 'roles.id',
          through: {
            from: 'userRoles.roleId',
            to: 'userRoles.userId'
          },
          to: 'users.id'
        }
      }
    }
  }
}

module.exports = RoleModel
