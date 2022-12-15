'use strict'

/**
 * @module CreateBillRunValidator
 */

const Joi = require('joi')

/**
 * Checks that the payload of a `create bill run` request is valid
*/
function go (data) {
  const schema = Joi.object({
    type: Joi.string().valid('supplementary').required(),
    scheme: Joi.string().valid('sroc').required(),
    region: Joi.string().guid().required(),
    previousBillRunId: Joi.string().guid().optional()
  })

  return schema.validate(data)
}

module.exports = {
  go
}
