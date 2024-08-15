'use strict'

/**
 *
 * @module FetchChargeVersionService
 */

const ChargeVersionModel = require('../../../models/charge-version.model.js')

/**
 *
 * @param {*} payload
 * @returns
 */
async function go (chargeVersionId) {
  const { chargeReferences, licence, endDate, startDate } = await _fetchChargeVersion(chargeVersionId)
  const twoPartTariff = _twoPartTariffIndicators(chargeReferences)

  return {
    licence,
    startDate,
    endDate,
    twoPartTariff
  }
}

async function _fetchChargeVersion (chargeVersionId) {
  return ChargeVersionModel.query()
    .findById(chargeVersionId)
    .withGraphFetched('chargeReferences')
    .modifyGraph('chargeReferences', (builder) => {
      builder.select([
        'id',
        'adjustments'
      ])
    })
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select([
        'id',
        'regionId'
      ])
    })
}

function _twoPartTariffIndicators (chargeReferences) {
  return chargeReferences.some((chargeReference) => {
    return chargeReference.adjustments?.s127
  })
}

module.exports = {
  go
}
