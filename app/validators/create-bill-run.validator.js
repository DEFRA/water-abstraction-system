'use strict'

/**
 * @module CreateBillRunValidator
 */

const Joi = require('joi')

const StaticLookupsLib = require('../lib/static-lookups.lib.js')

/**
 * Checks that the payload of a `create bill run` request is valid
*/
function go (data) {
  const schema = Joi.object({
    type: Joi.string().valid(...StaticLookupsLib.billRunTypes).required(),
    scheme: Joi.string().valid('sroc').required(),
    region: Joi.string().guid().required(),
    user: Joi.string().email().required(),
    previousBillRunId: Joi.string().guid().optional(),
    financialYear: Joi.number().integer().optional()
  })

  return schema.validate(data)
}

module.exports = {
  go
}
