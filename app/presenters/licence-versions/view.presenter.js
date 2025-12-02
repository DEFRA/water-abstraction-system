'use strict'

/**
 * Formats data for the `/licence-versions/{id}` page
 * @module ViewPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/licence-versions/{id}` page
 *
 * @param {object} licenceVersion - the licence version with the licence
 *
 * @returns {object} The data formatted for the view template
 */
function go(licenceVersion) {
  const { licence } = licenceVersion

  return {
    backLink: {
      href: `/system/licences/${licence.id}/history`,
      text: 'Back to history'
    },
    pageTitle: `Licence version starting ${formatLongDate(licenceVersion.startDate)}`,
    pageTitleCaption: `Licence ${licence.licenceRef}`,
    changeType: licenceVersion.administrative ? 'no licence issued' : 'licence issued'
  }
}

module.exports = {
  go
}
