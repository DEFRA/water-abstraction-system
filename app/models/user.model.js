'use strict'

/**
 * Model for users (idm.users)
 * @module UserModel
 */

const { hashSync } = require('bcryptjs')
const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class UserModel extends BaseModel {
  static get tableName () {
    return 'users'
  }

  static get relationMappings () {
    return {
      chargeVersionNotes: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-version-note.model',
        join: {
          from: 'users.id',
          to: 'chargeVersionNotes.userId'
        }
      },
      groups: {
        relation: Model.ManyToManyRelation,
        modelClass: 'group.model',
        join: {
          from: 'users.id',
          through: {
            from: 'userGroups.userId',
            to: 'userGroups.groupId'
          },
          to: 'groups.id'
        }
      },
      licenceEntity: {
        relation: Model.HasOneRelation,
        modelClass: 'licence-entity.model',
        join: {
          from: 'users.licenceEntityId',
          to: 'licenceEntities.id'
        }
      },
      returnVersions: {
        relation: Model.HasManyRelation,
        modelClass: 'return-version.model',
        join: {
          from: 'users.id',
          to: 'returnVersions.createdBy'
        }
      },
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: 'role.model',
        join: {
          from: 'users.id',
          through: {
            from: 'userRoles.userId',
            to: 'userRoles.roleId'
          },
          to: 'roles.id'
        }
      },
      userGroups: {
        relation: Model.HasManyRelation,
        modelClass: 'user-group.model',
        join: {
          from: 'users.id',
          to: 'userGroups.userId'
        }
      },
      userRoles: {
        relation: Model.HasManyRelation,
        modelClass: 'user-role.model',
        join: {
          from: 'users.id',
          to: 'userRoles.userId'
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
