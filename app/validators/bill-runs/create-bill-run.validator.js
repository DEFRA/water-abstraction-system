'use strict'

/**
 * @module CreateBillRunValidator
 */

const Joi = require('joi')

/**
 * Checks that the payload of a `create bill run` request is valid
*/
async function go (data) {
  const schema = Joi.object({
    type: Joi.string().valid('supplementary').required(),
    scheme: Joi.string().valid('sroc').required(),
    previousBillRunId: Joi.string().guid().optional()
  })

  return schema.validateAsync(data)
}

module.exports = {
  go
}
