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
 * - **Permissions** - Only applies to internal users so if set, we automatically exclude external users. Then
 * _Basic access_ is a user not linked to any groups. A _Digitise!_ user is linked to the 'nps' group and has either the
 * `ar_approver` or `ar_user` role. All other permissions the user is linked to the specified group. This includes users
 * linked to 'nps' but that have no user roles.
 * - **Status** - Where the user is disabled, enabled (has logged in), awaiting (enabled but has not yet logged in), or
 * locked (password has been set to 'VOID' to prevent login)
 * - **Type** - The application the user belongs to i.e. internal or external
 *
 * @param {object} filters - an object containing the different filters to apply to the query
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<module:UserModel[]>} an array of users that match the selected 'page in the data
 */
async function go(filters, page) {
  const query = _fetchQuery()

  _applyFilters(query, filters)

  query.orderBy('users.username', 'asc').page(page - 1, DatabaseConfig.defaultPageSize)

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
    _applyPermissionsFilter(query, permissions)
  }

  if (status) {
    _applyStatusFilter(query, status)
  }
}

function _applyPermissionsFilter(query, permissions) {
  const permissionDetails = userPermissions[permissions]

  // Permissions only apply to internal users, so we can focus on those only
  query.where('users.application', 'water_admin')

  if (['billing_and_data', 'environment_officer', 'psc', 'super', 'wirs'].includes(permissions)) {
    _applyStandardPermissionFilter(query, permissionDetails.groups)

    return
  }

  if (permissions === 'basic') {
    _applyBasicPermissionFilter(query)

    return
  }

  if (permissions === 'nps') {
    _applyNpsPermissionFilter(query, permissionDetails.groups)

    return
  }

  _applyDigitisePermissionFilter(query, permissionDetails)
}

/**
 * The basic permission is that the user is not linked to _any_ groups
 *
 * @private
 */
function _applyBasicPermissionFilter(query) {
  query.whereRaw(`NOT EXISTS (SELECT 1 FROM public.user_groups ug WHERE ug.user_id = users.id)`)
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
  WHERE ur.user_id = users.id AND r."role" IN (?)
)
  `,
    roles
  )
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
  WHERE ur.user_id = users.id AND r."role" IN ('ar_approver', 'ar_user')
)
  `
  )
}

function _applyStandardPermissionFilter(query, groups) {
  query.whereRaw(
    `EXISTS (
  SELECT 1 FROM public.user_groups ug
  INNER JOIN public."groups" g ON g.id = ug.group_id
  WHERE ug.user_id = users.id AND g."group" IN (?)
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

  if (status === 'locked') {
    query.where('users.password', 'VOID')
  } else if (status === 'awaiting') {
    query.whereNull('users.lastLogin')
  } else {
    query.whereNotNull('users.lastLogin')
  }
}

function _fetchQuery() {
  return UserModel.query().select(['id', 'username']).modify('status').modify('permissions')
}

module.exports = {
  go
}
