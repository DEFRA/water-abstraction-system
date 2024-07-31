'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const LegacyImportLicenceService = require('../../app/services/import/legacy-licence.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Import controller', () => {
  let options
  let server

  beforeEach(async () => {
    // Create server before each test
    server = await init()

    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('/import/licence', () => {
    describe('POST /import/licence', () => {
      beforeEach(async () => {
        options = {
          method: 'POST',
          url: '/import/licence',
          payload: {
            licenceRef: 'mock-licence-ref'
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(LegacyImportLicenceService, 'go').resolves()
        })

        it('redirects to select return start date page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(204)
        })
      })
    })
  })
})
