'use strict'

/**
 * Determines the issues on the licence for a two-part tariff bill run
 * @module FetchBillRunLicenceDataService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const LicenceModel = require('../../../models/licence.model.js')
const ReviewResultModel = require('../../../models/review-result.model.js')

async function go (id) {
  const billRun = await _fetchBillRun(id)
  console.log('Bill Run :', billRun)
  const licences = await _fetchLicences(id)

  for (const licence of licences) {
    const { licenceDocument, licenceRef } = await _fetchLicenceHolder(licence.licenceId)
    licence.licenceHolder = _licenceHolder(licenceDocument)
    licence.licenceRef = licenceRef
  }

  return { billRun, licences }
}

async function _fetchLicences (id) {
  const licences = ReviewResultModel.query()
    .where('billRunId', id)
    .distinct([
      'licenceId'
    ])

  return licences
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

async function _fetchBillRun (id) {
  const result = BillRunModel.query()
    .findById(id)
    .select([
      'id',
      'billRunNumber',
      'createdAt',
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
