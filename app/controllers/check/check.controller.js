'use strict'

/**
 * Controller for /check endpoints
 * @module CheckController
 */

const Boom = require('@hapi/boom')

const TwoPartService = require('../../services/check/two-part.service.js')

async function twoPart (request, h) {
  try {
    const result = await TwoPartService.go(request.params.naldRegionId)

    return h.response(result).code(200)
  } catch (error) {
    return Boom.badImplementation(error.message)
  }
}

module.exports = {
  twoPart
}
