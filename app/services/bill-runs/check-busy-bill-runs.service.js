'use strict'

/**
 * Check if any bill runs are being processed or cancelled
 * @module CheckBusyBillRunsService
 */

const { db } = require('../../../db/db.js')

/**
 * Check if any bill runs are busy building or cancelling
 *
 * A bill run is 'cancelling' if its status is `cancel`. A bill run is 'building' if its status is `processing`,
 * `queued`, or `sending`.
 *
 * @returns {Promise<string>} the state of busy bill runs; 'cancelling', 'building', 'both', or 'none'
 */
async function go() {
  const { building, cancelling } = await _fetch()

  if (building && cancelling) {
    return 'both'
  }

  if (building) {
    return 'building'
  }

  if (cancelling) {
    return 'cancelling'
  }

  return 'none'
}

async function _fetch() {
  const results = await db.select(
    db.raw("EXISTS(SELECT 1 FROM public.bill_runs bb WHERE bb.status = 'cancel') AS cancelling"),
    db.raw(
      "EXISTS(SELECT 1 FROM public.bill_runs bb WHERE bb.status IN ('processing', 'queued', 'sending')) AS building"
    )
  )

  return results[0]
}

module.exports = {
  go
}
