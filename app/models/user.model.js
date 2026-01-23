'use strict'

/**
 * Model for users (idm.users)
 * @module UserModel
 */

const { hashSync } = require('bcryptjs')
const { Model } = require('objection')

const BaseModel = require('./base.model.js')
const { db } = require('../../db/db.js')
const { userPermissions } = require('../lib/static-lookups.lib.js')

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
      // permissions modifier fetches the groups and roles for the user which are needed to determine their permissions
      permissions(query) {
        query
          .select(['application'])
          .withGraphFetched('groups')
          .modifyGraph('groups', (groupsBuilder) => {
            groupsBuilder.select(['groups.group', 'groups.id'])
          })
          .withGraphFetched('roles')
          .modifyGraph('roles', (rolesBuilder) => {
            rolesBuilder.select(['roles.id', 'roles.role'])
          })
      },
      // status modifier ensures all the properties we need to determine the user's status are selected. For the
      // purposes of determining the user's status, we only need to know if their password is 'VOID'. If its not, we
      // don't want to fetch it from the DB.
      status(query) {
        query.select([
          'enabled',
          'lastLogin',
          db.raw(`(CASE WHEN users.password = 'VOID' THEN 'VOID' ELSE NULL END) AS "statusPassword"`)
        ])
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
   * Returns details of the user's permissions for internal users (always null for external).
   *
   * > We recommend adding the `permissions` modifier to your query if you need to determine a user's permissions
   *
   * When you add or edit an internal user, you select from a list of permissions. They are:
   *
   * - Basic access
   * - Billing and Data
   * - Environment Officer
   * - National Permitting Service
   * - National Permitting Service and Digitise! approver
   * - National Permitting Service and Digitise! editor
   * - Permitting and Support Centre
   * - Waste and Industry Regulatory Service
   *
   * > There is also a 'Superuser' permission but this is not assigned via the UI.
   *
   * What these determine are the 'roles' a user has, which translate to 'scopes' we assign on our routes or check for
   * in our presenters and services.
   *
   * For the most part, those roles are grouped, and each user is assigned one group (though in theory they could be
   * assigned multiple groups). For example, a user with the permission "Environment Officer" is linked to the group
   * `environment_officer`, which in turn is linked to the roles `manage_gauging_station_licence_links` and
   * `hof_notifications`.
   *
   * The exceptions are "Basic access" and the "Digitise!" permissions. A basic user is _not_ assigned to any groups or
   * roles. A user with one of the Digitise permissions is assigned to the group `nps` _and_ a specific role, either
   * `ar_user` or `ar_approver`.
   *
   * This instance function uses this knowledge to determine what "permission" a user has
   *
   * @returns {object|null} For internal users an object containing the groups, roles and label for the 'permission'.
   * For external users it returns NULL
   */
  $permissions() {
    if (this.application === 'water_vml') {
      return null
    }

    if (!this.groups || !this.roles) {
      return null
    }

    const group = this.groups[0]?.group || 'basic'
    const digitiseRoles = this.roles.filter((role) => {
      return role.role.startsWith('ar_')
    })

    if (digitiseRoles.length === 0) {
      return userPermissions[group]
    }

    const digitisePermission = `${group}_${digitiseRoles[0].role}`

    return userPermissions[digitisePermission]
  }

  /**
   * Returns the user's status
   *
   * > We recommend adding the `status` modifier to your query if you need to determine a user's status
   *
   * Each user record has an `enabled` field. If `enabled` is false we return 'disabled'.
   *
   * Where it is enabled we want to break up the users further.
   *
   * - **locked** - Users who have attempted to login more than 10 times and had their password set to 'VOID' to prevent
   * further login attempts.
   * - **awaiting** - Users who are enabled but have never logged in. This indicates they have not responded to their
   * invite.
   *
   * @returns {string} the user's status
   */
  $status() {
    if (!this.enabled) {
      return 'disabled'
    }

    // If the modifier was used, we should have a 'statusPassword' property we can use to determine if the password is
    // 'VOID'. If not we fall back to checking the actual password property.
    if (this.statusPassword === 'VOID' || this.password === 'VOID') {
      return 'locked'
    }

    if (!this.lastLogin) {
      return 'awaiting'
    }

    return 'enabled'
  }
}

module.exports = UserModel
