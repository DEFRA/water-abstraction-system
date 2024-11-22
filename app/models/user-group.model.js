'use strict'

/**
 * Model for user_groups (idm.user_groups)
 * @module UserGroupModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

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
          to: 'users.id'
        }
      }
    }
  }
}

module.exports = UserGroupModel
