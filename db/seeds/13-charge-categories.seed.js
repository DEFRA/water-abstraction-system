'use strict'

const { timestampForPostgres } = require('../../app/lib/general.lib.js')
const { data: chargeCategories } = require('./data/charge-categories.js')
const ChargeCategoryModel = require('../../app/models/charge-category.model.js')

async function seed () {
  for (const chargeCategory of chargeCategories) {
    await _upsert(chargeCategory)
  }
}

async function _upsert (chargeCategory) {
  return ChargeCategoryModel.query()
    .insert({ ...chargeCategory, updatedAt: timestampForPostgres() })
    .onConflict('reference')
    .merge([
      'subsistenceCharge',
      'description',
      'shortDescription',
      'tidal',
      'lossFactor',
      'modelTier',
      'restrictedSource',
      'minVolume',
      'maxVolume',
      'updatedAt'
    ])
}

module.exports = {
  seed
}
