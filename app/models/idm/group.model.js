'use strict'

/**
 * Model for group
 * @module GroupModel
 */

const IDMBaseModel = require('./idm-base.model.js')

class GroupModel extends IDMBaseModel {
  static get tableName () {
    return 'groups'
  }

  static get idColumn () {
    return 'groupId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }
}

module.exports = GroupModel
