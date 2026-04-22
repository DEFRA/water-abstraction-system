'use strict'

/**
 * Generates the SQL query for expired licences
 * @module GenerateExpiredLicencesQueryService
 */

/**
 * Generates the SQL query for expired licences
 *
 * An expired licence is one that has expired (on the provided date)
 *
 * @returns {string} the SQL query for expired licences
 */
function go() {
  return `
    SELECT
      l.licence_ref
    FROM
      public.licences l
    WHERE
      l.expired_date = ?
      AND (
        l.lapsed_date IS NULL OR l.lapsed_date > l.expired_date
      )
      AND (
        l.revoked_date IS NULL OR l.revoked_date > l.expired_date
      )
  `
}

module.exports = {
  go
}
