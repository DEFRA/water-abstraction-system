'use strict'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/cancel` page
 * @module CancelRequirementsPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')
const { returnRequirementFrequencies, returnRequirementReasons } = require('../../../lib/static-lookups.lib.js')

/**
 * Formats data for the `/return-versions/setup/{sessionId}/cancel` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { id: sessionId, journey, licence, reason, requirements } = session

  return {
    backLink: `/system/return-versions/setup/${sessionId}/check`,
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    pageTitle: 'You are about to cancel these requirements for returns',
    reason: returnRequirementReasons[reason],
    returnRequirements: _returnRequirements(journey, requirements),
    startDate: _startDate(session),
    sessionId
  }
}

function _returnRequirements(journey, requirements) {
  if (journey === 'no-returns-required') {
    return null
  }

  return requirements.map((requirement) => {
    const { frequencyReported, returnsCycle, siteDescription } = requirement
    const cycle = returnsCycle === 'summer' ? 'Summer' : 'Winter and all year'

    return `${cycle} ${returnRequirementFrequencies[frequencyReported]} requirements for returns, ${siteDescription}.`
  })
}

function _startDate(session) {
  const { licence, startDateOptions, startDateDay, startDateMonth, startDateYear } = session

  let date

  if (startDateOptions === 'licenceStartDate') {
    date = new Date(licence.currentVersionStartDate)
  } else {
    date = new Date(`${startDateYear}-${startDateMonth}-${startDateDay}`)
  }

  return formatLongDate(date)
}

module.exports = {
  go
}
