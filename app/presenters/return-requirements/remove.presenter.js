'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/remove/{requirementIndex}` page
 * @module RemovePresenter
*/

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/return-requirements/{sessionId}/remove/{requirementIndex}` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 * @param {string} requirementIndex - The index of the requirement being added or changed
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session, requirementIndex) {
  const { id: sessionId, licence, requirements } = session
  const requirement = requirements[requirementIndex]

  return {
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    returnRequirement: _formattedReturnRequirement(requirement) ? _formattedReturnRequirement(requirement) : null,
    sessionId,
    startDate: _startDate(session)
  }
}

function _formattedReturnRequirement (requirement) {
  if (!requirement.returnsCycle) {
    return null
  }

  let returnsCycle = requirement.returnsCycle.charAt(0).toUpperCase() + requirement.returnsCycle.slice(1)
  returnsCycle = returnsCycle.replaceAll('-', ' ')

  const { frequencyReported } = requirement
  const { siteDescription } = requirement

  return `${returnsCycle} ${frequencyReported} requirements for returns, ${siteDescription}.`
}

function _startDate (session) {
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
