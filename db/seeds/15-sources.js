'use strict'

const { timestampForPostgres } = require('../../app/lib/general.lib.js')
const { data: sources } = require('./data/sources.js')
const SourceModel = require('../../app/models/source.model.js')

async function seed () {
  for (const source of sources) {
    await _upsert(source)
  }
}

async function _upsert (source) {
  return SourceModel.query()
    .insert({ ...source, createdAt: timestampForPostgres(), updatedAt: timestampForPostgres() })
    .onConflict('externalId')
    .merge([
      'description',
      'sourceType',
      'ngr',
      'updatedAt'
    ])
}

module.exports = {
  seed
}
