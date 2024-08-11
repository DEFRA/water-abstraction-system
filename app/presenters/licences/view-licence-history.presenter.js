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

function _dateCreated (entry) {
  const { created_at: createdAt, mod_log: modLog } = entry

  if (modLog.createdAt) {
    const modLogCreated = new Date(modLog.createdAt)

    return formatLongDate(modLogCreated)
  }

  return formatLongDate(createdAt)
}

function _entries (entries) {
  return entries.map((entry) => {
    return {
      type: _type(entry.entry_type),
      reason: _reason(entry),
      dateCreated: _dateCreated(entry),
      createdBy: _createdBy(entry),
      note: _note(entry),
      link: _link(entry.entry_type, entry.entry_id, entry.licence_id)
    }
  })
}

function _note (entry) {
  const { mod_log: modLog, note } = entry

  if (modLog.note && note) {
    return `${modLog.note} / ${note}`
  }

  if (note) {
    return note
  }

  if (modLog.note) {
    return modLog.note
  }

  return null
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

module.exports = {
  go
}
