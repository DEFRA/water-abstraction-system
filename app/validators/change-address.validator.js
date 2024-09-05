'use strict'

/**
 * @module ChangeAddressValidator
 */

const Joi = require('joi')

const StaticLookupsLib = require('../lib/static-lookups.lib.js')

/**
 * Checks that the payload of a `/billing-accounts/{billingAccountId}/address` request is valid
 *
 * The JOI schema was interpreted from what we found in water-abstraction-service/src/modules/invoice-accounts/routes.js
 *
 * @param {object} data - The data to be validated (assumed to be the request payload)
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
*/
function go (data) {
  const schema = Joi.object({
    address: _addressSchema(),
    agentCompany: _agentCompanySchema(),
    contact: _contactSchema()
  })

  return schema.validate(data)
}

function _addressSchema () {
  return Joi.object({
    id: Joi.string().guid().optional(),
    addressLine1: Joi.string().optional(),
    addressLine2: Joi.string().optional(),
    addressLine3: Joi.string().optional(),
    addressLine4: Joi.string().optional(),
    town: Joi.string().optional(),
    county: Joi.string().optional(),
    country: Joi.string().optional(),
    postcode: Joi.string().optional(),
    uprn: Joi.number().optional(),
    source: Joi.string().optional()
  }).required()
}

function _agentCompanySchema () {
  return Joi.object({
    id: Joi.string().guid().optional(),
    type: Joi.string().valid(...StaticLookupsLib.companyTypes).optional(),
    organisationType: Joi.string().valid(...StaticLookupsLib.organisationTypes).optional(),
    name: Joi.string().optional(),
    companyNumber: Joi.string().optional()
  }).optional()
}

function _contactSchema () {
  return Joi.object({
    id: Joi.string().guid().optional(),
    type: Joi.string().valid(...StaticLookupsLib.contactTypes).optional(),
    salutation: Joi.string().optional(),
    firstName: Joi.string().optional(),
    initials: Joi.string().optional(),
    middleInitials: Joi.string().optional(),
    lastName: Joi.string().optional(),
    suffix: Joi.string().optional(),
    department: Joi.string().optional(),
    source: Joi.string().valid(...StaticLookupsLib.sources).optional(),
    isTest: Joi.boolean().default(false).optional()
  }).optional()
}

module.exports = {
  go
}
