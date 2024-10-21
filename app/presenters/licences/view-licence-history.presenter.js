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
 * @param {module:LicenceModel} licence - The licence and related charge, licence and return versions
 *
 * @returns The data formatted and sorted for the view template
 */
function go (licence) {
  const { id: licenceId, licenceRef } = licence

  const chargeVersionEntries = _chargeVersionEntries(licence)
  const licenceVersionEntries = _licenceVersionEntries(licence)
  const returnVersionEntries = _returnVersionEntries(licence)

  const sortedEntries = _sortEntries(chargeVersionEntries, licenceVersionEntries, returnVersionEntries)

  return {
    entries: sortedEntries,
    licenceId,
    licenceRef,
    pageTitle: `History for ${licenceRef}`
  }
}

function _chargeVersionEntries (licence) {
  const { chargeVersions, id } = licence

  return chargeVersions.map((chargeVersion) => {
    const createdAt = chargeVersion.$createdAt()
    const notes = chargeVersion.$notes()

    return {
      createdAt,
      createdBy: _createdBy(chargeVersion),
      dateCreated: formatLongDate(createdAt),
      displayNote: notes.length > 0,
      notes,
      link: `/licences/${id}/charge-information/${chargeVersion.id}/view`,
      reason: chargeVersion.$reason(),
      type: { index: 1, name: 'Charge version' }
    }
  })
}

function _createdBy (entry) {
  const createdBy = entry.$createdBy()

  if (createdBy) {
    return createdBy
  }

  return 'Migrated from NALD'
}

function _licenceVersionEntries (licence) {
  const { licenceVersions } = licence

  return licenceVersions.map((licenceVersion) => {
    const createdAt = licenceVersion.$createdAt()
    const notes = licenceVersion.$notes()

    return {
      createdAt,
      createdBy: _createdBy(licenceVersion),
      dateCreated: formatLongDate(createdAt),
      displayNote: notes.length > 0,
      notes,
      link: null,
      reason: licenceVersion.$reason(),
      type: { index: 0, name: 'Licence version' }
    }
  })
}

function _returnVersionEntries (licence) {
  const { returnVersions } = licence

  return returnVersions.map((returnVersion) => {
    const createdAt = returnVersion.$createdAt()
    const notes = returnVersion.$notes()
    const reason = returnVersion.$reason()
    const mappedReason = returnRequirementReasons[reason]

    return {
      createdAt,
      createdBy: _createdBy(returnVersion),
      dateCreated: formatLongDate(createdAt),
      displayNote: notes.length > 0,
      notes,
      link: `/system/return-requirements/${returnVersion.id}`,
      reason: mappedReason ?? reason,
      type: { index: 2, name: 'Return version' }
    }
  })
}

function _sortEntries (chargeVersionEntries, licenceVersionEntries, returnVersionEntries) {
  const joinedEntries = [...chargeVersionEntries, ...licenceVersionEntries, ...returnVersionEntries]

  return joinedEntries.sort((entryA, entryB) => {
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

module.exports = {
  go
}
