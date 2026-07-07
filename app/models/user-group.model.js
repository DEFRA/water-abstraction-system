/**
 * Model for user_groups (idm.user_groups)
 * @module UserGroupModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'

class UserGroupModel extends BaseModel {
  static get tableName() {
    return 'userGroups'
  }

  static get relationMappings() {
    return {
      group: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'group.model',
        join: {
          from: 'userGroups.groupId',
          to: 'groups.id'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'user.model',
        join: {
          from: 'userGroups.userId',
          to: 'users.userId'
        }
      }
    }
  }
}

export default UserGroupModel
