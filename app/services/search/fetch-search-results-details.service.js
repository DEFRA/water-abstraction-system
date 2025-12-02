'use strict'

/**
 * Fetches the item details for a set of search results on the /search page
 * @module FetchSearchResultsDetailsService
 */

const BillingAccountModel = require('../../models/billing-account.model.js')
const LicenceDocumentHeaderModel = require('../../models/licence-document-header.model.js')
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

async function _findByType(type, ids) {
  switch (type) {
    case 'billingAccount':
      return BillingAccountModel.query().withGraphFetched('company').findByIds(ids)
    case 'licenceHolder':
      return LicenceDocumentHeaderModel.query().withGraphFetched('licence').findByIds(ids)
    case 'licence':
      return LicenceModel.query().withGraphFetched('licenceDocumentHeader').findByIds(ids)
    case 'monitoringStation':
      return MonitoringStationModel.query().findByIds(ids)
    case 'returnLog':
      return ReturnLogModel.query().findByIds(ids)
    case 'user':
      return UserModel.query().findByIds(ids)
    default:
      return []
  }
}

module.exports = {
  go
}
