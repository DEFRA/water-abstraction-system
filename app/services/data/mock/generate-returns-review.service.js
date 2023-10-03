'use strict'

/**
 * Generates mock returns review based on a real one
 * @module GenerateReturnsReviewService
 */

const BillRunVolumeModel = require('../../../../app/models/water/bill-run-volume.model.js')
const { db } = require('../../../../db/db.js')

const GenerateMockDataService = require('./generate-mock-data.service.js')

async function go (id) {
  const billRunVolumes = await _fetchBillRunVolumes(id)

  if (!billRunVolumes) {
    throw new Error('No matching bill run exists')
  }

  return _response(billRunVolumes)
}

async function _fetchBillRunVolumes (id) {
  return db
    .select(
      'cv.licence_id',
      'cv.licence_ref',
      'cv.invoice_account_id',
      'ia.invoice_account_number',
      'bv.financial_year',
      'bv.calculated_volume',
      'bv.volume',
      'bv.two_part_tariff_status',
      'bv.two_part_tariff_error'
    )
    .from('water.billing_volumes AS bv')
    .innerJoin('water.charge_elements AS ce', 'ce.charge_element_id', 'bv.charge_element_id')
    .innerJoin('water.charge_versions AS cv', 'cv.charge_version_id', 'ce.charge_version_id')
    .innerJoin('crm_v2.invoice_accounts AS ia', 'ia.invoice_account_id', 'cv.invoice_account_id')
    .where({
      'bv.billing_batch_id': id
    })
    .orderBy('cv.licence_ref', 'bv.financial_year')
}

function _transformToBeLicenceBased (billRunVolumes) {
  const allLicenceIds = billRunVolumes.map((billRunVolume) => {
    return billRunVolume.licenceId
  })

  const uniqueLicenceIds = [...new Set(allLicenceIds)]

  const licences = []

  uniqueLicenceIds.forEach((licenceId) => {
    const volumesMatchedByLicence = billRunVolumes.filter((billRunVolume) => {
      return billRunVolume.licenceId === licenceId
    })
    const { licenceRef } = volumesMatchedByLicence[0]

    const allMatchedFinancialYears = volumesMatchedByLicence.map((billRunVolume) => {
      return billRunVolume.financialYear
    })

    const uniqueFinancialYears = [...new Set(allMatchedFinancialYears)]
    uniqueFinancialYears.sort()

    const financialYears = []

    uniqueFinancialYears.forEach((uniqueFinancialYear) => {
      const volumesMatchedByFinancialYear = volumesMatchedByLicence.filter((billRunVolume) => {
        return billRunVolume.financialYear === uniqueFinancialYear
      })

      const volumes = volumesMatchedByFinancialYear.map((billRunVolume) => {
        const { invoiceAccountId, invoiceAccountNumber, calculatedVolume, volume, twoPartTariffStatus, twoPartTariffError } = billRunVolume
        return {
          invoiceAccountId,
          invoiceAccountNumber,
          reportedReturns: calculatedVolume,
          billableReturns: volume,
          twoPartTariffStatus,
          twoPartTariffError,
          issue: _twoPartTariffStatus(twoPartTariffStatus)
        }
      })

      const financialYear = {
        financialStartYear: uniqueFinancialYear - 1,
        financialEndYear: uniqueFinancialYear,
        volumes
      }

      financialYears.push(financialYear)
    })

    const licence = {
      licenceId,
      licenceReference: licenceRef,
      billingContact: GenerateMockDataService.go().name,
      financialYears
    }

    licences.push(licence)
  })

  return licences
}

function _twoPartTariffStatus (statusCode) {
  const index = Object.values(BillRunVolumeModel.twoPartTariffStatuses).findIndex((value) => {
    return value === statusCode
  })

  if (index !== -1) {
    return Object.keys(BillRunVolumeModel.twoPartTariffStatuses)[index]
  }

  return null
}

function _response (mockedReturnReviewData) {
  return _transformToBeLicenceBased(mockedReturnReviewData)
}

module.exports = {
  go
}
