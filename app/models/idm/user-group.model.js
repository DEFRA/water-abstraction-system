'use strict'

/**
 * Model for user group
 * @module UserGroupModel
 */

const { Model } = require('objection')

const IDMBaseModel = require('./idm-base.model.js')

class UserGroupModel extends IDMBaseModel {
  static get tableName () {
    return 'userGroups'
  }

  static get idColumn () {
    return 'userGroupId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      group: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'group.model',
        join: {
          from: 'userGroups.groupId',
          to: 'groups.groupId'
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

module.exports = UserGroupModel
