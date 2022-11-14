'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FindRegionService = require('../../../app/services/test/find_region.service')
const SupplementaryService = require('../../../app/services/test/supplementary.service.js')

// For running our service
const { init } = require('../../../app/server')

describe('Supplementary controller', () => {
  let server

  beforeEach(async () => {
    server = await init()
  })

  after(() => {
    Sinon.restore()
  })

  describe('GET /test/supplementary', () => {
    const options = {
      method: 'GET',
      url: '/test/supplementary?region=9'
    }

    let response

    beforeEach(async () => {
      Sinon.stub(FindRegionService, 'go').resolves({ regionId: 'bd114474-790f-4470-8ba4-7b0cc9c225d7' })
      Sinon.stub(SupplementaryService, 'go').resolves({ chargeVersions: [] })

      response = await server.inject(options)
    })

    describe('when the request is valid', () => {
      it('returns success status 200', async () => {
        expect(response.statusCode).to.equal(200)
      })
    })
  })
})
