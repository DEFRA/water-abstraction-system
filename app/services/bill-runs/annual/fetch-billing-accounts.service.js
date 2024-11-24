'use strict'

/**
 * Fetches all billing accounts to be processed as part of annual billing for a region and billing period
 * @module FetchBillingAccountsService
 */

const { ref } = require('objection')

const BillingAccountModel = require('../../../models/billing-account.model.js')
const ChargeVersionModel = require('../../../models/charge-version.model.js')
const Workflow = require('../../../models/workflow.model.js')

/**
 * Fetch all billing accounts to be processed as part of annual billing for a region and billing period
 *
 * To be selected for billing a billing account must
 *
 * - be linked to a licence which is linked to the selected region
 * - be linked to a licence which has not 'ended' before the start of the billing period
 * - not be linked to a licence in the workflow
 * - be linked to a charge version which has the scheme 'sroc'
 * - be linked to a charge version which has a start date before the end of the billing period
 * - be linked to a charge version which has an end date after the start of the billing period
 * - be linked to a charge version which has a status of 'current'
 *
 * @param {string} regionId - UUID of the region being billed that the licences must be linked to
 * @param {object} billingPeriod - Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Promise<module:BillingAccountModel[]>} An array of `BillingAccountModel` to be billed and their relevant
 * licence, charge version, charge element etc records needed to generate the bill run
 */
async function go(regionId, billingPeriod) {
  const allBillingAccounts = await _fetchNew(regionId, billingPeriod)

  return allBillingAccounts
}

async function _fetchNew(regionId, billingPeriod) {
  return BillingAccountModel.query()
    .select(['billingAccounts.id', 'billingAccounts.accountNumber'])
    .whereExists(_whereExistsClause(regionId, billingPeriod))
    .orderBy([{ column: 'billingAccounts.accountNumber' }])
    .withGraphFetched('chargeVersions')
    .modifyGraph('chargeVersions', (builder) => {
      builder.select([
        'chargeVersions.id',
        'chargeVersions.scheme',
        'chargeVersions.startDate',
        'chargeVersions.endDate',
        'chargeVersions.billingAccountId',
        'chargeVersions.status'
      ])

      _whereClauseForChargeVersions(builder, regionId, billingPeriod)

      builder.orderBy([
        { column: 'licenceId', order: 'ASC' },
        { column: 'startDate', order: 'ASC' }
      ])
    })
    .withGraphFetched('chargeVersions.licence')
    .modifyGraph('chargeVersions.licence', (builder) => {
      builder.select([
        'id',
        'licenceRef',
        'waterUndertaker',
        ref('licences.regions:historicalAreaCode').castText().as('historicalAreaCode'),
        ref('licences.regions:regionalChargeArea').castText().as('regionalChargeArea'),
        'startDate',
        'expiredDate',
        'lapsedDate',
        'revokedDate'
      ])
    })
    .withGraphFetched('chargeVersions.licence.region')
    .modifyGraph('chargeVersions.licence.region', (builder) => {
      builder.select(['id', 'chargeRegionId'])
    })
    .withGraphFetched('chargeVersions.changeReason')
    .modifyGraph('chargeVersions.changeReason', (builder) => {
      builder.select(['id', 'triggersMinimumCharge'])
    })
    .withGraphFetched('chargeVersions.chargeReferences')
    .modifyGraph('chargeVersions.chargeReferences', (builder) => {
      builder.select(['id', 'source', 'loss', 'volume', 'adjustments', 'additionalCharges', 'description'])
    })
    .withGraphFetched('chargeVersions.chargeReferences.chargeCategory')
    .modifyGraph('chargeVersions.chargeReferences.chargeCategory', (builder) => {
      builder.select(['id', 'reference', 'shortDescription'])
    })
    .withGraphFetched('chargeVersions.chargeReferences.chargeElements')
    .modifyGraph('chargeVersions.chargeReferences.chargeElements', (builder) => {
      builder.select([
        'id',
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth'
      ])
    })
}

/**
 * Where clause to use when fetching charge versions within the main query
 *
 * We have to filter the applicable charge versions for a number of reasons and need to do it twice; once when
 * determining which billing accounts to fetch and again, when grabbing their related charge versions.
 *
 * So, we have moved the 'WHERE' clause to its own function that we can then reuse.
 *
 * @param {module:QueryBuilder} query - an instance of the Objection QueryBuilder being generated
 * @param {string} regionId - UUID of the region being billed that the licences must be linked to
 * @param {object} billingPeriod - Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {module:QueryBuilder} the builder instance passed in with the additional `where` clauses added
 *
 * @private
 */
function _whereClauseForChargeVersions(query, regionId, billingPeriod) {
  return query
    .innerJoinRelated('licence')
    .where('licence.regionId', regionId)
    .where('chargeVersions.scheme', 'sroc')
    .where('chargeVersions.startDate', '<=', billingPeriod.endDate)
    .where('chargeVersions.status', 'current')
    .where((builder) => {
      builder.whereNull('chargeVersions.endDate').orWhere('chargeVersions.endDate', '>=', billingPeriod.startDate)
    })
    .where((builder) => {
      builder.whereNull('licence.expiredDate').orWhere('licence.expiredDate', '>=', billingPeriod.startDate)
    })
    .where((builder) => {
      builder.whereNull('licence.lapsedDate').orWhere('licence.lapsedDate', '>=', billingPeriod.startDate)
    })
    .where((builder) => {
      builder.whereNull('licence.revokedDate').orWhere('licence.revokedDate', '>=', billingPeriod.startDate)
    })
    .whereNotExists(
      Workflow.query()
        .select(1)
        .whereColumn('chargeVersions.licenceId', 'workflows.licenceId')
        .whereNull('workflows.deletedAt')
    )
}

/**
 * Bill runs are formed of 'bills' which are a 1-to-1 with billing accounts. But whether a billing account should
 * be included is _all_ based on the charge versions they are linked to. So, all the work of filtering what will be
 * considered is done here by combining a `select(1)` with our `_whereClauseForChargeVersions()` function.
 *
 * @private
 */
function _whereExistsClause(regionId, billingPeriod) {
  let query = ChargeVersionModel.query().select(1)

  query = _whereClauseForChargeVersions(query, regionId, billingPeriod)
  query.whereColumn('chargeVersions.billingAccountId', 'billingAccounts.id')

  return query
}

module.exports = {
  go
}
