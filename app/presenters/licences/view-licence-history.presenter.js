'use strict'

/**
 * Formats data for the `/licences/{id}/history` view licence history page
 * @module ViewLicenceHistoryPresenter
 */

const { formatLongDate } = require('../base.presenter.js')
const { returnRequirementReasons } = require('../../lib/static-lookups.lib.js')

/**
 * Formats data for the `/licences/{id}/history` view licence history page
 *
 * @param {module:LicenceModel|ChargeVersionModel|LicenceVersionModel|ReturnVersionModel} history - The licence and
 * related charge, licence and return versions
 *
 * @returns The data formatted and sorted for the view template
 */
function go (history) {
  const { licence, entries } = history

  return {
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    entries: _entries(entries, licence.id)
  }
}

function _createdBy (entry) {
  const createdBy = entry.$createdBy()

  if (createdBy) {
    return createdBy
  }

  return 'Migrated from NALD'
}

function _entries (entries, licenceId) {
  const chargeVersions = _mapEntries(entries.chargeVersions, 'charge-version', licenceId)
  const licenceVersions = _mapEntries(entries.licenceVersions, 'licence-version', licenceId)
  const returnVersions = _mapEntries(entries.returnVersions, 'return-version', licenceId)

  const joinedEntries = [...chargeVersions, ...licenceVersions, ...returnVersions]

  return _sortEntries(joinedEntries)
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

function _mapEntries (entries, entryType, licenceId) {
  return entries.map((entry) => {
    const createdAt = entry.$createdAt()
    const notes = entry.$notes()

    return {
      createdAt,
      createdBy: _createdBy(entry),
      dateCreated: formatLongDate(createdAt),
      displayNote: notes.length > 0,
      notes,
      link: _link(entryType, entry.id, licenceId),
      reason: _reason(entry),
      type: _type(entryType)
    }
  })
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
