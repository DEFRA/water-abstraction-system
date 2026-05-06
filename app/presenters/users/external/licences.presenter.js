'use strict'

/**
 * Formats data for external users on the `/users/external/{id}/licences` page
 * @module LicencesPresenter
 */

const { sourceNavigation } = require('../base-users.presenter.js')
const { today } = require('../../../lib/general.lib.js')

/**
 * Formats data for external users on the `/users/external/{id}/licences` page
 *
 * @param {module:UserModel} user - The user and associated details
 * @param {module:LicenceModel[]} licences - All licences linked to the user
 * @param {string[]} viewingUserScope - The 'scope' taken off the `request.auth` object passed to the
 * `ViewVerificationsService`
 * @param {string} back - The 'back' query parameter, used to indicate what back link should be shown on the page
 *
 * @returns {object} The data formatted for the view template
 */
function go(user, licences, viewingUserScope, back) {
  const { username } = user

  const formattedLicences = _userLicences(licences)

  const displayLicenceEndedMessage = formattedLicences.some((formattedLicence) => {
    return formattedLicence.status
  })

  const canManageAccounts = viewingUserScope.includes('manage_accounts')
  const sourceNavigationDetails = sourceNavigation(back, canManageAccounts)

  return {
    activeNavBar: sourceNavigationDetails.activeNavBar,
    backLink: sourceNavigationDetails.backLink,
    backQueryString: sourceNavigationDetails.backQueryString,
    displayLicenceEndedMessage,
    licences: formattedLicences,
    pageTitle: 'Licences',
    pageTitleCaption: username,
    showUnlinkButton: canManageAccounts
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

module.exports = {
  go
}
