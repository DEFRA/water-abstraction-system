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

async function _licenceHolder(ids) {
  return CompanyModel.query()
    .select('id', 'name', 'type')
    .withGraphFetched('licenceDocumentRoles')
    .modifyGraph('licenceDocumentRoles', (builder) => {
      builder.select('licenceDocumentId')
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
  return UserModel.query().select('id', 'lastLogin', 'username').modify('role').findByIds(ids)
}

module.exports = {
  go
}
