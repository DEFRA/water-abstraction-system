'use strict'

const { db } = require('../../../db/db.js')

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
      db.raw("'charge-version' as entry_type"),
      'chargeVersions.id as entry_id',
      'chargeVersions.createdAt as created_at'
    )
    .modify('history')
    .orderBy([
      { column: 'versionNumber', order: 'desc' }
    ])
    .where('chargeVersions.licenceId', licenceId)
}

async function _fetchLicenceVersions (licenceId) {
  return LicenceVersionModel.query()
    .select(
      db.raw("'licence-version' as entry_type"),
      'licenceVersions.id as entry_id',
      'licenceVersions.createdAt as created_at'
    )
    .modify('history')
    .orderBy([
      { column: 'issue', order: 'desc' }
    ])
    .where('licenceVersions.licenceId', licenceId)
}

async function _fetchReturnVersions (licenceId) {
  return ReturnVersionModel.query()
    .select(
      db.raw("'return-version' as entry_type"),
      'returnVersions.id as entry_id',
      'returnVersions.createdAt as created_at'
    )
    .modify('history')
    .orderBy([
      { column: 'version', order: 'desc' }
    ])
    .where('returnVersions.licenceId', licenceId)
}

module.exports = {
  go
}
