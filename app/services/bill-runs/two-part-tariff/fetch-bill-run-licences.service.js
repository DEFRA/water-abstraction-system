'use strict'

/**
 * Fetches bill run and licences data for two-part-tariff billing review
 * @module FetchBillRunLicencesService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const LicenceModel = require('../../../models/licence.model.js')
const ReviewResultModel = require('../../../models/review-result.model.js')

/**
 * Takes the bill run ID and fetches all the data needed to review the bill run
 *
 * Fetches specifically the bill run data, a list of the licences in the bill run with the licence holder and licence
 * ref.
 * @param {String} id The UUID for the bill run
 *
 * @returns {Object} an object containing the billRun data and the list of licences for the bill run
 */
async function go (id) {
  const billRun = await _fetchBillRun(id)
  const licences = await _fetchLicences(id)

  for (const licence of licences) {
    const { licenceDocument, licenceRef } = await _fetchLicenceHolder(licence.licenceId)

    licence.licenceHolder = _licenceHolder(licenceDocument)
    licence.licenceRef = licenceRef
  }

  return { billRun, licences }
}

async function _fetchBillRun (id) {
  const result = BillRunModel.query()
    .findById(id)
    .select([
      'id',
      'billRunNumber',
      'createdAt',
      'status',
      'toFinancialYearEnding',
      'scheme',
      'batchType'
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

async function _fetchLicences (id) {
  const licences = ReviewResultModel.query()
    .where('billRunId', id)
    .distinct([
      'licenceId'
    ])

  return licences
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

function _licenceHolder (licenceDocument) {
  // Extract the company and contact from the last licenceDocumentRole created. _fetchLicence() ensures in the case
  // that there is more than one that they are ordered by their start date (DESC)
  const { company, contact } = licenceDocument.licenceDocumentRoles[0]

  if (contact) {
    return contact.$name()
  }

  return company.name
}

module.exports = {
  go
}
