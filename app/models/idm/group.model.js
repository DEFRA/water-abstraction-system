'use strict'

/**
 * Model for group
 * @module GroupModel
 */

const { Model } = require('objection')

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

  static get relationMappings () {
    return {
      groupRoles: {
        relation: Model.HasManyRelation,
        modelClass: 'group-role.model',
        join: {
          from: 'groups.groupId',
          to: 'groupRoles.groupId'
        }
      },
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: 'role.model',
        join: {
          from: 'groups.groupId',
          through: {
            from: 'groupRoles.groupId',
            to: 'groupRoles.roleId'
          },
          to: 'roles.roleId'
        }
      },
      userGroups: {
        relation: Model.HasManyRelation,
        modelClass: 'user-group.model',
        join: {
          from: 'groups.groupId',
          to: 'userGroups.groupId'
        }
      },
      users: {
        relation: Model.ManyToManyRelation,
        modelClass: 'user.model',
        join: {
          from: 'groups.groupId',
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

module.exports = GroupModel
