'use strict'

/**
 * Formats data for external users on the `/users/external/{id}/details` page
 * @module DetailsPresenter
 */

const { formatLongDateTime } = require('../../base.presenter.js')
const { sourceNavigation } = require('../base-users.presenter.js')

const EXTERNAL_ROLES = {
  primary_user: {
    description: 'Create and manage other external user accounts for the linked licences',
    name: 'Primary user'
  },
  returns_user: {
    description: 'Submit returns for the linked licences',
    name: 'Returns user'
  }
}

/**
 * Formats data for external users on the `/users/external/{id}/details` page
 *
 * @param {module:UserModel} user - The user, including their related companies and the licence document headers that
 * are attached to those companies
 * @param {string[]} viewingUserScope - The 'scope' taken off the `request.auth` object passed to the
 * `ViewDetailsService`
 * @param {string} back - The 'back' query parameter, used to indicate what back link should be shown on the page
 *
 * @returns {object} The data formatted for the view template
 */
function go(user, viewingUserScope, back) {
  const permissions = user.$permissions()

  const canManageAccounts = viewingUserScope.includes('manage_accounts')
  const sourceNavigationDetails = sourceNavigation(back, canManageAccounts)

  return {
    activeNavBar: sourceNavigationDetails.activeNavBar,
    backLink: sourceNavigationDetails.backLink,
    backQueryString: sourceNavigationDetails.backQueryString,
    lastSignedIn: _lastSignedIn(user),
    pageTitle: 'User details',
    pageTitleCaption: user.username,
    permissions: permissions.label,
    roles: _roles(permissions),
    status: user.$status()
  }
}

function _roles(permissions) {
  const roles = []

  if (permissions.key === 'primary_user') {
    roles.push(EXTERNAL_ROLES.primary_user)
    roles.push(EXTERNAL_ROLES.returns_user)

    return roles
  }

  if (permissions.key === 'returns_user') {
    roles.push(EXTERNAL_ROLES.returns_user)

    return roles
  }

  return roles
}

function _lastSignedIn(user) {
  const { lastLogin } = user

  if (!lastLogin) {
    return 'Never signed in'
  }

  return formatLongDateTime(lastLogin)
}

module.exports = {
  go
}
