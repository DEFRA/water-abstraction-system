'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the bill run page
 * @module View2ptBillRunLicencesService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const ReviewResultModel = require('../../../models/review-result.model.js')
const LicenceModel = require('../../../models/licence.model.js')
const { review } = require('../../../controllers/bill-runs.controller.js')

async function go (id) {
  const result = _fetchTwoPartTariffBillRun(id)

  return { result }
}

async function _fetchTwoPartTariffBillRun (id) {
  const billRun = await _fetchBillRun(id)
  const licenceIds = await _fetchLicences(id)

  for (const licenceId of licenceIds) {
    const licence = await _fetchLicenceHolder(licenceId.licenceId)
    const { licenceDocument, licenceRef } = licence

    const licenceHolder = _licenceHolder(licenceDocument)

    licenceId.licenceHolder = licenceHolder
    licenceId.licenceRef = licenceRef

    const issues = await _issuesOnLicence(licenceId)
    licenceId.issues = issues
  }

  // console.log('Licences Id', licenceIds)

  return {
    billRun,
    licenceIds
  }
}

async function _issuesOnLicence (licenceId) {
  const issues = []
  // Issue 1 AbstractionOutsidePeriod
  // reviewReturnResult: abstractionOutsidePeriod

  const reviewResults = await ReviewResultModel.query()
    .where('licenceId', licenceId.licenceId)
    .select(
      'reviewChargeElementResultId',
      'chargeReferenceId',
      'reviewReturnResultId'
    )
    .withGraphFetched('reviewChargeElementResults')
    .modifyGraph('reviewChargeElementResults', (builder) => {
      builder.select([
        'id',
        'chargeDatesOverlap',
        'aggregate'
      ])
    })
    .withGraphFetched('reviewReturnResults')
    .modifyGraph('reviewReturnResults', (builder) => {
      builder.select([
        'id',
        'underQuery',
        'quantity',
        'allocated',
        'abstractionOutsidePeriod',
        'status',
        'dueDate',
        'receivedDate'
      ])
    })

  const abstractionOutsidePeriod = reviewResults.some(reviewResult => reviewResult.reviewReturnResults?.abstractionOutsidePeriod)

  if (abstractionOutsidePeriod) {
    issues.push('Abstraction outside period')
  }

  // Issue 2 Aggregate (anything but 1)
  // reviewChargeElementResult: allocated
  const hasAggregate = reviewResults.some(reviewResult => reviewResult.reviewChargeElementResults?.aggregate !== 1)

  if (hasAggregate) {
    issues.push('Aggregate factor')
  }

  // Issue 3 checking query
  // reviewReturnResult: underQuery

  const underQuery = reviewResults.some(reviewResult => reviewResult.reviewReturnResults?.underQuery)

  if (underQuery) {
    issues.push('Checking query')
  }

  // Issue 4 No returns received status is due or overdue
  // reviewReturnResult: status

  const noReturnsReceived = reviewResults.some(reviewResult => reviewResult.reviewReturnResults?.status === 'due' || 'overdue')

  if (noReturnsReceived) {
    issues.push('No returns received')
  }

  // Issue 5 Over abstraction
  // reviewReturnResult quantity-allocated
  const overAbstracted = reviewResults.some(reviewResult => reviewResult.reviewReturnResults?.quantity > reviewResult.reviewReturnResults?.allocated)

  if (overAbstracted) {
    issues.push('Over abstraction')
  }


  // Issue 6 Overlap of charge dates
  // reviewChargeElementResult: chargeDatesOverlap

  const hasChargeDatesOverlap = reviewResults.some(reviewResult => reviewResult.reviewChargeElementResults?.chargeDatesOverlap)

  if (hasChargeDatesOverlap) {
    issues.push('Overlap of charge dates')
  }

  // Issue 7 Returns received but not processed
  // reviewReturnResult: status on one of the returns has a status of received
  const notProcessed = reviewResults.some(reviewResult => reviewResult.reviewReturnResults?.status === 'received')

  if (notProcessed) {
    issues.push('Returns received but not processed')
  }

  // Issue 8 Returns received late
  // reviewReturnResult: receivedDate - some or all the returns were submitted after the due period 24/04 or 28/11

  const receivedLate = reviewResults.some(reviewResult => reviewResult.reviewReturnResults?.receivedDate > reviewResult.reviewReturnResults?.dueDate)

  if (receivedLate) {
    issues.push('Returns received late')
  }

  // Issue 9 Returns split over charge references
  // reviewResults: reviewReturnResultId has two records with different chargeReferenceIds
  // ----------------------------------------------------------------------------------------
  const seenReviewReturnResults = {}
  let returnsSplitOverChargeReference

  for (const result of reviewResults) {
    const { chargeReferenceId, reviewReturnResultId } = result

    if (seenReviewReturnResults[reviewReturnResultId]) {
      if (seenReviewReturnResults[reviewReturnResultId] !== chargeReferenceId) {
        returnsSplitOverChargeReference = true
      }
    } else {
      seenReviewReturnResults[reviewReturnResultId] = chargeReferenceId
    }
  }

  if (returnsSplitOverChargeReference) {
    issues.push('Returns split over charge references')
  }

  // ----------------------------------------------------------------------------------------

  // Issue 10 Some returns not received
  const returnsNotReceived = reviewResults.some((reviewResult) => {
    if (reviewResult.reviewReturnResultId && reviewResult.reviewChargeElementResultId) {
      if (reviewResult.reviewReturnResults.status === 'due' || reviewResult.reviewReturnResults.status === 'overdue') {
        return true
      }
    }

    return false
  })

  if (returnsNotReceived) {
    issues.push('Some returns not received')
  }

  // Issue 12 - Unable to match returns
  // reviewResult: a chargeElementId is in the table but not reviewReturnResult
  const matchingReturns = reviewResults.some(reviewResult => !(reviewResult?.reviewChargeElementResultId && reviewResult?.reviewReturnResultId))

  if (matchingReturns) {
    issues.push('Unable to match returns')
  }

  console.log('Issues :', issues)
  // Issue 13
  // Multiple issues (if one or more of these issues are on a licence)

  if (issues.length > 1) {
    return 'Multiple Issues'
  } else if (issues.length === 1) {
    return issues[0]
  } else {
    return ''
  }
}

