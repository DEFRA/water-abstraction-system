'use strict'

/**
 * Fetches the selected page of users for /users
 * @module FetchUsersService
 */

const UserModel = require('../../models/user.model.js')
const { userPermissions } = require('../../lib/static-lookups.lib.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetches the selected page of users for /users
 *
 * We can filter the results by
 *
 * - **Email** - A case-insensitive `LIKE` search on the username so partial values can be used
 * - **Permissions** - What permission type the user has. For internal users this is inferred from which group, and in
 * some cases role, they are linked to. For external users this is inferred from the `LicenceEntityRoles` they have
 * across all licences. The roles have a hierarchy so if they are the 'primary_user' on any licence then they are
 * classed as 'primary_user' even if they also have licences where they are just a 'user'. If they have no
 * `LicenceEntityRoles` then they are classed as having the permission 'none'.
 * - **Status** - Where the user is disabled, enabled (has logged in), awaiting (enabled but has not yet logged in), or
 * locked (password has been set to 'VOID' to prevent login)
 * - **Type** - The application the user belongs to i.e. internal or external
 *
 * @param {object} filters - an object containing the different filters to apply to the query
 * @param {string} [page=1] - The current page for the pagination service
 *
 * @returns {Promise<module:UserModel[]>} an array of users that match the selected 'page in the data
 */
async function go(filters, page = '1') {
  const query = _fetchQuery()

  _applyFilters(query, filters)

  query.orderBy('users.username', 'asc').page(Number(page) - 1, DatabaseConfig.defaultPageSize)

  return query
}

function _applyFilters(query, filters) {
  const { email, permissions, status, type } = filters

  if (email) {
    query.whereILike('users.username', `%${email}%`)
  }

  if (type) {
    query.where('users.application', type)
  }

  if (permissions) {
    _applyPermissionsFilter(query, permissions, type)
  }

  if (status) {
    _applyStatusFilter(query, status)
  }
}

function _applyPermissionsFilter(query, permissions, type) {
  const permissionDetails = userPermissions[permissions]

  if (permissions === 'basic') {
    _applyBasicPermissionFilter(query, type)

    return
  }

  // From this point onwards, the selected permission will be specific to either internal or external users so we can
  // filter by the relevant application first before applying the permission filter
  query.where('users.application', permissionDetails.application)

  if (permissions === 'none') {
    _applyNonePermissionFilter(query)

    return
  }

  if (permissions === 'returns_user') {
    _applyReturnsUserPermissionFilter(query)

    return
  }

  if (permissions === 'primary_user') {
    _applyPrimaryUserPermissionFilter(query)

    return
  }

  if (['billing_and_data', 'environment_officer', 'psc', 'super', 'wirs'].includes(permissions)) {
    _applyStandardPermissionFilter(query, permissionDetails.groups)

    return
  }

  if (permissions === 'nps') {
    _applyNpsPermissionFilter(query, permissionDetails.groups)

    return
  }

  _applyDigitisePermissionFilter(query, permissionDetails)
}

/**
 * For internal users the 'basic' permission is that the user is not linked to _any_ groups.
 *
 * For external users, the 'basic' permission is that the user only has a single `LicenceEntityRoles` record with a role
 * of 'user'. If they have any other roles than they don't just have basic access.
 *
 * If the user has also selected the 'type' filter (internal or external) we take advantage of that to only apply the
 * relevant condition. If they haven't then we need to apply both conditions but with an OR between them to capture
 * both.
 *
 * @private
 */
function _applyBasicPermissionFilter(query, type) {
  const internalCondition = `(
    users.application = 'water_admin'
    AND NOT EXISTS (
      SELECT
        1
      FROM
        public.user_groups ug
      WHERE
        ug.user_id = users.user_id
      )
  )`

  const externalCondition = `(
    users.application = 'water_vml'
    AND EXISTS (
      SELECT
        1
      FROM
        public.licence_entity_roles ler
      WHERE
        ler.licence_entity_id = users.licence_entity_id
        AND ler."role" = 'user'
    )
    AND NOT EXISTS (
      SELECT
        1
      FROM
        public.licence_entity_roles ler
      WHERE
        ler.licence_entity_id = users.licence_entity_id
        AND ler."role" != 'user'
    )
  )`

  if (type === 'water_admin') {
    query.whereRaw(internalCondition)

    return
  }

  if (type === 'water_vml') {
    query.whereRaw(externalCondition)

    return
  }

  query.whereRaw(`(${internalCondition} OR ${externalCondition})`)
}

/**
 * The digitise permission is that the user is linked to the 'nps' group and has either the `ar_approver` or
 * `ar_user` role.
 *
 * So, we can reuse `_applyStandardPermissionFilter` to check for the group link, then add an additional condition to
 * check for the roles.
 *
 * @private
 */
function _applyDigitisePermissionFilter(query, permissionDetails) {
  const { groups, roles } = permissionDetails

  _applyStandardPermissionFilter(query, groups)

  query.whereRaw(
    `EXISTS (
  SELECT 1 FROM public.user_roles ur
  INNER JOIN public."roles" r ON r.id = ur.role_id
  WHERE ur.user_id = users.user_id AND r."role" IN (?)
)
  `,
    roles
  )
}

/**
 * The none permission is that the user is external and has no LicenceEntityRoles. Essentially, they have been unlinked
 * from all licences so have no 'roles'.
 *
 * @private
 */
function _applyNonePermissionFilter(query) {
  query.whereRaw(`
  NOT EXISTS (
    SELECT
      1
    FROM
      public.licence_entity_roles ler
    WHERE
      ler.licence_entity_id = users.licence_entity_id
  )`)
}

/**
 * The nps permission is that the user is linked to the 'nps' group but does NOT have either the `ar_approver` or
 * `ar_user` role.
 *
 * So, we can reuse `_applyStandardPermissionFilter` to check for the group link, then add an additional condition to
 * exclude those with those user roles.
 *
 * @private
 */
function _applyNpsPermissionFilter(query, groups) {
  _applyStandardPermissionFilter(query, groups)

  query.whereRaw(
    `NOT EXISTS (
  SELECT 1 FROM public.user_roles ur
  INNER JOIN public."roles" r ON r.id = ur.role_id
  WHERE ur.user_id = users.user_id AND r."role" IN ('ar_approver', 'ar_user')
)
  `
  )
}

/**
 * The primary_user permission is that the user is external and has a LicenceEntityRole with a role of 'primary_user'.
 * The way the external users are setup means this user will also have 'user_returns' and 'user' LicenceEntityRole
 * records. But as long as they have one 'primary_user' LicenceEntityRole we determine them to be a primary user.
 *
 * @private
 */
function _applyPrimaryUserPermissionFilter(query) {
  query.whereRaw(`
  EXISTS (
    SELECT
      1
    FROM
      public.licence_entity_roles ler
    WHERE
      ler.licence_entity_id = users.licence_entity_id
      AND ler."role" = 'primary_user'
  )`)
}

/**
 * The returns_user permission is that the user is external and has a LicenceEntityRole with a role of 'user_returns'.
 * But they don't have a LicenceEntityRole with the role of 'primary_user'.
 *
 * @private
 */
function _applyReturnsUserPermissionFilter(query) {
  query.whereRaw(`
  EXISTS (
    SELECT
      1
    FROM
      public.licence_entity_roles ler
    WHERE
      ler.licence_entity_id = users.licence_entity_id
      AND ler."role" = 'user_returns'
  )
  AND NOT EXISTS (
    SELECT
      1
    FROM
      public.licence_entity_roles ler
    WHERE
      ler.licence_entity_id = users.licence_entity_id
      AND ler."role" = 'primary_user'
  )`)
}

function _applyStandardPermissionFilter(query, groups) {
  query.whereRaw(
    `EXISTS (
  SELECT 1 FROM public.user_groups ug
  INNER JOIN public."groups" g ON g.id = ug.group_id
  WHERE ug.user_id = users.user_id AND g."group" IN (?)
)
  `,
    groups
  )
}

function _applyStatusFilter(query, status) {
  if (status === 'disabled') {
    query.where('users.enabled', false)

    return
  }

  // The remaining filters relate to enabled users
  query.where('users.enabled', true)

  // Locked takes precedence over 'awaiting' and 'enabled'.
  if (status === 'locked') {
    query.where('users.password', 'VOID')

    return
  }

  // If the user has selected either 'Enabled' or 'Awaiting' as the status filter, it is possible that a record where
  // the password is 'VOID' would meet the criteria depending on whether `lastLogin` is populated. We don't want
  // 'locked' records appearing in the results for these other statuses as that will be confusing. So, we add this
  // clause to ensure records that would display with a status of 'locked' are excluded from the results.
  query.whereNot('users.password', 'VOID')

  if (status === 'awaiting') {
    query.whereNull('users.lastLogin')

    return
  }

  query.whereNotNull('users.lastLogin')
}

function _fetchQuery() {
  return UserModel.query()
    .select(['id', 'licenceEntityId', 'userId', 'username'])
    .modify('status')
    .modify('permissions')
}

module.exports = {
  go
}
