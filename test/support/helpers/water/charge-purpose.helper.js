'use strict'

/**
 * @module ChargePurposeHelper
 */

const ChargePurposeModel = require('../../../../app/models/water/charge-purpose.model.js')

/**
 * Add a new charge purpose
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `chargeElementId` - 090f42a0-7718-453e-bc6a-d57ef8d65417
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
 * - `purposePrimaryId` - 383ab43e-6d0b-4be0-b5d2-4226f333f1d7
 * - `purposeSecondaryId` - 0e92d79a-f17f-4364-955f-443360ebddb2
 * - `purposeUseId` - cc9f412c-22c6-483a-93b0-b955a3a644dc
 * - `isSection127AgreementEnabled` - true
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:ChargePurposeModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ChargePurposeModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used when creating a new charge purpose
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    chargeElementId: '090f42a0-7718-453e-bc6a-d57ef8d65417',
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 4,
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 3,
    authorisedAnnualQuantity: 200,
    loss: 'low',
    factorsOverridden: true,
    billableAnnualQuantity: 4.55,
    timeLimitedStartDate: '2022-04-01',
    timeLimitedEndDate: '2030-03-30',
    description: 'Trickle Irrigation - Direct',
    purposePrimaryId: '383ab43e-6d0b-4be0-b5d2-4226f333f1d7',
    purposeSecondaryId: '0e92d79a-f17f-4364-955f-443360ebddb2',
    purposeUseId: 'cc9f412c-22c6-483a-93b0-b955a3a644dc',
    isSection127AgreementEnabled: true
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
