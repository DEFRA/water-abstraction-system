'use strict'

/**
 * Formats data for the `/licences/{id}/history` view history page
 * @module HistoryPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/licences/{id}/history` view history page
 *
 * @param {object} licenceHistory - The licence and related charge, licence and return versions
 * @param {object} licence - The id and licence ref of the licence
 *
 * @returns The data formatted and sorted for the view template
 */
function go(licenceHistory, licence) {
  const { id: licenceId, licenceRef } = licence
  const { licenceVersions } = licenceHistory

  return {
    backLink: {
      href: `/system/licences/${licenceId}/summary`,
      text: 'Go back to search'
    },
    licenceVersions: _licenceVersionEntries(licenceVersions),
    pageTitle: 'History',
    pageTitleCaption: `Licence ${licenceRef}`
  }
}

function _licenceVersionEntries(licenceVersions) {
  return licenceVersions.map((licenceVersion) => {
    return {
      action: {
        text: 'View',
        link: `/system/licence-versions/${licenceVersion.id}`
      },
      changeType: null,
      endDate: formatLongDate(licenceVersion.endDate),
      reason: null,
      startDate: formatLongDate(licenceVersion.startDate)
    }
  })
}

module.exports = {
  go
}
