'use strict'

/**
 * Fetches all return logs for a licence which is needed for the view '/licences/{id}/contact-details` page
 * @module FetchCustomerContactDetailsService
 */

/**
 * Fetches all contact details for a licence which is needed for the view '/licences/{id}/contact-details` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page's contact details tab
 */
async function go (licenceId) {
  return _fetch(licenceId)
}

async function _fetch (licenceId) {
  // select documents.* from crm_v2.documents
  //   join crm_v2.document_roles document_roles on document_roles.document_id = documents.document_id
  //   WHERE (document_roles.end_date is null or document_roles.end_date > NOW())
  //   AND document_roles.company_id IN (SELECT DISTINCT company_id FROM crm_v2.company_contacts)
  return {}
}

module.exports = {
  go
}
