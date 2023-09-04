'use strict'

/**
 * Model for user
 * @module UserModel
 */

const { hashSync } = require('bcryptjs')
const { Model } = require('objection')

const IDMBaseModel = require('./idm-base.model.js')

class UserModel extends IDMBaseModel {
  static get tableName () {
    return 'users'
  }

  static get idColumn () {
    return 'userId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes () {
    return [
      'userData',
      'role'
    ]
  }

  static get relationMappings () {
    return {
      userGroups: {
        relation: Model.HasManyRelation,
        modelClass: 'user-group.model',
        join: {
          from: 'users.userId',
          to: 'userGroups.userId'
        }
      },
      userRoles: {
        relation: Model.HasManyRelation,
        modelClass: 'user-role.model',
        join: {
          from: 'users.userId',
          to: 'userRoles.userId'
        }
      },
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: 'role.model',
        join: {
          from: 'users.userId',
          through: {
            from: 'userRoles.userId',
            to: 'userRoles.roleId'
          },
          to: 'roles.roleId'
        }
      },
      groups: {
        relation: Model.ManyToManyRelation,
        modelClass: 'group.model',
        join: {
          from: 'users.userId',
          through: {
            from: 'userGroups.userId',
            to: 'userGroups.groupId'
          },
          to: 'groups.groupId'
        }
      }
    }
  }

  static generateHashedPassword (password) {
    // 10 is the number of salt rounds to perform to generate the salt. The legacy code uses
    // const salt = bcrypt.genSaltSync(10) to pre-generate the salt before passing it to hashSync(). But this is
    // intended for operations where you need to hash a large number of values. If you just pass in a number bcrypt will
    // autogenerate the salt for you.
    // https://github.com/kelektiv/node.bcrypt.js#usage
    return hashSync(password, 10)
  }
}

module.exports = UserModel
