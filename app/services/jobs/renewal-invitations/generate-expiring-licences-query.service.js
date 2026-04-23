'use strict'

/**
 * Generates the SQL query for expiring licences
 * @module GenerateExpiringLicencesQueryService
 */

/**
 * Generates the SQL query for expiring licences
 *
 * An expiring licence is one that will expire on the provided date, and is not already lapsed or revoked.
 *
 * @param {Date} expiredDate - The date to check for expiring licences against
 *
 * @returns {object} The query to use as the 'expiring_licences` CTE in the recipients query, and the associated
 * bindings
 */
function go(expiredDate) {
  const bindings = [expiredDate]

  return {
    bindings,
    query: _query()
  }
}

function _query() {
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
