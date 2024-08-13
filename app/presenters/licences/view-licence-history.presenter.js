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

function _createdAt (entry) {
  const { created_at: createdAt, mod_log: modLog } = entry

  if (modLog.createdAt) {
    return new Date(modLog.createdAt)
  }

  return createdAt
}

function _createdBy (entry) {
  const { created_by: createdBy, mod_log: modLog } = entry

  if (createdBy) {
    return createdBy
  }

  if (modLog.createdBy) {
    return modLog.createdBy
  }

  return 'Migrated from NALD'
}

function _entries (entries) {
  const formattedEntries = entries.map((entry) => {
    const createdAt = _createdAt(entry)
    const notes = _notes(entry)

    return {
      createdAt,
      createdBy: _createdBy(entry),
      dateCreated: formatLongDate(createdAt),
      displayNote: notes.length > 0,
      notes,
      link: _link(entry.entry_type, entry.entry_id, entry.licence_id),
      reason: _reason(entry),
      type: _type(entry.entry_type)
    }
  })

  return _sortEntries(formattedEntries)
}

function _notes (entry) {
  const notes = [entry.mod_log.note, entry.note]

  // Filter out null or blank from the array
  return notes.filter((note) => {
    return note
  })
}

function _reason (entry) {
  const { mod_log: modLog, reason } = entry

  if (reason) {
    return reason
  }

  if (modLog.description) {
    return modLog.description
  }

  if (modLog.code) {
    return modLog.code
  }

  return null
}

function _sortEntries (entries) {
  return entries.sort((entryA, entryB) => {
    if (entryA.createdAt > entryB.createdAt) {
      return -1
    } else if (entryA.createdAt < entryB.createdAt) {
      return 1
    }

    if (entryA.type.index > entryB.type.index) {
      return -1
    } else if (entryA.type.index < entryB.type.index) {
      return 1
    }

    return 0
  })
}

function _type (entryType) {
  if (entryType === 'charge-version') {
    return { index: 1, name: 'Charge version' }
  }

  if (entryType === 'return-version') {
    return { index: 2, name: 'Return version' }
  }

  return { index: 0, name: 'Licence version' }
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

module.exports = {
  go
}
