/**
 * Fetches the bill data used when removing a bill from a bill run
 * @module FetchBillDal
 */

import BillModel from 'water-abstraction-engine/models/bill.model.js'

/**
 * Fetches the bill data used when removing a bill from a bill run
 *
 * @param {string} billId - The UUID for the bill to fetch
 *
 * @returns {Promise<module:BillModel[]>} the matching instance of BillModel including the associated licence IDs
 */
export default async function fetchBillDal(billId) {
  return BillModel.query()
    .findById(billId)
    .select(['id', 'billRunId'])
    .withGraphFetched('billLicences')
    .modifyGraph('billLicences', (billLicencesBuilder) => {
      billLicencesBuilder.select(['id', 'licenceId'])
    })
}
