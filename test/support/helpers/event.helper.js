'use strict'

/**
 * @module EventHelper
 */

const { db } = require('../../../db/db.js')

/**
 * Add a new event
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `type` - billing-batch
 * - `subtype` - supplementary
 * - `issuer` - test.user@defra.gov.uk
 * - `metadata` - batch: {
                    id: '744c307f-904f-43c4-9458-24f062381d02',
                    type: 'supplementary',
                    region: {
                      id: 'bd114474-790f-4470-8ba4-7b0cc9c225d7'
                    },
                    scheme: 'sroc'
                  }
                }
 * - `status` - start
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {string} The newly created event record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  const result = await db.table('water.events')
    .insert(insertData)
    .returning('*')

  return result
}

/**
 * Returns the defaults used when creating a new event
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    type: 'billing-batch',
    subtype: 'supplementary',
    issuer: 'test.user@defra.gov.uk',
    metadata: {
      batch: {
        id: '744c307f-904f-43c4-9458-24f062381d02',
        type: 'supplementary',
        region: {
          id: 'bd114474-790f-4470-8ba4-7b0cc9c225d7'
        },
        scheme: 'sroc'
      }
    },
    status: 'start'
  }

  return {
    ...defaults,
    ...data
  }
}

module.exports = {
  add
}