function _licenceHolder (licenceDocument) {
  // Extract the company and contact from the last licenceDocumentRole created. _fetchLicence() ensures in the case
  // that there is more than one that they are ordered by their start date (DESC)
  const { company, contact } = licenceDocument.licenceDocumentRoles[0]

  if (contact) {
    return contact.$name()
  }

  return company.name
}

async function _fetchLicenceHolder (licenceId) {
  const licenceHolder = LicenceModel.query()
    .findById(licenceId)
    .select([
      'id',
      'licenceRef'
    ])
    .withGraphFetched('licenceVersions')
    .modifyGraph('licenceVersions', (builder) => {
      builder
        .select([
          'id',
          'startDate'
        ])
        .where('status', 'current')
        .orderBy('startDate', 'desc')
    })
    .withGraphFetched('licenceDocument')
    .modifyGraph('licenceDocument', (builder) => {
      builder.select([
        'id'
      ])
    })
    .withGraphFetched('licenceDocument.licenceDocumentRoles')
    .modifyGraph('licenceDocument.licenceDocumentRoles', (builder) => {
      builder
        .select([
          'licenceDocumentRoles.id'
        ])
        .innerJoinRelated('licenceRole')
        .where('licenceRole.name', 'licenceHolder')
        .orderBy('licenceDocumentRoles.startDate', 'desc')
    })
    .withGraphFetched('licenceDocument.licenceDocumentRoles.company')
    .modifyGraph('licenceDocument.licenceDocumentRoles.company', (builder) => {
      builder.select([
        'id',
        'name',
        'type'
      ])
    })

  return licenceHolder
}

async function _fetchLicences (id) {
  const licences = ReviewResultModel.query()
    .where('billRunId', id)
    .distinct([
      'licenceId'
    ])

  return licences
}

async function _fetchBillRun (id) {
  const result = BillRunModel.query()
    .findById(id)
    .select([
      'id',
      'batchType',
      'billRunNumber',
      'createdAt',
      'summer',
      'scheme',
      'source',
      'status',
      'toFinancialYearEnding'
    ])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select([
        'id',
        'displayName'
      ])
    })

  return result
}

module.exports = {
  go
}
