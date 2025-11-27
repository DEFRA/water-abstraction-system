'use strict'

/**
 * Formats data for the `/licences/{id}/history` view history page
 * @module HistoryPresenter
 */

const { formatLongDate } = require('../base.presenter.js')
const { returnRequirementReasons } = require('../../lib/static-lookups.lib.js')

/**
 * Formats data for the `/licences/{id}/history` view history page
 *
 * @param licenceHistory - The licence and related charge, licence and return versions
 * @param {object} licence - The id and licence ref of the licence
 *
 * @returns The data formatted and sorted for the view template
 */
function go(licenceHistory, licence) {
  const { id: licenceId, licenceRef } = licence

  const chargeVersionEntries = _chargeVersionEntries(licenceHistory, licenceId)
  const licenceVersionEntries = _licenceVersionEntries(licenceHistory)
  const returnVersionEntries = _returnVersionEntries(licenceHistory)

  const sortedEntries = _sortEntries(chargeVersionEntries, licenceVersionEntries, returnVersionEntries)

  return {
    backLink: {
      href: `/system/licences/${licenceId}/summary`,
      text: 'Go back to search'
    },
    entries: sortedEntries,
    pageTitle: 'History',
    pageTitleCaption: `Licence ${licenceRef}`
  }
}

function _chargeVersionEntries(licence, licenceId) {
  const { chargeVersions } = licence

  return chargeVersions.map((chargeVersion) => {
    const createdAt = chargeVersion.$createdAt()
    const notes = chargeVersion.$notes()

    return {
      createdAt,
      createdBy: _createdBy(chargeVersion),
      dateCreated: formatLongDate(createdAt),
      displayNote: notes.length > 0,
      notes,
      link: `/licences/${licenceId}/charge-information/${chargeVersion.id}/view`,
      reason: chargeVersion.$reason(),
      startDate: formatLongDate(chargeVersion.startDate),
      type: { index: 1, name: 'Charge version' }
    }
  })
}

function _createdBy(entry) {
  const createdBy = entry.$createdBy()

  if (createdBy) {
    return createdBy
  }

  return 'Migrated from NALD'
}

function _licenceVersionEntries(licence) {
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
      startDate: formatLongDate(licenceVersion.startDate),
      type: { index: 0, name: 'Licence version' }
    }
  })
}

function _returnVersionEntries(licence) {
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
      link: `/system/return-versions/${returnVersion.id}`,
      reason: mappedReason ?? reason,
      startDate: formatLongDate(returnVersion.startDate),
      type: { index: 2, name: 'Return version' }
    }
  })
}

function _sortEntries(chargeVersionEntries, licenceVersionEntries, returnVersionEntries) {
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
