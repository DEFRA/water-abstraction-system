/**
 * Model for user_roles (idm.user_roles)
 * @module UserRoleModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import RoleModel from './role.model.js'
import UserModel from './user.model.js'

export default class UserRoleModel extends BaseModel {
  static get tableName() {
    return 'userRoles'
  }

  static get relationMappings() {
    return {
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: RoleModel,
        join: {
          from: 'userRoles.roleId',
          to: 'roles.id'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: 'userRoles.userId',
          to: 'users.userId'
        }
      }
    }
  }
}
