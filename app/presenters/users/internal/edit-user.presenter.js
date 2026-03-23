'use strict'

/**
 * Formats data for users on the `/users/internal/{userId}/edit` page
 * @module EditUserPresenter
 */

const { formatLongDateTime, sentenceCase } = require('../../base.presenter.js')

/**
 * Formats data for users on the `/users/internal/{userId}/edit` page
 *
 * @param {module:UserModel} user - The user instance
 * @param {object} allPermissionsDetails - All possible permissions details for internal users
 * @param {string} permissions - The key of the user's current permissions
 *
 * @returns {object} The data formatted for the view template
 */
function go(user, allPermissionsDetails, permissions) {
  const { id, username } = user

  return {
    cancelLink: _cancelLink(id),
    id,
    lastSignedIn: _lastSignedIn(user),
    pageTitle: `User ${username}`,
    pageTitleCaption: 'Internal',
    permissionOptions: _permissionOptions(allPermissionsDetails, permissions),
    permissions,
    status: user.$status()
  }
}

function _cancelLink(id) {
  return {
    href: `/system/users/internal/${id}`,
    text: 'Cancel'
  }
}

function _convertToSentenceCase(name) {
  const parts = name.split('_')

  // We have the roles ar_approver, ar_user and hof_notifications. AR and HOF are acronyms so should be capitalised.
  // Fortunately, because we know they are the only acronyms we have, and they are all 3 chars or less we can assume
  // that any first 'part' which is 3 chars or less is one of these.
  if (parts[0].length > 3) {
    parts[0] = sentenceCase(parts[0])
  } else {
    parts[0] = parts[0].toUpperCase()
  }

  return parts.join(' ')
}

function _lastSignedIn(user) {
  const { lastLogin } = user

  if (!lastLogin) {
    return 'Never signed in'
  }

  return formatLongDateTime(lastLogin)
}

function _permissionOptions(allPermissionsDetails, permissions) {
  return Object.entries(allPermissionsDetails)
    .filter(([_key, { application }]) => {
      return application === 'water_admin' || application === 'both'
    })
    .map(([key, { groups, label, roles }]) => {
      const rolesHint = _rolesHint({ groups, roles })
      return {
        checked: key === permissions,
        hint: { text: rolesHint },
        text: label,
        value: key
      }
    })
}

function _roles(groupsAndRoles) {
  const roles = []

  for (const group of groupsAndRoles.groups) {
    for (const role of group.roles) {
      const { description, role: name } = role

      roles.push({ description, name: _convertToSentenceCase(name) })
    }
  }

  for (const role of groupsAndRoles.roles) {
    const { description, role: name } = role

    roles.push({ description, name: _convertToSentenceCase(name) })
  }

  roles.sort((a, b) => {
    return a.name.localeCompare(b.name)
  })

  return roles
}

function _rolesHint(groupsAndRoles) {
  const roles = _roles(groupsAndRoles)

  if (roles.length === 0) {
    return 'Grants no additional roles'
  }

  const roleList = roles
    .map((role) => {
      return role.name
    })
    .join(', ')

  return `Grants: ${roleList}`
}

module.exports = {
  go
}
