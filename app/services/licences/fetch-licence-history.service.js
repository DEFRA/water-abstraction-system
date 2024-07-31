'use strict'

const { db } = require('../../../db/db.js')
const { ref } = require('objection')

const LicenceModel = require('../../models/licence.model.js')

async function go (licenceId) {
  const licence = await _fetchLicence(licenceId)
  const results = await _fetchEntries(licenceId)

  return {
    entries: results,
    licence
  }
}

async function _fetchLicence (licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select([
      'id',
      'licenceRef',
      'createdAt'
    ])
}

async function _fetchEntries (licenceId) {
  const licenceEntries = LicenceModel.query()
    .findById(licenceId)
    .withGraphFetched('licenceVersions')
    .modifyGraph('licenceVersions', (builder) => {
      builder
        .select(
          'licenceVersions.licenceId as licenceId',
          db.raw("'licence-version' as entry_type"),
          'licenceVersions.id as entry_id',
          db.raw("'' as reason"),
          'licenceVersions.createdAt as created_at',
          db.raw("'' as createdBy"),
          db.raw("'' as note"),
          'issue as version_number'
        )
        .orderBy([
          { column: 'createdAt', order: 'desc' },
          { column: 'issue', order: 'desc' }
        ])
    })
    .withGraphFetched('chargeVersions')
    .modifyGraph('chargeVersions', (builder) => {
      builder
        .select(
          'chargeVersions.licenceId as licenceId',
          db.raw("'charge-version' as entry_type"),
          'chargeVersions.id as entry_id',
          'public.changeReasons.description as reason',
          'chargeVersions.createdAt as created_at',
          ref('createdBy:email').castText().as('created_by'),
          'water.notes.text as note',
          'versionNumber as version_number',
          'chargeVersions.source as source'
        )
        .leftJoin('water.notes', 'notes.noteId', '=', 'chargeVersions.noteId')
        .leftJoin('public.changeReasons', 'changeReasons.id', '=', 'chargeVersions.changeReasonId')
        .orderBy([
          { column: 'chargeVersions.createdAt', order: 'desc' },
          { column: 'chargeVersions.versionNumber', order: 'desc' }
        ])
    })
    .withGraphFetched('returnVersions')
    .modifyGraph('returnVersions', (builder) => {
      builder
        .select(
          'returnVersions.licenceId as licenceId',
          db.raw("'return-version' as entry_type"),
          'returnVersions.id as entry_id',
          'reason',
          'returnVersions.createdAt as created_at',
          'users.username as created_by',
          'notes as note',
          'version as version_number'
        )
        .leftJoin('public.users', 'users.id', '=', 'returnVersions.createdBy')
        .orderBy([
          { column: 'createdAt', order: 'desc' },
          { column: 'version', order: 'desc' }
        ])
    })

  return licenceEntries
}

module.exports = {
  go
}
