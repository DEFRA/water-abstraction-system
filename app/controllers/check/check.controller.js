'use strict'

/**
 * Controller for /check endpoints
 * @module CheckController
 */

const Boom = require('@hapi/boom')

const CheckTwoPartService = require('../../services/check/two-part.service.js')

async function twoPart (request, h) {
  try {
    const result = await CheckTwoPartService.go(request.params.naldRegionId, request.params.format)

    return h.response(result).code(200)
  } catch (error) {
    return Boom.badImplementation(error.message)
  }
}

module.exports = {
  twoPart
}
