import { timestampForPostgres } from '../../app/lib/general.lib.js'
import { data as secondaryPurposes } from './data/secondary-purposes.js'
import SecondaryPurposeModel from '../../app/models/secondary-purpose.model.js'

/**
 * Seeds the secondary purpose reference data using an upsert
 *
 * The water.purposes_secondary.legacy_id column must be unique
 *
 * Previous table name - water.purposes_secondary
 *
 * Public table name - public.secondary_purposes
 *
 */
export default async function seed() {
  for (const purpose of secondaryPurposes) {
    await _upsert(purpose)
  }
}

async function _upsert(secondaryPurpose) {
  return SecondaryPurposeModel.query()
    .insert({ ...secondaryPurpose, updatedAt: timestampForPostgres() })
    .onConflict('legacyId')
    .merge(['description', 'updatedAt'])
}

export {
  seed
}