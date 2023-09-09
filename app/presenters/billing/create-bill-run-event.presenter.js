'use strict'

/**
 * Formats a `BillRunModel` into the metadata content needed for a bill run's 'event' record
 * @module CreateBillRunEventPresenter
 */

function go (billRun) {
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
  } = billRun
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
