/**
 * Formats data for internal users on the `/users/internal/{id}/details` page
 * @module DetailsPresenter
 */

import { compareStrings } from '../../../lib/general.lib.js'
import { formatLongDateTime, sentenceCase } from '../../base.presenter.js'

/**
 * Formats data for internal users on the `/users/internal/{id}/details` page
 *
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {module:UserModel} user - The user instance
 *
 * @returns {object} The data formatted for the view template
 */
export default function (auth, user) {
  const { id, username } = user

  const status = user.$status()

  return {
    backLink: {
      href: '/system/users',
      text: 'Go back to users'
    },
    id,
    lastSignedIn: _lastSignedIn(user),
    pageTitle: 'User details',
    pageTitleCaption: username,
    permissions: user.$permissions().label,
    roles: _roles(user),
    showEditButton: auth.credentials.user.id !== id,
    status
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

function _roles(user) {
  const roles = []

  for (const group of user.groups) {
    for (const role of group.roles) {
      const { description, role: name } = role

      roles.push(_mapRole({ description, role: name }))
    }
  }

  for (const role of user.roles) {
    const { description, role: name } = role

    roles.push(_mapRole({ description, role: name }))
  }

  roles.sort((first, second) => {
    return compareStrings(first.name, second.name)
  })

  return roles
}

/**
 * This is a hack until such time as we are ready to update the mapped roles and descriptions in the DB, or adopt the
 * {@link https://github.com/DEFRA/water-abstraction-system/pull/3186 | simplified permissions}.
 *
 * > See also {@link https://eaflood.atlassian.net/browse/WATER-5562 | WATER-5562}
 *
 * @private
 */
function _mapRole(role) {
  const { description, role: name } = role

  if (name === 'unlink_licences') {
    return { description: 'Unregister licences registered to users', name: 'Unregister licences' }
  }

  return { description, name: _convertToSentenceCase(name) }
}
