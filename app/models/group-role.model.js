'use strict'

/**
 * Model for group_roles (idm.group_roles)
 * @module GroupRoleModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class GroupRoleModel extends BaseModel {
  static get tableName() {
    return 'groupRoles'
  }

  static get relationMappings() {
    return {
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'role.model',
        join: {
          from: 'groupRoles.roleId',
          to: 'roles.id'
        }
      },
      group: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'group.model',
        join: {
          from: 'groupRoles.groupId',
          to: 'groups.id'
        }
      }
    }
  }
}

module.exports = GroupRoleModel
