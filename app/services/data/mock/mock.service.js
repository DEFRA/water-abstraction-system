'use strict'

/**
 * Generates mock data for prototype and test use
 * @module MockService
 */

const ExpandedError = require('../../../errors/expanded.error.js')
const GenerateBillRunService = require('./generate-bill-run.service.js')

const types = {
  'bill-run': _billRun
}

async function go (type, id) {
  _validateParams(type, id)

  return types[type](id)
}

function _validateParams (type, id) {
  // Validate that a type and id have been provided
  if (!type || !id) {
    throw new ExpandedError('Both type and ID are required for the mocking', { type, id })
  }

  // Validate that the provided type is supported
  if (!Object.keys(types).includes(type)) {
    throw new ExpandedError('Mocking is not supported for this type', { type, id })
  }
}

async function _billRun (id) {
  return GenerateBillRunService.go(id)
}

module.exports = {
  go
}
