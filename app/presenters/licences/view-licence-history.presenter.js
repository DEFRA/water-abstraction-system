'use strict'

const { formatLongDate } = require('../base.presenter.js')

function go (history) {
  const { entries, licence, testEntries2 } = history

  return {
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    entries: _entries(entries),
    testEntries: _entries2(testEntries2)
  }
}

function _entries (entries) {
  return entries.map((entry) => {
    return {
      type: _type(entry.entry_type),
      reason: entry.reason,
      dateCreated: formatLongDate(entry.created_at),
      createdBy: entry.created_by ? entry.created_by : 'Migrated from NALD',
      note: entry.note,
      link: _link(entry.entry_type, entry.entry_id, entry.licence_id)
    }
  })
}

function _type (entryType) {
  if (entryType === 'charge-version') {
    return 'Charge version'
  }

  if (entryType === 'return-version') {
    return 'Return version'
  }

  return 'Licence version'
}

function _link (entryType, entryId, licenceId) {
  if (entryType === 'charge-version') {
    return `/licences/${licenceId}/charge-information/${entryId}/view`
  }

  if (entryType === 'return-version') {
    return `/system/return-requirements/${entryId}/view`
  }

  return null
}

function _entries2 (entries) {
  const { licenceVersions, chargeVersions, returnVersions } = entries

  entries = _sortEntriesByCreatedAt([...licenceVersions, ...chargeVersions, ...returnVersions])

  const mappedEntries = _mapEntries(entries)

  return mappedEntries
}

function _sortEntriesByCreatedAt (entries) {
  entries.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  return entries
}

function _mapEntries (entries) {
  return entries.map((entry) => {
    return {
      type: _type(entry.entryType),
      reason: entry.reason,
      dateCreated: formatLongDate(entry.createdAt),
      createdBy: entry.createdBy ? entry.createdBy : 'Migrated from Nald',
      note: entry.note ? entry.note : null,
      version: entry.versionNumber,
      source: entry.source ? entry.source : null,
      link: _link(entry.entryType, entry.entryId, entry.licenceId)
    }
  })
}

module.exports = {
  go
}
