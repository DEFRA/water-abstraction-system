'use strict'

/**
 * Model for user group
 * @module UserGroupModel
 */

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
}

module.exports = UserGroupModel
