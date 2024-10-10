'use strict'

/**
 * Determines if a licence being removed from workflow should be flagged for supplementary billing
 * @module DetermineWorkflowYearsService
 */

const { ref } = require('objection')

const ReturnLogModel = require('../../../models/return-log.model.js')
const LicenceModel = require('../../../models/licence.model.js')
const WorkflowModel = require('../../../models/workflow.model.js')

const SROC_START_DATE = new Date('2022-04-01')

/**
 * Determines if a licence being removed from workflow should be flagged for supplementary billing.
 *
 * The service is passed the id of a workflow record and determines if it should be flagged for supplementary
 * billing. This is worked out based on the licences charge information data. If the licence has any charge versions
 * that are sroc and two-part tariff then flagForBilling is set to true.
 *
 * @param {string} chargeVersionWorkflowId - The UUID for the workflow record to fetch
 *
 * @returns {object} - An object containing the related licence, charge information start and end date and if the
 * licence should be flagged for two-part tariff supplementary billing
 */
async function go (chargeVersionWorkflowId) {
  const workflowRecord = await _fetchWorkflowRecord(chargeVersionWorkflowId)

  console.log('Result! :', workflowRecord)
  if (!workflowRecord || workflowRecord.licence.includeInSrocBilling) {
    console.log('Returning as there are no records')

    return
  }

  console.log('Flagging for supp billing')
  await _flagForSupplementaryBilling(workflowRecord.licence.id)
}

async function _flagForSupplementaryBilling (id) {
  return LicenceModel.query().patch({ includeInSrocBilling: true }).where('id', id)
}

async function _fetchWorkflowRecord (chargeVersionWorkflowId) {
  return WorkflowModel.query()
    .findById(chargeVersionWorkflowId)
    .select([
      'licenceId'
    ])
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select([
        'id',
        'regionId',
        'includeInSrocBilling'
      ])
    })
    .whereExists(
      LicenceModel.query()
        .joinRelated('chargeVersions')
        .where('licences.id', WorkflowModel.ref('licenceId'))
        .andWhere('chargeVersions.startDate', '>', '2022-04-01')
    )
}

module.exports = {
  go
}
