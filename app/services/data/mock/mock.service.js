'use strict'

/**
 * Generates mock data for prototype and test use
 * @module MockService
 */

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
    // TODO: better error
    throw Error('Nothing')
  }

  // Validate that the provided type is supported
  if (!Object.keys(types).includes(type)) {
    // TODO: better error
    throw Error('Dunno')
  }
}

function _billRun (id) {
  return { billRun: id }
}

module.exports = {
  go
}
