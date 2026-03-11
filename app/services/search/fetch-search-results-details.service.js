'use strict'

/**
 * Fetches the item details for a set of search results on the /search page
 * @module FetchSearchResultsDetailsService
 */

const BillingAccountModel = require('../../models/billing-account.model.js')
const CompanyModel = require('../../models/company.model.js')
const LicenceModel = require('../../models/licence.model.js')
const MonitoringStationModel = require('../../models/monitoring-station.model.js')
const ReturnLogModel = require('../../models/return-log.model.js')
const UserModel = require('../../models/user.model.js')
const { db } = require('../../../db/db.js')

/**
 * Fetches the item details for a set of search results on the /search page
 *
 * @param {object} idsByType - An object containing the IDs to fetch for each type of required search result
 *
 * @returns {Promise<object>} An object containing the set of matching models for each result type
 */
async function go(idsByType) {
  const finders = {}

  for (const [key, ids] of Object.entries(idsByType)) {
    finders[key] = _findByType(key, ids)
  }

  const foundModels = await Promise.all(Object.values(finders))

  const modelsByType = {}
  Object.keys(idsByType).forEach((key, index) => {
    modelsByType[key] = foundModels[index]
  })

  return modelsByType
}

async function _billingAccount(ids) {
  return BillingAccountModel.query()
    .select('accountNumber', 'createdAt', 'id')
    .withGraphFetched('company')
    .modifyGraph('company', (builder) => {
      builder.select('name')
    })
    .findByIds(ids)
}

async function _findByType(type, ids) {
  switch (type) {
    case 'billingAccount':
      return _billingAccount(ids)
    case 'licenceHolder':
      return _licenceHolder(ids)
    case 'licence':
      return _licence(ids)
    case 'monitoringStation':
      return _monitoringStation(ids)
    case 'returnLog':
      return _returnLog(ids)
    case 'user':
      return _user(ids)
    default:
      return []
  }
}

async function _licence(ids) {
  return LicenceModel.query()
    .select('expiredDate', 'id', 'lapsedDate', 'licenceRef', 'revokedDate')
    .withGraphFetched('licenceDocumentHeader')
    .modifyGraph('licenceDocumentHeader', (builder) => {
      builder.select('metadata')
    })
    .findByIds(ids)
}

/**
 * Because licence holders are often duplicated (try searching for Anglian water!) we want to give the user additional
 * detail to help them find the right one.
 *
 * All data in NALD is held at a regional level. So any national organisation with a licence in each region will have 8
 * licence holder records as a minimum. So, we fetch the region to help distinguish them.
 *
 * When there are actual duplicates, the primary record becomes clear as it typically has the most licences linked to
 * it. Displaying the count of licences helps distinguish this. We only care about licence document role records where
 * the role is 'licence holder'. They also have start and end dates so there may be multiple records for the same
 * company and licence. We only want a count of the licences, not entries, hence the `DISTINCT`.
 * @private
 */
async function _licenceHolder(ids) {
  return CompanyModel.query()
    .select([
      'companies.id',
      'companies.name',
      'region.displayName AS region',
      db.raw(`(
        SELECT COUNT(DISTINCT ldr.licence_document_id) FROM public.licence_document_roles ldr
        INNER JOIN public.licence_roles lr ON lr.id = ldr.licence_role_id
        WHERE ldr.company_id = companies.id AND lr."name" = 'licenceHolder'
      ) AS "licenceCount"`)
    ])
    .leftJoinRelated('region')
    .whereNotNull('externalId')
    .withGraphFetched('licenceDocumentRoles')
    .modifyGraph('licenceDocumentRoles', (builder) => {
      builder
        .select(['licenceDocumentRoles.licenceDocumentId'])
        .innerJoinRelated('licenceRole', { alias: 'lr' })
        .where('lr.name', 'licenceHolder')
    })
    .findByIds(ids)
}

async function _monitoringStation(ids) {
  return MonitoringStationModel.query().select('gridReference', 'id', 'label', 'riverName').findByIds(ids)
}

async function _returnLog(ids) {
  return ReturnLogModel.query().select('endDate', 'id', 'licenceRef', 'returnId', 'returnReference').findByIds(ids)
}

async function _user(ids) {
  return UserModel.query().select('id', 'lastLogin', 'username').findByIds(ids).modify('permissions')
}

module.exports = {
  go
}
