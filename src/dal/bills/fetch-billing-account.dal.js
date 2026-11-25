/**
 * Fetches the matching billing account record
 * @module FetchBillingAccountDal
 */

import BillingAccountModel from 'water-abstraction-engine/models/billing-account.model.js'

/**
 * Fetches the matching billing account record
 *
 * @param {string} billingAccountId - The UUID for the billing account to fetch
 *
 * @returns {Promise<module:BillingAccountModel>} the matching instance of BillingAccountModel
 */
export default async function fetchBillingAccountDal(billingAccountId) {
  return BillingAccountModel.query().findById(billingAccountId).modify('contactDetails')
}
