'use strict'

/**
 * Formats data for the '/companies/{id}/history' page
 * @module HistoryPresenter
 */

const { formatLongDate } = require('../base.presenter.js')
const { linkToLicenceVersion } = require('../licence-version.presenter.js')

/**
 * Formats data for the '/companies/{id}/history' page
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
    pageTitle: 'History',
    licenceVersions: _licenceVersions(licences)
  }
}

function _licenceVersions(licences) {
  const versions = []

  for (const licence of licences) {
    const { licenceVersions } = licence

    for (const licenceVersion of licenceVersions) {
      const { endDate, startDate } = licenceVersion

      const versionDetails = {
        changeType: licenceVersion.$changeType(),
        count: licenceVersions.length,
        endDate: formatLongDate(endDate),
        licenceId: licence.id,
        licenceRef: licence.licenceRef,
        link: linkToLicenceVersion(licenceVersion),
        startDate: formatLongDate(startDate)
      }

      versions.push(versionDetails)
    }
  }

  return versions
}

module.exports = {
  go
}
