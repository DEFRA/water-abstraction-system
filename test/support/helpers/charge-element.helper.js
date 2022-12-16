'use strict'

/**
 * @module ChargeElementHelper
 */

const { db } = require('../../../db/db.js')

/**
 * Add a new charge element
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `charge_version_id` - b033e8d1-3ad4-4782-930b-c1e10cb9110e
 * - `source` - non-tidal
 * - `loss` - low
 * - `description` - Mineral washing
 * - `is_section_127_agreement_enabled` - true
 * - `scheme` - sroc
 * - `is_restricted_source` - true
 * - `water_model` - no model
 * - `volume` - 6.819
 * - `billing_charge_category_id` - cd9ca44d-2ddb-4d5d-ac62-79883176bdec
 * - `additional_charges` - { isSupplyPublicWater: true }
 * - `adjustments` - { s126: null, s127: false, s130: false, charge: null, winter: false, aggregate: 0.562114443 }
 * - `eiuc_region` - Anglian
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {string} The ID of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  const result = await db.table('water.charge_elements')
    .insert(insertData)
    .returning('charge_element_id')

  return result
}

/**
 * Returns the defaults used when creating a new charge element
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    charge_version_id: 'b033e8d1-3ad4-4782-930b-c1e10cb9110e',
    source: 'non-tidal',
    loss: 'low',
    description: 'Mineral washing',
    is_section_127_agreement_enabled: true,
    scheme: 'sroc',
    is_restricted_source: true,
    water_model: 'no model',
    volume: 6.819,
    billing_charge_category_id: 'cd9ca44d-2ddb-4d5d-ac62-79883176bdec',
    additional_charges: { isSupplyPublicWater: true },
    adjustments: { s126: null, s127: false, s130: false, charge: null, winter: false, aggregate: 0.562114443 },
    eiuc_region: 'Anglian'
  }

  return {
    ...defaults,
    ...data
  }
}

module.exports = {
  add
}
