/**
 * Model for group_roles (idm.group_roles)
 * @module GroupRoleModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import GroupModel from './group.model.js'
import RoleModel from './role.model.js'

export default class GroupRoleModel extends BaseModel {
  static get tableName() {
    return 'groupRoles'
  }

  static get relationMappings() {
    return {
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: RoleModel,
        join: {
          from: 'groupRoles.roleId',
          to: 'roles.id'
        }
      },
      group: {
        relation: Model.BelongsToOneRelation,
        modelClass: GroupModel,
        join: {
          from: 'groupRoles.groupId',
          to: 'groups.id'
        }
      }
    }
  }
}