'use strict'

/**
 * Formats data for the `/bill-runs/create/{sessionId}/year` page
 * @module RegionPresenter
 */

/**
 * Formats data for the `/bill-runs/create/{sessionId}/year` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session, outstandingYears) {
  return {
    id: session.id,
    years: _years(outstandingYears),
    selectedYear: session.data.year
  }
}

function _years (outstandingYears) {
  return outstandingYears.map((outstandingYear) => {
    return {
      display: `${outstandingYear - 1} to ${outstandingYear}`,
      value: outstandingYear
    }
  })
}

module.exports = {
  go
}
