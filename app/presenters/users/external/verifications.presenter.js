'use strict'

/**
 * Formats data for external users on the `/users/external/{id}/verifications` page
 * @module VerificationsPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

/**
 * Formats data for external users on the `/users/external/{id}/verifications` page
 *
 * @param {module:UserModel} user - The user and associated details
 * @param {module:UserVerificationModel[]} verifications - All verifications linked to the user
 * @param {string} back - The 'back' query parameter, used to indicate what back link should be shown on the page
 *
 * @returns {object} The data formatted for the view template
 */
function go(user, verifications, back) {
  const { username } = user

  return {
    backLink: _backLink(back),
    backQueryString: _backQueryString(back),
    pageTitle: 'Verifications',
    pageTitleCaption: username,
    verifications: _verifications(verifications)
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

function _backQueryString(back) {
  if (back === 'users') {
    return null
  }

  return `?back=${back}`
}

function _verifications(verifications) {
  const formattedVerifications = []

  for (const verification of verifications) {
    const { verificationCode: code, createdAt, licenceDocumentHeaders, verifiedAt } = verification

    for (const licenceDocumentHeader of licenceDocumentHeaders) {
      const { id: licenceId, licenceRef, licenceVersions } = licenceDocumentHeader.licence

      formattedVerifications.push({
        code,
        count: licenceDocumentHeaders.length,
        createdOn: formatLongDate(createdAt),
        licenceHolder: licenceVersions[0].company.name,
        licenceRef,
        link: `/system/licences/${licenceId}/summary`,
        verifiedOn: verifiedAt ? formatLongDate(verifiedAt) : null
      })
    }
  }

  return formattedVerifications
}

module.exports = {
  go
}
