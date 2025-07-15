'use strict'

/**
 * Fetches the data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @module FetchFullConditionService
 */

const LicenceVersionPurposeConditionModel = require('../../../models/licence-version-purpose-condition.model.js')

/**
 * Fetches the data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @param {string} licenceId - The licence id to fetch conditions for
 *
 * @returns {Promise<object>} The matching instance of the `LicenceVersionPurposeConditionModel` populated with the
 * data needed for the "Select full condition" page
 */
async function go(licenceId) {
  return (
    LicenceVersionPurposeConditionModel.query()
      .distinctOn(
        'licenceVersionPurposeConditions.notes',
        'licenceVersionPurposeConditions.param1',
        'licenceVersionPurposeConditions.param2'
      )
      .select(
        'licenceVersionPurposeConditions.id',
        'licenceVersionPurposeConditions.notes',
        'licenceVersionPurposeConditions.param1',
        'licenceVersionPurposeConditions.param2',
        'licenceVersionPurposeConditions.createdAt',
        'licenceVersionPurposeConditionType.displayTitle',
        'licenceVersionPurpose.abstractionPeriodStartDay',
        'licenceVersionPurpose.abstractionPeriodStartMonth',
        'licenceVersionPurpose.abstractionPeriodEndDay',
        'licenceVersionPurpose.abstractionPeriodEndMonth'
      )
      .joinRelated('[licenceVersionPurposeConditionType, licenceVersionPurpose.licenceVersion.licence]')
      .where('licenceVersionPurpose:licenceVersion.licenceId', licenceId)
      // We only want to fetch purposes for the current licence version
      .where('licenceVersionPurpose:licenceVersion.status', 'current')
      // We specifically want flow cessation conditionsm, indicated by condition type code 'CES'
      .where('licenceVersionPurposeConditionType.code', 'CES')
      // We sort by descending creation date to ensure get the latest condition of each distinct line
      .orderBy([
        { column: `licenceVersionPurposeConditions.notes` },
        { column: `licenceVersionPurposeConditions.param1` },
        { column: `licenceVersionPurposeConditions.param2` },
        { column: `licenceVersionPurposeConditions.createdAt`, order: 'desc' }
      ])
  )
}

module.exports = {
  go
}
