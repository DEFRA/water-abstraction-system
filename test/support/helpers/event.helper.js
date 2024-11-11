'use strict'

/**
 * @module EventHelper
 */

const EventModel = require('../../../app/models/event.model.js')
const { generateUUID, timestampForPostgres } = require('../../../app/lib/general.lib.js')

/**
 * Add a new event
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `type` - billing-batch
 * - `subtype` - supplementary
 * - `issuer` - test.user@defra.gov.uk
 * - `metadata` - batch: {
                    id: [random UUID],
                    type: 'supplementary',
                    region: {
                      id: [random UUID]
                    },
                    scheme: 'sroc'
                  }
                }
 * - `status` - start
 * - `createdAt` - current Date and time as an ISO string
 * - `updatedAt` - current Date and time as an ISO string
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:EventModel>} The instance of the newly created record
 */
function add(data = {}) {
  const insertData = defaults(data)

  return EventModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {object} - Returns the set defaults with the override data spread
 */
function defaults(data = {}) {
  const timestamp = timestampForPostgres()

  const defaults = {
    type: 'billing-batch',
    subtype: 'supplementary',
    issuer: 'test.user@defra.gov.uk',
    metadata: {
      batch: {
        id: generateUUID(),
        type: 'supplementary',
        region: {
          id: generateUUID()
        },
        scheme: 'sroc'
      }
    },
    status: 'start',
    createdAt: timestamp,
    updatedAt: timestamp
  }

  return {
    ...defaults,
    ...data
  }
}

module.exports = {
  add,
  defaults
}
