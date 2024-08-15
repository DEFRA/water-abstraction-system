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
  const { createdAt, modLog } = entry

  if (modLog.createdAt) {
    return new Date(modLog.createdAt)
  }

  return createdAt
}

function _createdBy (entry) {
  const { createdBy, modLog } = entry

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
      link: _link(entry.entryType, entry.entryId, entry.licenceId),
      reason: _reason(entry),
      type: _type(entry.entryType)
    }
  })

  return _sortEntries(formattedEntries)
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

function _notes (entry) {
  const notes = [entry.modLog.note, entry.note]

  // Filter out null or blank from the array
  return notes.filter((note) => {
    return note
  })
}

function _reason (entry) {
  const { modLog, reason } = entry

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
    } else {
      // NOTE: If createdAt for entryA and entryB are equal, we sort by the entry type.
      if (entryA.type.index > entryB.type.index) {
        return -1
      } else if (entryA.type.index < entryB.type.index) {
        return 1
      } else {
        return 0
      }
    }
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

module.exports = {
  go
}
