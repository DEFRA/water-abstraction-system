'use strict'

/**
 * Formats data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @module FullConditionPresenter
 */

/**
 * Formats data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @param {module:SessionModel} session - The licence monitoring station setup session instance
 * @param {module:LicenceVersionPurposeConditionModel[]} conditions - Array of licence version purpose conditions to be
 * displayed as options
 *
 * @returns {object} The data formatted for the view template
 */
function go(session, conditions) {
  const { label, licenceRef, conditionId } = session

  const radioButtons = _generateRadioButtons(conditions, conditionId)

  const pageTitle =
    conditions.length === 0
      ? `There are no flow or level cessation conditions for licence ${licenceRef}`
      : `Select the full condition for licence ${licenceRef}`

  return {
    backLink: _backLink(session),
    monitoringStationLabel: label,
    pageTitle,
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

function _generateRadioButtons(conditions, conditionId) {
  if (conditions.length === 0) {
    return []
  }

  const conditionRadioButtons = conditions.map((row, index) => {
    const hintText = [
      row.notes ?? '',
      `(Additional information 1: ${row.param1 || 'None'})`,
      `(Additional information 2: ${row.param2 || 'None'})`
    ]
      .join(' ')
      // If row.notes was null then our joined string starts with a space, so we trim it
      .trim()

    return {
      value: row.id,
      text: `${row.displayTitle} ${index + 1}`,
      hint: {
        text: hintText
      },
      checked: row.id === conditionId
    }
  })

  return [
    ...conditionRadioButtons,
    {
      divider: 'or'
    },
    {
      value: 'no_condition',
      text: 'The condition is not listed for this licence',
      checked: conditionId === 'no_condition'
    }
  ]
}

module.exports = {
  go
}
