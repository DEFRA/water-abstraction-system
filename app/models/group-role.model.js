/**
 * Model for group_roles (idm.group_roles)
 * @module GroupRoleModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'

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

export default GroupRoleModel
