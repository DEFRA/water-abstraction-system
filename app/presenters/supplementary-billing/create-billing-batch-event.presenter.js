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
    dateCreated,
    createdAt,
    dateUpdated,
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
      // NOTE: In the 'real' schema timestamp fields are dateCreated & dateUpdated. If you follow the standard
      // convention of using a trigger as seen in db/migrations/[*]_create_update_timestamp_trigger.js you get
      // createdAt & updatedAt. In our testing schema we use the later. To ensure unit tests pass we need to account
      // for both.
      dateCreated: dateCreated ?? createdAt,
      dateUpdated: dateUpdated ?? updatedAt,
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
