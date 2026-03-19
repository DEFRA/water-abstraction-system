'use strict'

/**
 * Formats data for the '/companies/{id}/licences' page
 * @module LicencesPresenter
 */

const { formatLongDate } = require('../base.presenter.js')
const { today } = require('../../lib/general.lib.js')

/**
 * Formats data for the '/companies/{id}/licences' page
 *
 * @param {module:CompanyModel} company - The company from the companies table
 * @param {object} licences - the licences for the customer
 *
 * @returns {object} The data formatted for the view template
 */
function go(company, licences) {
  return {
    backLink: {
      href: '/',
      text: 'Go back to search'
    },
    pageTitleCaption: company.name,
    pageTitle: 'Licences',
    licences: _licences(company.id, licences)
  }
}

/**
 * As a hint to the user, when the current licence holder is the company selected, we don't display a link. Not only is
 * it pointless (you are already on the page!) it gives a UI nod to the fact that the licence is currently held by the
 * company.
 *
 * When the current licence holder is a different company, we provide a link to it, not only to be helpful, but to give
 * a visual clue that the licence is currently held by a different company.
 *
 * @private
 */
function _currentLicenceHolder(companyId, licence) {
  const { currentLicenceHolder, currentLicenceHolderId } = licence

  return {
    id: currentLicenceHolderId === companyId ? null : currentLicenceHolderId,
    name: currentLicenceHolder
  }
}

function _licences(companyId, licences) {
  return licences.map((licence) => {
    const { id, licenceRef, startDate } = licence
    const licenceEndDetails = licence.$ends()

    return {
      currentLicenceHolder: _currentLicenceHolder(companyId, licence),
      id,
      licenceRef,
      startDate: formatLongDate(startDate),
      status: _status(licenceEndDetails)
    }
  })
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
