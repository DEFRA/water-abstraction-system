/**
 * Generates the query and bindings to select a single licence ref for use in renewal notice recipient queries
 * @module GenerateRenewalNoticeLicenceQueryDal
 */

/**
 * Generates the query and bindings to select a single licence ref for use in renewal notice recipient queries
 *
 * Returns the query fragment and its binding used as the `expiring_licences` CTE when building the renewal notice
 * recipients query for the adhoc journey.
 *
 * @param {string} licenceRef - The licence reference to fetch recipients for
 *
 * @returns {object} An object containing the SQL `query` string and its `bindings`
 */
export default function generateRenewalNoticeLicenceQueryDal(licenceRef) {
  return {
    bindings: [licenceRef],
    query: `SELECT l.licence_ref FROM public.licences l WHERE l.licence_ref = ?`
  }
}
