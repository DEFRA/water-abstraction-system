'use strict'

/**
 * Model for user_roles (idm.user_roles)
 * @module UserRoleModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class UserRoleModel extends BaseModel {
  static get tableName() {
    return 'userRoles'
  }

  static get relationMappings() {
    return {
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'role.model',
        join: {
          from: 'userRoles.roleId',
          to: 'roles.id'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'user.model',
        join: {
          from: 'userRoles.userId',
          to: 'users.id'
        }
      }
    }
  }
}

module.exports = UserRoleModel
