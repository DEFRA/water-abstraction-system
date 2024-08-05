'use strict'

const Purposes = require('./data/purposes.js')
const PurposeModel = require('../../app/models/purpose.model.js')

async function seed () {
  for (const purpose of Purposes.data) {
    await _upsert(purpose)
  }
}

async function _upsert (purpose) {
  return PurposeModel.query()
    .insert(purpose)
    .onConflict('legacyId')
    .merge(['description', 'lossFactor', 'twoPartTariff'])
}

module.exports = {
  seed
}
