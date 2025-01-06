'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const ConfirmationService = require('../../app/services/return-logs/setup/confirmation.service.js')
const InitiateSessionService = require('../../app/services/return-logs/setup/initiate-session.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Return Logs Setup controller', () => {
  let options
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('return-logs/setup', () => {
    describe('GET', () => {
      const session = { id: 'e0c77b74-7326-493d-be5e-0d1ad41594b5', data: {} }

      beforeEach(async () => {
        options = {
          method: 'GET',
          url: '/return-logs/setup?returnLogId=v1:1:123:10021668:2022-04-01:2023-03-31',
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(InitiateSessionService, 'go').resolves(session)
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/return-logs/setup/${session.id}/how-to-edit`)
        })
      })
    })
  })

  describe.only('return-logs/setup/{sessionId}/confirmation', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = {
          method: 'GET',
          url: '/return-logs/setup/e0c77b74-7326-493d-be5e-0d1ad41594b5/confirmation',
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(ConfirmationService, 'go').resolves({
            sessionId: 'e0c77b74-7326-493d-be5e-0d1ad41594b5',
            returnLog: {
              returnLogId: 'v1:1:01/01:10046821:2020-01-02:2020-02-01',
              purpose: 'Test Purpose',
              siteDescription: 'Test Site Description',
              licenceReference: '01/01'
            },
            licenceId: '3154ea03-e232-4c66-a711-a72956b7de61',
            pageTitle: 'Query recorded'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Query recorded')
        })
      })
    })
  })
})
