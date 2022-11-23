'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')

// Things we need to stub
const FindRegionService = require('../../../app/services/supplementary-billing/find-region.service.js')
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

  describe('GET /test/supplementary', () => {
    const options = {
      method: 'GET',
      url: '/test/supplementary?region=9'
    }

    let response

    beforeEach(async () => {
      Sinon.stub(FindRegionService, 'go').resolves({ regionId: LicenceHelper.defaults().region_id })
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
