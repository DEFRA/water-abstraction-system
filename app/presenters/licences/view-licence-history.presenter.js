'use strict'

const { formatLongDate } = require('../base.presenter.js')
const { returnRequirementReasons } = require('../../lib/static-lookups.lib.js')

function go (history) {
  const { entries, licence } = history

  return {
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    entries: _entries(entries)
  }
}

function _createdBy (entry) {
  const createdBy = entry.$createdBy()

  if (createdBy) {
    return createdBy
  }

  return 'Migrated from NALD'
}

function _entries (entries) {
  const formattedEntries = entries.map((entry) => {
    const createdAt = entry.$createdAt()
    const notes = entry.$notes()

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

/**
 * The history helper $reason() will return either the reason saved against the return version record, the reason
 * captured in the first mod log entry, or null.
 *
 * If its the reason saved against the return version we have to map it to its display version first.
 *
 * @private
 */
function _reason (entry) {
  const reason = entry.$reason()
  const mappedReason = returnRequirementReasons[reason]

  if (mappedReason) {
    return mappedReason
  }

  return reason ?? ''
}

function _sortEntries (entries) {
  return entries.sort((entryA, entryB) => {
    if (entryA.createdAt > entryB.createdAt) {
      return -1
    }

    if (entryA.createdAt < entryB.createdAt) {
      return 1
    }

    if (entryA.type.index > entryB.type.index) {
      return -1
    }

    if (entryA.type.index < entryB.type.index) {
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

module.exports = {
  go
}
