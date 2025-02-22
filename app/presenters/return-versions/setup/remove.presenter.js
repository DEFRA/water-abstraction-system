'use strict'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/remove/{requirementIndex}` page
 * @module RemovePresenter
 */

const { formatLongDate } = require('../../base.presenter.js')
const { returnRequirementFrequencies } = require('../../../lib/static-lookups.lib.js')

/**
 * Formats data for the `/return-versions/setup/{sessionId}/remove/{requirementIndex}` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 * @param {string} requirementIndex - The index of the requirement being added or changed
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session, requirementIndex) {
  const { id: sessionId, licence, requirements } = session
  const requirement = requirements[requirementIndex]

  return {
    backLink: _backLink(session),
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    pageTitle: 'You are about to remove these requirements for returns',
    returnRequirement: _formattedReturnRequirement(requirement),
    sessionId,
    startDate: _startDate(session)
  }
}

function _backLink(session) {
  const { id } = session

  return `/system/return-versions/setup/${id}/check`
}

function _formattedReturnRequirement(requirement) {
  const { frequencyReported, returnsCycle, siteDescription } = requirement
  const cycle = returnsCycle === 'summer' ? 'Summer' : 'Winter and all year'

  return `${cycle} ${returnRequirementFrequencies[frequencyReported]} requirements for returns, ${siteDescription}.`
}

function _startDate(session) {
  const selectedOption = session.startDateOptions

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
