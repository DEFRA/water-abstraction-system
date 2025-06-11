'use strict'

/**
 * Orchestrates fetching and presenting the data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @module FullConditionService
 */

const FullConditionPresenter = require('../../../presenters/licence-monitoring-station/setup/full-condition.presenter.js')
const LicenceVersionPurposeConditionModel = require('../../../models/licence-version-purpose-condition.model.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const conditions = await _fetchConditions(session.licenceId)

  const pageData = FullConditionPresenter.go(session, conditions)

  return {
    ...pageData
  }
}

async function _fetchConditions(licenceId) {
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
        'licenceVersionPurposeConditions.createdAt'
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
