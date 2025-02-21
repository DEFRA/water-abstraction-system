'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const ViewReturnSubmissionService = require('../../app/services/return-submissions/view-return-submission.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Return Submissions controller', () => {
  let options
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(() => {
    // We silence any calls to server.logger.error and info to try and keep the test output as clean as possible
    Sinon.stub(server.logger, 'error')
    Sinon.stub(server.logger, 'info')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('/system/return-submissions/{yearMonth}/{returnSubmissionId}', () => {
    describe('GET', () => {
      beforeEach(() => {
        Sinon.stub(ViewReturnSubmissionService, 'go').resolves({
          pageTitle: 'Return Submission'
        })

        options = {
          method: 'GET',
          url: '/return-submissions/d1f4826a-a8b1-479a-ac25-07b491ebcddd/2025-02',
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Return Submission')
        })

        it('passes the parameters to the service', async () => {
          await server.inject(options)

          const calls = ViewReturnSubmissionService.go.firstCall
          expect(calls.args).to.contain('d1f4826a-a8b1-479a-ac25-07b491ebcddd')
          expect(calls.args).to.contain('2025-02')
        })
      })
    })
  })
})
