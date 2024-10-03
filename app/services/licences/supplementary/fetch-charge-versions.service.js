'use strict'

/**
 * Fetches the licence and charge version data for the given licenceId
 * @module FetchLicenceChargeVersionsService
 */

const ChargeReferenceModel = require('../../../models/charge-reference.model.js')
const ChargeVersionModel = require('../../../models/charge-version.model.js')
const { determineCurrentFinancialYear } = require('../../../lib/general.lib.js')
const LicenceModel = require('../../../models/licence.model.js')

const APRIL = 3

/**
 * Fetches and returns the charge versions, changed dates and the licence data.
 *
 * It determines which dates have changed by comparing the incoming dates from the
 * nald import to the dates we currently hold on the wrls licence
 * @param {*} naldLicence - the legacy NALD licence
 * @param {string} wrlsLicenceId - The UUID of the licence being fetched
 *
 * @returns {Promise<object>} - The data needed to determine which supplementary flags the licence needs
 */
async function go (naldLicence, wrlsLicenceId) {
  const licence = await _fetchLicenceData(wrlsLicenceId)
  const changedDates = await _fetchChangedDates(licence, naldLicence)
  const chargeVersions = await _fetchChargeVersionsData(wrlsLicenceId)

  return { chargeVersions, changedDates, licence }
}

function _dateToFlag (changedDates, naldDate, wrlsDate) {
  const { startDate, endDate } = determineCurrentFinancialYear()
  const sixYearsAgo = new Date(startDate.getFullYear() - 6, APRIL, 1)

  if (naldDate) {
    changedDates.push(naldDate)

    return
  }

  if (wrlsDate > endDate) {
    return
  }

  if (wrlsDate < endDate && wrlsDate > sixYearsAgo) {
    changedDates.push(wrlsDate)

    return
  }

  if (wrlsDate < sixYearsAgo) {
    changedDates.push(sixYearsAgo)
  }
}

async function _fetchChangedDates (licence, naldLicence) {
  const { revokedDate, lapsedDate, expiredDate } = naldLicence

  const changedDates = []

  if (revokedDate !== licence[0].revokedDate) {
    _dateToFlag(changedDates, revokedDate, licence[0].revokedDate)
  }

  if (lapsedDate !== licence[0].lapsedDate) {
    _dateToFlag(changedDates, lapsedDate, licence[0].lapsedDated)
  }

  if (expiredDate !== licence[0].expiredDate) {
    _dateToFlag(changedDates, expiredDate, licence[0].expiredDate)
  }

  return changedDates
}

async function _fetchChargeVersionsData (id) {
  return ChargeVersionModel.query()
    .select('id', 'startDate', 'endDate')
    .where('licenceId', id)
    .andWhere('start_date', '>=', '2022-04-01')
    .modify((builder) => {
      builder.select(
        ChargeVersionModel.relatedQuery('chargeReferences')
          .join('charge_elements as ce', 'ce.charge_reference_id', 'charge_references.id')
          .where('charge_versions.id', ChargeVersionModel.ref('charge_references.charge_version_id'))
          .andWhere('ce.section127Agreement', true)
          .andWhere(ChargeReferenceModel.raw("charge_references.adjustments->>'s127' = 'true'"))
          .limit(1)
          .select(ChargeReferenceModel.raw('EXISTS(SELECT 1)'))
          .as('two_part_tariff')
      )
    })
}

async function _fetchLicenceData (id) {
  return LicenceModel.query()
    .select([
      'licences.id',
      'licences.expiredDate',
      'licences.lapsedDate',
      'licences.revokedDate',
      'include_in_sroc_billing',
      'include_in_presroc_billing'
    ])
    .distinctOn('licences.id')
    .where('licences.id', id)
    .leftJoin('charge_versions as cv', 'licences.id', 'cv.licence_id')
    .modify((builder) => {
      builder.select(
        ChargeVersionModel.query()
          .count()
          .whereColumn('charge_versions.licence_id', 'licences.id')
          .andWhere('charge_versions.start_date', '<', '2022-04-01')
          .as('pre_sroc')
      )
    })
}

module.exports = {
  go
}
