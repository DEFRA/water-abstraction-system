'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/edit/returnId={returnId}/confirmation` page
 * @module ConfirmationService
 */

const { ref } = require('objection')

const ConfirmationPresenter = require('../../presenters/return-logs/confirmation.presenter.js')
const ReturnLogModel = require('../../models/return-log.model.js')

/**
 * I am a comment
 * @param {*} returnLogId
 * @returns
 */
async function go(returnLogId) {
  const returnLog = await _fetchReturnLog(returnLogId)

  const formattedData = ConfirmationPresenter.go(returnLog)

  return {
    ...formattedData
  }
}

async function _fetchReturnLog(returnLogId) {
  return ReturnLogModel.query()
    .findById(returnLogId)
    .select([
      'id',
      'licenceRef',
      'underQuery',
      ref('metadata:description').castText().as('description'),
      ref('metadata:purposes').as('purposes')
    ])
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select('id')
    })
}

module.exports = {
  go
}
