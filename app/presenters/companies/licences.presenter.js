'use strict'

/**
 * Formats data for the '/companies/{id}/licences' page
 * @module LicencesPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

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
      text: 'Back to search'
    },
    pageTitleCaption: company.name,
    pageTitle: 'Licences',
    licenceVersions: _licenceVersions(licences)
  }
}

function _hiddenText(endDate) {
  if (!endDate) {
    return 'current licence version'
  }

  return `licence version ending on ${formatLongDate(endDate)}`
}

function _licenceVersions(licences) {
  const versions = []

  for (const licence of licences) {
    const licenceEndDetails = licence.$ends()

    const { licenceVersions } = licence

    for (const licenceVersion of licenceVersions) {
      const { endDate, id, startDate } = licenceVersion

      const versionDetails = {
        count: licenceVersions.length,
        endDate: formatLongDate(endDate),
        licenceId: licence.id,
        licenceRef: licence.licenceRef,
        link: {
          hiddenText: _hiddenText(endDate),
          href: `/system/licence-versions/${id}`
        },
        startDate: formatLongDate(startDate),
        status: licenceEndDetails?.reason ?? 'current'
      }

      versions.push(versionDetails)
    }
  }

  return versions
}

module.exports = {
  go
}
