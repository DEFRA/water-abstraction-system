/**
 * Fetches the bill licence and associated bill needed for removing a bill licence from a bill run
 * @module FetchBillLicenceDal
 */

import BillLicenceModel from 'water-abstraction-engine/models/bill-licence.model.js'

/**
 * Fetches the bill licence and associated bill needed for removing a bill licence from a bill run
 *
 * @param {string} billLicenceId - UUID of the bill licence to be removed
 *
 * @returns {Promise<object>} the matching instance of BillLicenceModel plus the linked bill
 */
export default async function fetchBillLicenceDal(billLicenceId) {
  return BillLicenceModel.query()
    .findById(billLicenceId)
    .select(['id', 'licenceId'])
    .withGraphFetched('bill')
    .modifyGraph('bill', (builder) => {
      builder.select(['id', 'billRunId'])
    })
}
