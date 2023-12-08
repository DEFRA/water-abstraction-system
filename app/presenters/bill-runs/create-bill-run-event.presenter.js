'use strict'

/**
 * Formats a `BillRunModel` into the metadata content needed for a bill run's 'event' record
 * @module CreateBillRunEventPresenter
 */

function go (billRun) {
  const {
    batchType,
    creditNoteCount,
    creditNoteValue,
    createdAt,
    updatedAt,
    fromFinancialYearEnding,
    id,
    invoiceCount,
    invoiceValue,
    summer,
    netTotal,
    region,
    source,
    status,
    toFinancialYearEnding
  } = billRun
  return {
    batch: {
      id,
      type: batchType,
      region: {
        id: region.id,
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
      isSummer: summer,
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
