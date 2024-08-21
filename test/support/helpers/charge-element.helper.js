'use strict'

/**
 * @module ChargeElementHelper
 */

const ChargeElementModel = require('../../../app/models/charge-element.model.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

/**
 * Add a new charge element
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `chargeReferenceId` - [random UUID]
 * - `abstractionPeriodStartDay` - 1
 * - `abstractionPeriodStartMonth` - 4
 * - `abstractionPeriodEndDay` - 31
 * - `abstractionPeriodEndMonth` - 3
 * - `authorisedAnnualQuantity` - 200
 * - `loss` - low
 * - `factorsOverridden` - true
 * - `billableAnnualQuantity` - 4.55
 * - `timeLimitedStartDate` - 2022-04-01
 * - `timeLimitedEndDate` - 2030-03-30
 * - `description` - Trickle Irrigation - Direct
 * - `purposePrimaryId` - [random UUID]
 * - `purposeSecondaryId` - [random UUID]
 * - `purposeId` - [random UUID]
 * - `section127Agreement` - true
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ChargeElementModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ChargeElementModel.query()
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
function defaults (data = {}) {
  const defaults = {
    chargeReferenceId: generateUUID(),
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 4,
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 3,
    authorisedAnnualQuantity: 200,
    loss: 'low',
    factorsOverridden: true,
    billableAnnualQuantity: 4.55,
    timeLimitedStartDate: new Date('2022-04-01'),
    timeLimitedEndDate: new Date('2030-03-30'),
    description: 'Trickle Irrigation - Direct',
    purposePrimaryId: generateUUID(),
    purposeSecondaryId: generateUUID(),
    purposeId: generateUUID(),
    section127Agreement: true
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
