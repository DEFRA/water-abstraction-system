/**
 * Formats a `BillRunModel` into the metadata content needed for a bill run's 'event' record
 * @module CreateBillRunEventPresenter
 */

/**
 * Formats a `BillRunModel` into the metadata content needed for a bill run's 'event' record
 *
 * @param {module:BillRunModel} billRun - the bill run to format
 *
 * @returns {object} - the formatted content
 */
export default function createBillRunEventPresenter(billRun) {
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
      creditNoteCount,
      creditNoteValue,
      dateCreated: createdAt,
      dateUpdated: updatedAt,
      endYear: { yearEnding: toFinancialYearEnding },
      id,
      invoiceCount,
      invoices: [],
      invoiceValue,
      netTotal,
      region: {
        code: region.chargeRegionId,
        displayName: region.displayName,
        id: region.id,
        name: region.name,
        numericCode: region.naldRegionId,
        type: 'region'
      },
      source,
      startYear: { yearEnding: fromFinancialYearEnding },
      status,
      summer,
      type: batchType
    }
  }
}
