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

module.exports = {
  go
}
