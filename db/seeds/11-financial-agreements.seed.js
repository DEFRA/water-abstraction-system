'use strict'

const { timestampForPostgres } = require('../../app/lib/general.lib.js')
const { data: financialAgreements } = require('./data/financial-agreements.js')
const FinancialAgreementModel = require('../../app/models/financial-agreement.model.js')

async function seed () {
  for (const financialAgreement of financialAgreements) {
    await _upsert(financialAgreement)
  }
}

async function _upsert (financialAgreement) {
  return FinancialAgreementModel.query()
    .insert({ ...financialAgreement, updatedAt: timestampForPostgres() })
    .onConflict('code')
    .merge(['description', 'disabled', 'updatedAt'])
}

module.exports = {
  seed
}
