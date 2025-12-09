'use strict'

/**
 * Formats the licence and related conditions data for the licence conditions page
 * @module ConditionsPresenter
 */

const { formatConditionTypes } = require('../licence.presenter.js')
const { pluralise } = require('./base-licences.presenter.js')

/**
 * Formats the licence and related conditions data for the licence conditions page
 *
 * @param {object[]} conditions - The condition data returned by `FetchLicenceConditionsService`
 * @param {object} licence - The id and licence ref of the licence
 *
 * @returns {object} licence and conditions data needed by the view template
 */
function go(conditions, licence) {
  const { id: licenceId, licenceRef } = licence
  const conditionTypes = formatConditionTypes(conditions)

  return {
    backLink: {
      href: `/system/licences/${licenceId}/summary`,
      text: 'Go back to summary'
    },
    conditionTypes,
    pageTitle: 'Conditions',
    pageTitleCaption: `Licence ${licenceRef}`,
    showingConditions: `Showing ${conditionTypes.length} ${pluralise('type', conditionTypes.length)} of further conditions`,
    warning: {
      text: 'We may not be able to show a full list of the conditions, because we do not hold all of the licence information on our system yet. You should refer to the paper copy of the licence to view all conditions.',
      iconFallbackText: 'Warning'
    }
  }
}

module.exports = {
  go
}
