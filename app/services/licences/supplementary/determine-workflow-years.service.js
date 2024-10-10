'use strict'

/**
 * Determines if a licence being removed from workflow should be flagged for supplementary billing
 * @module DetermineWorkflowYearsService
 */

const { ref } = require('objection')

const { db } = require('../../../../db/db.js')
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
  // const { licence } = await _fetchLicence(chargeVersionWorkflowId)

  // console.log('Licence :', licence)
  const licence1 = await _fetchLicenceData(chargeVersionWorkflowId)

  console.log('Licence :', licence1)

  const result = {
    licence,
    startDate,
    endDate,
    twoPartTariff: false,
    flagForBilling: false
  }

  // If licence doesn't exist it means it doesn't have any sroc charge versions
  // If licence is already flagged for supplementary billing the we don't want to flag it again
  if (!licence || licence.includeInSrocBilling) {
    console.log('Returning as there are no records')

    return
  }

  console.log('Flagging for supp billing')
  await _flagForSupplementaryBilling(workflowRecord.licence.id)
}

async function _flagForSupplementaryBilling (id) {
  return LicenceModel.query().patch({ includeInSrocBilling: true }).where('id', id)
}

async function _fetchLicence (chargeVersionWorkflowId) {
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
    .withGraphFetched('licence.chargeVersions')
    .modifyGraph('licence.chargeVersions', (builder) => {
      builder
        .count('id AS flagForSroc')
        .where('startDate', '>', '2024-03-31')
        .groupBy('licenceId')
    })
    // .whereExists(
    //   LicenceModel.query()
    //     .joinRelated('chargeVersions')
    //     .where('licences.id', WorkflowModel.ref('licenceId'))
    //     .andWhere('chargeVersions.startDate', '>', '2022-04-01')
    // )
}

async function _fetchLicenceData (chargeVersionWorkflowId) {
  const query = _query()

  const { rows: [row] } = await db.raw(query, [chargeVersionWorkflowId])

  return row
}

function _query () {
  return `
    SELECT
    l.include_in_sroc_billing,
    EXISTS (
      SELECT 1
      FROM public.charge_versions cv
      WHERE cv.licence_id = l.id
        AND cv.start_date > '2022-04-01'
    ) AS srocChargeVersions,
    EXISTS (
      SELECT 1
      FROM public.charge_references cr
      INNER JOIN public.charge_elements ce
        ON ce.charge_reference_id = cr.id
      WHERE cr.charge_version_id = (
        SELECT cv.id
        FROM public.charge_versions cv
        WHERE cv.licence_id = l.id
        LIMIT 1
      )
      AND ce.section_127_Agreement = TRUE
      AND cr.adjustments->>'s127' = 'true'
    ) AS two_part_tariff
    FROM licences l
    WHERE id = (
      SELECT w.licence_id
      FROM workflows w
      WHERE w.id = ?
    );
`
}

module.exports = {
  go
}
