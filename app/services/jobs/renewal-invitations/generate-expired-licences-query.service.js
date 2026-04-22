'use strict'

/**
 * Generates the SQL query expired licences
 * @module GenerateExpiredLicencesQueryService
 */

/**
 * Generates the SQL query expired licences
 *
 */
function go() {
  // cte licences = revoked, expired or lapsed <= (no on expiry date) - and have as the expiry
  return `
    SELECT l.licence_ref
    FROM public.licences l
    WHERE l.expired_date = ?
  `
}

module.exports = {
  go
}
