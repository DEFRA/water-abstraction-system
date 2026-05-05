'use strict'

/**
 * Formats data for internal users on the `/users/internal/{id}/details` page
 * @module UserPresenter
 */

const { compareStrings } = require('../../../lib/general.lib.js')
const { formatLongDateTime, sentenceCase } = require('../../base.presenter.js')

/**
 * Formats data for internal users on the `/users/internal/{id}/details` page
 *
 * @param {module:UserModel} user - The user instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(user) {
  const { id, username } = user

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
    status: user.$status()
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

      roles.push({ description, name: _convertToSentenceCase(name) })
    }
  }

  for (const role of user.roles) {
    const { description, role: name } = role

    roles.push({ description, name: _convertToSentenceCase(name) })
  }

  roles.sort((first, second) => {
    return compareStrings(first.name, second.name)
  })

  return roles
}

module.exports = {
  go
}
