'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const SupplementaryService = require('../../../app/services/supplementary-billing/supplementary.service.js')

// For running our service
const { init } = require('../../../app/server.js')

describe('Supplementary controller', () => {
  let server

  beforeEach(async () => {
    server = await init()
  })

  after(() => {
    Sinon.restore()
  })

  describe('GET /check/supplementary', () => {
    const options = {
      method: 'GET',
      url: '/check/supplementary?region=9'
    }

    let response

    beforeEach(async () => {
      Sinon.stub(SupplementaryService, 'go').resolves({ billingPeriods: [], licences: [], chargeVersions: [] })

      response = await server.inject(options)
    })

    describe('when the request is valid', () => {
      it('returns success status 200', async () => {
        expect(response.statusCode).to.equal(200)
      })
    })
  })
})
