'use strict'

/**
 * Model for users (idm.users)
 * @module UserModel
 */

const { hashSync } = require('bcryptjs')
const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class UserModel extends BaseModel {
  static get tableName() {
    return 'users'
  }

  static get relationMappings() {
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
      licenceMonitoringStations: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-monitoring-station.model',
        join: {
          from: 'users.id',
          to: 'licenceMonitoringStations.createdBy'
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

  /**
   * Modifiers allow us to reuse logic in queries, eg. select the user and everything to get their permissions:
   *
   * ```javascript
   * return UserModel.query()
   *   .findById(userId)
   *   .modify('permissions')
   * ```
   *
   * See {@link https://vincit.github.io/objection.js/recipes/modifiers.html | Modifiers} for more details
   *
   * @returns {object}
   */
  static get modifiers() {
    return {
      // status modifier ensures all the properties we need to determine the user's status are selected
      status(query) {
        query.select(['enabled', 'lastLogin'])
      }
    }
  }

  static generateHashedPassword(password) {
    // 10 is the number of salt rounds to perform to generate the salt. The legacy code uses
    // const salt = bcrypt.genSaltSync(10) to pre-generate the salt before passing it to hashSync(). But this is
    // intended for operations where you need to hash a large number of values. If you just pass in a number bcrypt will
    // autogenerate the salt for you.
    // https://github.com/kelektiv/node.bcrypt.js#usage
    return hashSync(password, 10)
  }

  /**
   * Returns the user's status
   *
   * Each user record has an `enabled` field. But they also have a `last_login`. If `enabled` is false we return
   * 'disabled'.
   *
   * But if `enabled` is true, we also look at `last_login`. If it is null we return 'awaiting' to indicate that the
   * user has never logged in, which means they have not responded to their invite.
   *
   * If it is not null, then we return `enabled` to indicate the user is live and has been used.
   *
   * @returns {string} the user's status
   */
  $status() {
    if (!this.enabled) {
      return 'disabled'
    }

    if (!this.lastLogin) {
      return 'awaiting'
    }

    return 'enabled'
  }
}

module.exports = UserModel
