'use strict'

/**
 * Fetches the licence and charge version data for the given licenceId
 * @module FetchLicenceChargeVersionsService
 */

const { ref } = require('objection')

const { determineCurrentFinancialYear } = require('../../../lib/general.lib.js')
const LicenceModel = require('../../../models/licence.model.js')
const ChargeVersionModel = require('../../../models/charge-version.model.js')
const ChargeReferenceModel = require('../../../models/charge-reference.model.js')

const APRIL = 3

/**
 * I am comment
 * @param {*} transformedLicence
 * @param {*} wrlsLicenceId
 * @returns
 */
async function go (transformedLicence, wrlsLicenceId) {
  const changedDates = await _fetchChangedDates(wrlsLicenceId, transformedLicence)
  const earliestDate = _earliestDate(changedDates)

  console.log('Before fetching the charge version')
  // const chargeVersions = await _fetchChargeVersions(earliestDate, wrlsLicenceId)

  const licence = await _fetchLicenceData(wrlsLicenceId)
  const chargeVersionData = await _fetchChargeVersionsData(wrlsLicenceId)

  console.log('Licence :', licence)
  console.log('chargeVersionData :', chargeVersionData)

  return chargeVersions
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
          .first()
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
      'licences.revokedDate'
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

function _dateToFlag (changedDates, naldDate, wrlsDate) {
  const { startDate, endDate } = determineCurrentFinancialYear()
  const sixYearsAgo = new Date(startDate.getFullYear() - 6, APRIL, 1)

  if (naldDate) {
    changedDates.push(naldDate)

    return
  }

  // Revoked date is 2030-04-01
  // New revoked date is null
  // Years to flag NONE
  // If the old licence revoked date is greater than the current financial year then don't flag
  if (wrlsDate > endDate) {
    return
  }

  // Revoked date is 2022-04-01
  // New revoked date is null
  // Years to flag 2023, 2024, 2025
  // If the old licence revoked date is between the previous 6 years and the current financial year end then set it to
  // the old licence revoked date
  if (wrlsDate < endDate && wrlsDate > sixYearsAgo) {
    changedDates.push(wrlsDate)

    return
  }

  // Revoked date is 2010-03-31
  // New revoked date is null
  // Years to flag 2019, 2020, 2021, 2022, 2023, 2024, 2025
  // If the old licence revoked date is less than the 6 years before, then set it to be the 6 years before date
  if (wrlsDate < sixYearsAgo) {
    changedDates.push(sixYearsAgo)
  }
}

function _earliestDate (changedDates) {
  const datesAsTimeStamps = []

  for (const date of changedDates) {
    datesAsTimeStamps.push(date.getTime())
  }

  const minTimeStamp = Math.min(...datesAsTimeStamps)

  return new Date(minTimeStamp)
}

async function _fetchChangedDates (wrlsLicenceId, transformedLicence) {
  const { revokedDate, lapsedDate, expiredDate } = transformedLicence

  const licence = await LicenceModel.query()
    .where('id', wrlsLicenceId)
    .select([
      'revokedDate',
      'expiredDate',
      'lapsedDate'
    ])

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

/**
 * Dates we have
 * // 2019
 * Earliest day ~ The earliest date the charge versions will be affected by
 *
 * Charge Versions dates
 * // CV1 ~ Don't include, Don't count
 * // startDate: 2010
 * // endDate: 2012
 *
 * // CV2 ~ Don't include, Do count
 * // startDate: 2018
 * // endDate: 2022
 *
 * // CV3 ~ Do Include, Do count
 * // startDate: 2018
 * // endDate: 2024
 *
 * // CV4 ~ Do Include, Do count
 * // startDate: 2018
 * // endDate: null
 *
 * // CV5 ~ Do Include, Don't count
 * // startDate: 2022-04-01
 * // endDate: null
 * @private
 */
async function _fetchChargeVersions (earliestDate, wrlsLicenceId) {
  return LicenceModel.query()
    .findById(wrlsLicenceId)
    .select([
      'id',
      'licenceRef',
      'includeInPresrocBilling',
      'includeInSrocBilling',
      'revokedDate',
      'lapsedDate',
      'expiredDate',
      LicenceModel.relatedQuery('chargeVersions').count().as('preSrocChargeVersions')
        .where((builder) => {
          builder
            .where('startDate', '')
        })
        .where('startDate', '<', '2022-04-01')
        .where('endDate', '<', '2022-04-01')
        .where('endDate', '>', earliestDate)
    ])
    // .withGraphFetched('chargeVersions')
    // .modifyGraph('chargeVersions', (builder) => {
    //   builder
    //     .count({ preSrocChargeVersions: ChargeVersionModel.raw("CASE WHEN end_date < '2022-04-01' THEN 1 END") })
    //     .groupBy('chargeVersions.id', 'chargeVersions.startDate', 'chargeVersions.endDate', 'licenceId')
    // })
    .withGraphFetched('chargeVersions')
    .modifyGraph('chargeVersions', (builder) => {
      builder
        .select([
          'id',
          'startDate',
          'endDate'
        ])
        // .where('endDate', '>', earliestDate)
        // .orWhere('endDate', null)
    })
    .withGraphFetched('chargeVersions.chargeReferences')
    .modifyGraph('chargeVersions.chargeReferences', (builder) => {
      builder
        .select([
          'id',
          ref('chargeReferences.adjustments:s127').castText().as('s127')
        ])
    })
    .withGraphFetched('chargeVersions.chargeReferences.chargeElements')
    .modifyGraph('chargeVersions.chargeReferences.chargeElements', (builder) => {
      builder
        .select([
          'id',
          'section127Agreement'
        ])
    })
}

module.exports = {
  go
}
