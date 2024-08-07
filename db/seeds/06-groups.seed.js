'use strict'

const { timestampForPostgres } = require('../../app/lib/general.lib.js')
const { db } = require('../db.js')
const { data: groups } = require('./data/groups.js')

async function seed () {
  for (const group of groups) {
    await _upsert(group)
  }
}

async function _upsert (group) {
  // Note: We store the data in a format that matches what we get through Objection.js and our view model GroupModel.
  // But because of the reason detailed below, the payload we send in the insert has to match how the underlying table
  // is structured. Hence this transformation.
  const payload = {
    groupId: group.id,
    application: 'water_admin',
    group: group.group,
    description: group.description,
    dateUpdated: timestampForPostgres()
  }

  // NOTE: We've had to drop back to Knex rather than Objection.js because the view model doesn't expose a field
  // (application) that we rely on to make the onConflict work. This was by design, `application` never differs across
  // records so is redundant to us when fetching instances of `GroupModel`.
  return db('groups').withSchema('idm')
    .insert(payload)
    .onConflict(['application', 'group'])
    .merge(['description', 'dateUpdated'])
}

module.exports = {
  seed
}
