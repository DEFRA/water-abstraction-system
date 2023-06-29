'use strict'

/**
 * Dummy service to stand in for the actual ReissueInvoicesService prior to it being approved and merged
 * @module ReissueInvoicesService
 */

/**
 * Dummy service to stand in for the actual ReissueInvoicesService prior to it being approved and merged. Always returns
 * `false` so that it doesn't affect our "have changes been made to the db" checks.
 */
async function go () {
  return false
}

module.exports = {
  go
}
