'use strict'

const { db } = require('../../../db/db.js')
const { ref } = require('objection')

const ChargeVersionModel = require('../../models/charge-version.model.js')
const LicenceModel = require('../../models/licence.model.js')
const LicenceVersionModel = require('../../models/licence-version.model.js')
const ReturnVersionModel = require('../../models/return-version.model.js')

async function go (licenceId) {
  const licence = await _fetchLicence(licenceId)

  const chargeVersions = await _fetchChargeVersions(licenceId)
  const licenceVersions = await _fetchLicenceVersions(licenceId)
  const returnVersions = await _fetchReturnVersions(licenceId)

  return {
    entries: [...chargeVersions, ...licenceVersions, ...returnVersions],
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

async function _fetchChargeVersions (licenceId) {
  return ChargeVersionModel.query()
    .select(
      'chargeVersions.licenceId as licenceId',
      db.raw("'charge-version' as entry_type"),
      'chargeVersions.id as entry_id',
      'public.changeReasons.description as reason',
      'chargeVersions.createdAt as created_at',
      ref('createdBy:email').castText().as('created_by'),
      'water.notes.text as note',
      'versionNumber as version_number',
      'chargeVersions.source as source',
      db.raw("'' as mod_log")
    )
    .leftJoin('water.notes', 'notes.noteId', '=', 'chargeVersions.noteId')
    .leftJoin('public.changeReasons', 'changeReasons.id', '=', 'chargeVersions.changeReasonId')
    .orderBy([
      { column: 'chargeVersions.createdAt', order: 'desc' },
      { column: 'chargeVersions.versionNumber', order: 'desc' }
    ])
    .where('chargeVersions.licenceId', licenceId)
}

async function _fetchLicenceVersions (licenceId) {
  return LicenceVersionModel.query()
    .select(
      'licenceVersions.licenceId as licenceId',
      db.raw("'licence-version' as entry_type"),
      'licenceVersions.id as entry_id',
      db.raw("'' as reason"),
      'licenceVersions.createdAt as created_at',
      db.raw("'' as created_by"),
      db.raw("'' as note"),
      'issue as version_number',
      db.raw("'' as mod_log")
    )
    .orderBy([
      { column: 'createdAt', order: 'desc' },
      { column: 'issue', order: 'desc' }
    ])
    .where('licenceVersions.licenceId', licenceId)
}

async function _fetchReturnVersions (licenceId) {
  return ReturnVersionModel.query()
    .select(
      'returnVersions.licenceId as licenceId',
      db.raw("'return-version' as entry_type"),
      'returnVersions.id as entry_id',
      'reason',
      'returnVersions.createdAt as created_at',
      'users.username as created_by',
      'notes as note',
      'version as version_number',
      'modLog as mod_log'
    )
    .leftJoin('public.users', 'users.id', '=', 'returnVersions.createdBy')
    .orderBy([
      { column: 'createdAt', order: 'desc' },
      { column: 'version', order: 'desc' }
    ])
    .where('returnVersions.licenceId', licenceId)
}

module.exports = {
  go
}
