'use strict'

/**
 * Model for groups (idm.groups)
 * @module GroupModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class GroupModel extends BaseModel {
  static get tableName() {
    return 'groups'
  }

  static get relationMappings() {
    return {
      groupRoles: {
        relation: Model.HasManyRelation,
        modelClass: 'group-role.model',
        join: {
          from: 'groups.id',
          to: 'groupRoles.groupId'
        }
      },
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: 'role.model',
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
        modelClass: 'user-group.model',
        join: {
          from: 'groups.id',
          to: 'userGroups.groupId'
        }
      },
      users: {
        relation: Model.ManyToManyRelation,
        modelClass: 'user.model',
        join: {
          from: 'groups.id',
          through: {
            from: 'userGroups.groupId',
            to: 'userGroups.userId'
          },
          to: 'users.id'
        }
      }
    }
  }
}

module.exports = GroupModel
