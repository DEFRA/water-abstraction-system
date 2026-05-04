'use strict'

/**
 * Formats data for external users on the `/users/external/{id}/details` page
 * @module DetailsPresenter
 */

const { formatLongDateTime } = require('../../base.presenter.js')
const { today } = require('../../../lib/general.lib.js')

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
 * @param {module:LicenceModel[]} licences - The licences linked to the user, including their related roles and current licence
 * @param {string[]} viewingUserScope - The 'scope' taken off the `request.auth` object passed to the `ViewUserInternalService`
 * @param {string} back - The 'back' query parameter, used to indicate what back link should be shown on the page
 *
 * @returns {object} The data formatted for the view template
 */
function go(user, licences, viewingUserScope, back) {
  const permissions = user.$permissions()

  const formattedLicences = _userLicences(licences)
  const displayLicenceEndedMessage = formattedLicences.some((formattedLicence) => {
    return formattedLicence.status
  })

  return {
    backLink: _backLink(back),
    displayLicenceEndedMessage,
    id: user.id,
    lastSignedIn: _lastSignedIn(user),
    licences: formattedLicences,
    pageTitle: 'User details',
    pageTitleCaption: user.username,
    permissions: permissions.label,
    roles: _roles(permissions),
    showEditButton: viewingUserScope.includes('manage_accounts'),
    status: user.$status()
  }
}

function _backLink(back) {
  if (back === 'users') {
    return {
      href: '/system/users',
      text: 'Go back to users'
    }
  }

  return {
    href: '/',
    text: 'Go back to search'
  }
}

function _userLicences(licences) {
  return licences.map((licence) => {
    const { id, licenceRef, licenceVersions } = licence
    const licenceEndDetails = licence.$ends()

    return {
      currentLicenceHolder: licenceVersions[0].licenceVersionHolder.derivedName,
      id,
      licenceLink: `/system/licences/${id}/summary`,
      licenceRef,
      permissions: _licencePermissions(licence),
      status: _status(licenceEndDetails)
    }
  })
}

function _licencePermissions(licence) {
  const { licenceEntityRoles } = licence.licenceDocumentHeader

  let role = licenceEntityRoles.some((licenceEntityRole) => {
    return licenceEntityRole.role === 'primary_user'
  })

  if (role) {
    return 'Primary user'
  }

  role = licenceEntityRoles.some((licenceEntityRole) => {
    return licenceEntityRole.role === 'user_returns'
  })

  if (role) {
    return 'Returns user'
  }

  return 'Basic access'
}

function _status(licenceEndDetails) {
  if (licenceEndDetails && licenceEndDetails.date <= today()) {
    return licenceEndDetails.reason
  }

  return null
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
