'use strict'

/**
 * Does stuff
 * @module TearDownService
 */

const { db } = require('../../../db/db.js')

async function go () {
  await _deleteBilling()
  await _deleteGaugingStations()
  await _deleteTestData('water.chargeElements')
  await _deleteChargeVersions()
  await _deleteTestData('water.licenceAgreements')
  await _deleteReturnRequirements()
  await _deleteLicenceAgreements()
  await _deleteTestData('water.financialAgreementTypes')
  await _deleteTestData('water.licenceVersionPurposes')
  await _deleteTestData('water.licenceVersions')
  await _deleteTestData('water.licences')
  await _deleteTestData('water.regions')

  return 'Data deleted'
}

async function _deleteBilling () {
  // Delete billingtransactions
  const billingInvoiceLicences = await db
    .from('water.billingTransactions as bt')
    .innerJoin('water.billingInvoiceLicences as bil', 'bt.billingInvoiceLicenceId', 'bil.billingInvoiceLicenceId')
    .innerJoin('water.billingInvoices as bi', 'bil.billingInvoiceId', 'bi.billingInvoiceId')
    .innerJoin('water.billingBatches as bb', 'bi.billingBatchId', 'bb.billingBatchId')
    .innerJoin('water.regions as r', 'bb.regionId', 'r.regionId')
    .where('r.isTest', true)
    .del(['bt.billingInvoiceLicenceId'])

  const billingInvoiceLicenceIds = billingInvoiceLicences.map((billingInvoiceLicence) => {
    return billingInvoiceLicence.billingInvoiceLicenceId
  })

  // Delete billingInvoiceLicences
  const billingInvoices = await db
    .from('water.billingInvoiceLicences')
    .whereIn('billingInvoiceLicenceId', billingInvoiceLicenceIds)
    .del(['billingInvoiceId'])

  const billingInvoiceIds = billingInvoices.map((billingInvoice) => {
    return billingInvoice.billingInvoiceId
  })

  // Delete billingInvoices
  const billingBatches = await db
    .from('water.billingInvoices')
    .whereIn('billingInvoiceId', billingInvoiceIds)
    .del(['billingBatchId'])

  const billingBatchIds = billingBatches.map((billingBatch) => {
    return billingBatch.billingBatchId
  })

  // Delete billingBatchChargeVersionYears
  await db
    .from('water.billingBatchChargeVersionYears')
    .whereIn('billingBatchId', billingBatchIds)
    .del()

  // Delete billingVolumes
  await db
    .from('water.billingVolumes')
    .whereIn('billingBatchId', billingBatchIds)
    .del()

  // Delete billingBatches
  await db
    .from('water.billingBatches')
    .whereIn('billingBatchId', billingBatchIds)
    .del()
}

async function _deleteGaugingStations () {
  // Delete licenceGaugingStations
  await db
    .from('water.licenceGaugingStations as lgs')
    .innerJoin('water.gaugingStations as gs', 'lgs.gaugingStationId', 'gs.gaugingStationId')
    .where('gs.isTest', true)
    .del()

  // Delete gaugingStations
  await _deleteTestData('water.gaugingStations')
}

async function _deleteChargeVersions () {
  // Delete chargeVersionWorkflows
  await db
    .from('water.chargeVersionWorkflows')
    .del()

  // Delete chargeElements
  await db
    .from('water.chargeElements as ce')
    .innerJoin('water.chargeVersion as cv', 'ce.chargeVersionId', 'cv.chargeVersionId')
    .innerJoin('water.licences as l', 'cv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()

  // Delete chargeversions
  await db
    .from('water.chargeversions as cv')
    .innerJoin('water.licences as l', 'cv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()
}

async function _deleteReturnRequirements () {
  // Delete returnRequirementPurposes
  await db
    .from('water.returnRequirementPurposes as rrp')
    .innerJoin('water.returnRequirements as rr', 'rrp.returnRequirementId', 'rr.returnRequirementId')
    .innerJoin('water.returnVersions as rv', 'rr.returnVersionId', 'rv.returnVersionId')
    .innerJoin('water.licences as l', 'rv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()

  // Delete returnRequirements
  await db
    .from('water.returnrequirements as rr')
    .innerJoin('water.returnVersions as rv', 'rr.returnVersionId', 'rv.returnVersionId')
    .innerJoin('water.licences as l', 'rv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()

  // Delete returnVersions
  await db
    .from('water.returnVersions as rv')
    .innerJoin('water.licences as l', 'rv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()
}

async function _deleteLicenceAgreements () {
  await db
    .from('water.licenceAgreements as la')
    .innerJoin('water.licences as l', 'la.licenceRef', 'l.licenceRef')
    .where('l.isTest', true)
    .del()

  await _deleteTestData('water.licenceAgreements')
}

async function _deleteTestData (tableName) {
  await db
    .from(tableName)
    .where('isTest', true)
    .del()
}

module.exports = {
  go
}
