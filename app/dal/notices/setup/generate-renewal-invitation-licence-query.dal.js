/**
 * Generates the query and bindings to select a single licence ref for use in renewal invitation recipient queries
 * @module GenerateRenewalInvitationLicenceQueryDal
 */

/**
 * Generates the query and bindings to select a single licence ref for use in renewal invitation recipient queries
 *
 * Returns the query fragment and its binding used as the `expiring_licences` CTE when building the renewal invitation
 * recipients query for the adhoc journey.
 *
 * @param {string} licenceRef - The licence reference to fetch recipients for
 *
 * @returns {object} An object containing the SQL `query` string and its `bindings`
 */
function go(licenceRef) {
  return {
    bindings: [licenceRef],
    query: `SELECT l.licence_ref FROM public.licences l WHERE l.licence_ref = ?`
  }
}

export {
  go
}
export default {
  go
}
