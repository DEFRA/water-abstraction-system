'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/cancel-requirements` page
 * @module CancelRequirementsPresenter
*/

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/return-requirements/{sessionId}/cancel-requirements` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 * @param {Object} [payload] - The payload from the request
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session) {
  const data = {
    id: session.id,
    licenceId: session.licence.id,
    licenceRef: session.licence.licenceRef,
    reason: session.data.reason,
    startDate: _startDate(session),
    returnRequirements: _formattedReturnRequirement(session.data) ? _formattedReturnRequirement(session.data) : null
  }

  return data
}

function _formattedReturnRequirement (sessionData) {
  if (!sessionData.returnsCycle) {
    return null
  }

  let returnsCycle = sessionData.returnsCycle.charAt(0).toUpperCase() + sessionData.returnsCycle.slice(1)
  returnsCycle = returnsCycle.replaceAll('-', ' ')

  const { frequencyReported } = sessionData
  const { siteDescription } = sessionData

  return `${returnsCycle} ${frequencyReported} requirements for returns, ${siteDescription}.`
}

function _startDate (session) {
  const selectedOption = session.data.startDateOptions
  let date

  if (selectedOption === 'licenceStartDate') {
    date = new Date(session.licence.currentVersionStartDate)
  } else {
    const day = session.data.startDateDay
    const month = session.data.startDateMonth
    const year = session.data.startDateYear

    date = new Date(`${year}-${month}-${day}`)
  }

  return formatLongDate(date)
}

module.exports = {
  go
}
