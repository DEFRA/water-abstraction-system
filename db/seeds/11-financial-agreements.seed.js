import { timestampForPostgres } from '../../app/lib/general.lib.js'
import { data as financialAgreements } from './data/financial-agreements.js'
import FinancialAgreementModel from '../../app/models/financial-agreement.model.js'

async function seed() {
  for (const financialAgreement of financialAgreements) {
    await _upsert(financialAgreement)
  }
}

async function _upsert(financialAgreement) {
  return FinancialAgreementModel.query()
    .insert({ ...financialAgreement, updatedAt: timestampForPostgres() })
    .onConflict('code')
    .merge(['description', 'disabled', 'updatedAt'])
}

export default {
  seed
}
