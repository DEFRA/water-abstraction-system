'use strict'

/**
 * Given a bill run setup session, returns the URL for the 'Back' link on the /check page.
 *
 * @param {object} session - The bill run setup session
 *
 * @returns {string} - The URL for the 'Back' link
 */
function checkPageBackLink(session) {
  const { id, type, year } = session

  if (!type.startsWith('two_part')) {
    return `/system/bill-runs/setup/${id}/region`
  }

  // 2023 is the first year of SROC. No season is selected for SROC two-part tariff bill runs.
  if (type === 'two_part_supplementary' || year >= 2023) {
    return `/system/bill-runs/setup/${id}/year`
  }

  return `/system/bill-runs/setup/${id}/season`
}

module.exports = {
  checkPageBackLink
}
