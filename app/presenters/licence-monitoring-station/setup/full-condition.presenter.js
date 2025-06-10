'use strict'

/**
 * Formats data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @module FullConditionPresenter
 */

/**
 * Formats data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @param session
 * @param conditions
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session, conditions) {
  const { label, licenceRef } = session

  const radioButtons = _generateRadioButtons(conditions)

  return {
    backLink: _backLink(session),
    monitoringStationLabel: label,
    pageTitle: `Select the full condition for licence ${licenceRef}`,
    radioButtons
  }
}

function _backLink(session) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/licence-monitoring-station/setup/${id}/check`
  }

  return `/system/licence-monitoring-station/setup/${id}/licence-number`
}

function _generateRadioButtons(conditions) {
  if (conditions.length === 0) {
    return [
      {
        value: 'no_conditions',
        text: 'No known flow conditions - Manually define an abstraction period'
      }
    ]
  }

  const conditionRadioButtons = conditions
    // Legacy code removes conditions with an empty notes field so we replicate this here
    // TODO: confirm whether this filtering is required
    .filter((row) => {
      return row.notes
    })
    .map((row, index) => {
      return {
        value: row.id,
        text: `Flow cessation condition ${index + 1}`,
        hint: {
          text: `${row.notes} (Additional information 1: ${row.param1 || 'None'}) (Additional information 2: ${row.param2 || 'None'})`
        }
      }
    })

  return [
    ...conditionRadioButtons,
    {
      divider: 'or'
    },
    {
      value: 'not_listed',
      text: 'The condition is not listed for this licence'
    }
  ]
}

module.exports = {
  go
}
