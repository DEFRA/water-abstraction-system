'use strict'

/**
 * Formats a `BillingBatchModel` into the metadata content needed for a bill batch's 'event' record
 * @module CreateBillingBatchEventPresenter
 */

function go (billingBatch) {
  const {
    batchType,
    billingBatchId,
    creditNoteCount,
    creditNoteValue,
    createdAt,
    updatedAt,
    fromFinancialYearEnding,
    invoiceCount,
    invoiceValue,
    isSummer,
    netTotal,
    region,
    source,
    status,
    toFinancialYearEnding
  } = billingBatch
  return {
    batch: {
      id: billingBatchId,
      type: batchType,
      region: {
        id: region.regionId,
        code: region.chargeRegionId,
        name: region.name,
        type: 'region',
        displayName: region.displayName,
        numericCode: region.naldRegionId
      },
      source,
      status,
      endYear: { yearEnding: toFinancialYearEnding },
      invoices: [],
      isSummer,
      netTotal,
      startYear: { yearEnding: fromFinancialYearEnding },
      dateCreated: createdAt,
      dateUpdated: updatedAt,
      invoiceCount,
      invoiceValue,
      creditNoteCount,
      creditNoteValue
    }
  }
}

module.exports = {
  go
}
