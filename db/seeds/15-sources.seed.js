import { timestampForPostgres } from '../../app/lib/general.lib.js'
import { data as sources } from './data/sources.js'
import SourceModel from '../../app/models/source.model.js'

export default async function seed() {
  for (const source of sources) {
    await _upsert(source)
  }
}

async function _upsert(source) {
  return SourceModel.query()
    .insert({ ...source, createdAt: timestampForPostgres(), updatedAt: timestampForPostgres() })
    .onConflict('externalId')
    .merge(['description', 'sourceType', 'ngr', 'updatedAt'])
}
