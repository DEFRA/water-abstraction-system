'use strict'

const { formatLongDate } = require('../base.presenter.js')

function go (history) {
  const { entries, licence } = history

  return {
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    entries: _entries(entries)
  }
}

function _entries (entries) {
  const sortedEntries = _sortEntriesByCreatedAt(entries)

  const mappedEntries = _mapEntries(sortedEntries)

  return mappedEntries
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

function _mapEntries (entries) {
  return entries.map((entry) => {
    return {
      type: _type(entry.entryType),
      reason: entry.reason,
      dateCreated: formatLongDate(entry.createdAt),
      createdBy: entry.createdBy ? entry.createdBy : 'Migrated from NALD',
      note: entry.note ? entry.note : null,
      version: entry.versionNumber,
      source: entry.source ? entry.source : null,
      link: _link(entry.entryType, entry.entryId, entry.licenceId)
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

function _sortEntriesByCreatedAt (entries) {
  entries.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  return entries
}

module.exports = {
  go
}
