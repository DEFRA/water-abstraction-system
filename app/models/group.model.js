/**
 * Model for groups (idm.groups)
 * @module GroupModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import GroupRoleModel from './group-role.model.js'
import RoleModel from './role.model.js'
import UserGroupModel from './user-group.model.js'
import UserModel from './user.model.js'

export default class GroupModel extends BaseModel {
  static get tableName() {
    return 'groups'
  }

  static get relationMappings() {
    return {
      groupRoles: {
        relation: Model.HasManyRelation,
        modelClass: GroupRoleModel,
        join: {
          from: 'groups.id',
          to: 'groupRoles.groupId'
        }
      },
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: RoleModel,
        join: {
          from: 'groups.id',
          through: {
            from: 'groupRoles.groupId',
            to: 'groupRoles.roleId'
          },
          to: 'roles.id'
        }
      },
      userGroups: {
        relation: Model.HasManyRelation,
        modelClass: UserGroupModel,
        join: {
          from: 'groups.id',
          to: 'userGroups.groupId'
        }
      },
      users: {
        relation: Model.ManyToManyRelation,
        modelClass: UserModel,
        join: {
          from: 'groups.id',
          through: {
            from: 'userGroups.groupId',
            to: 'userGroups.userId'
          },
          to: 'users.userId'
        }
      }
    }
  }
}
