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
          from: 'users.userId',
          to: 'chargeVersionNotes.userId'
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
          from: 'users.userId',
          to: 'licenceMonitoringStations.createdBy'
        }
      },
      returnVersions: {
        relation: Model.HasManyRelation,
        modelClass: 'return-version.model',
        join: {
          from: 'users.userId',
          to: 'returnVersions.createdBy'
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
          to: 'roles.id'
        }
      },
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
      }
    }
  }

  /**
   * Modifiers allow us to reuse logic in queries, eg. select the user and everything to get their permissions:
   *
   * ```javascript
   * return UserModel.query()
   *   .where('userId', userId).first().limit(1)
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
      // role modifier fetches all licence entity roles for the user from which their role can be determined
      role(query) {
        query.withGraphFetched('licenceEntity').modifyGraph('licenceEntity', (licenceEntityBuilder) => {
          licenceEntityBuilder
            .select(['id'])
            .withGraphFetched('licenceEntityRoles')
            .modifyGraph('licenceEntityRoles', (licenceEntityRolesBuilder) => {
              licenceEntityRolesBuilder.select(['id', 'role'])
            })
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
   * Returns the user's role
   *
   * > We recommend adding the `role` modifier to your query if you need to determine a user's role
   *
   * Role differs from permissions in that it is a higher level classification of user, relative to a licence (for the
   * most part).
   *
   * In the main they are applicable to external users, though there are a great many internal users who also have
   * roles.
   *
   * ## The external user journey
   *
   * When someone requests to create an account, the legacy service will send them an email with a link to verify their
   * email address. It will also create a user record but will leave `licence_entity_id` null.
   *
   * Once they verify their email address and set their password, they can login. At this point the service will create
   * a `LicenceEntity` and link it to the user by setting `licence_entity_id`.
   *
   * They can do nothing though until they request access to a licence. When they do that a `LicenceEntityRole` record
   * will be created, linked to the `LicenceEntity` record. Its `role` field will be set to `primary_user`.
   *
   * The request process involves sending a letter with a code to the licence holder's address. Once the user returns
   * to the service and enters that code, they can begin to administer the licence. This includes adding other users.
   *
   * Users added by the primary user will automatically have a `LicenceEntity` record added, plus a `LicenceEntityRole`
   * record set to `user`. If the primary user selects to allow them to submit returns, an _additional_
   * `LicenceEntityRole` will be created set to `user_returns`.
   *
   * If the primary users subsequently removes the submit returns permission, the `user_returns` `LicenceEntityRole`
   * will be deleted. If they remove the user entirely, all `LicenceEntityRole` records for that user will be deleted
   *
   * ## Internal users
   *
   * We don't yet understand how some internal users can also be linked to `primary_user`, `user_returns` or `user`
   * roles. Also, a large number of them will have a `LicenceEntityRole` with the role `admin`.
   *
   * ## Determining the role
   *
   * This all means determining the 'role' for a user is a bit of a minefield!
   *
   * Because a user can have multiple roles, we rank them by precedence
   *
   * - **Admin** (admin)
   * - **Primary user** (primary_user)
   * - **Returns agent** (user_returns)
   * - **Agent** (user)
   *
   * If a user has no roles, we default to 'None'.
   *
   * @returns {string} The user's role
   */
  $role() {
    const entityRoles = this.licenceEntity?.licenceEntityRoles || []

    const roles = entityRoles.map((entityRole) => {
      return entityRole.role
    })

    if (roles.includes('admin')) {
      return 'Admin'
    }

    if (roles.includes('primary_user')) {
      return 'Primary user'
    }

    if (roles.includes('user_returns')) {
      return 'Returns agent'
    }

    if (roles.includes('user')) {
      return 'Agent'
    }

    return 'None'
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
