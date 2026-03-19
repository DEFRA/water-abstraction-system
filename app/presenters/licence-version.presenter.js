'use strict'

const { formatLongDate } = require('./base.presenter.js')

/**
 * Generates a link object for a licence version with hidden text and href
 *
 * @param {object} licenceVersion - The licence version object
 *
 * @returns {object} Link object containing hiddenText and href properties
 */
function linkToLicenceVersion(licenceVersion) {
  const { endDate, id } = licenceVersion

  let hiddenText = 'current licence version'

  if (endDate) {
    hiddenText = `licence version ending on ${formatLongDate(endDate)}`
  }

  return {
    hiddenText,
    href: `/system/licence-versions/${id}`
  }
}

module.exports = {
  linkToLicenceVersion
}
