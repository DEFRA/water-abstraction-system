/**
 * Formats data for the `/licences/{id}/history` view history page
 * @module HistoryPresenter
 */

import { formatLongDate } from '../base.presenter.js'
import { linkToLicenceVersion } from '../licence-version.presenter.js'

/**
 * Formats data for the `/licences/{id}/history` view history page
 *
 * @param {object} licenceHistory - The licence and related charge, licence and return versions
 * @param {object} licence - The id and licence ref of the licence
 *
 * @returns The data formatted and sorted for the view template
 */
function go(licenceHistory, licence) {
  const { licenceRef } = licence

  return {
    backLink: {
      href: '/',
      text: 'Go back to search'
    },
    licenceVersions: _licenceVersionEntries(licenceHistory),
    pageTitle: 'History',
    pageTitleCaption: `Licence ${licenceRef}`
  }
}

function _licenceVersionEntries(licenceVersions) {
  return licenceVersions.map((licenceVersion) => {
    return {
      changeType: licenceVersion.$changeType(),
      endDate: formatLongDate(licenceVersion.endDate),
      link: linkToLicenceVersion(licenceVersion),
      reason: licenceVersion.$reason(),
      startDate: formatLongDate(licenceVersion.startDate)
    }
  })
}

export {
  go
}
export default {
  go
}
