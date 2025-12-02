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
      text: 'Go back to history'
    },
    changeType: licenceVersion.administrative ? 'no licence issued' : 'licence issued',
    pageTitle: `Licence version starting ${formatLongDate(licenceVersion.startDate)}`,
    pageTitleCaption: `Licence ${licence.licenceRef}`,
    reason: _reason(licenceVersion),
    notes: _notes(licenceVersion)
  }
}

function _reason(licenceVersion) {
  const reason = licenceVersion.$reason()
  const createdBy = licenceVersion.$createdBy()

  if (!reason) {
    return null
  }

  if (!createdBy) {
    return `${reason} created on ${formatLongDate(licenceVersion.createdAt)}`
  }

  return `${reason} created on ${formatLongDate(licenceVersion.createdAt)} by ${createdBy}`
}

function _notes(licenceVersion) {
  const notes = licenceVersion.$notes()

  return notes.length > 0 ? notes : null
}

module.exports = {
  go
}
