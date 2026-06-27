'use strict'

const { HTTP_STATUS_OK } = require('node:http2').constants

// Test framework dependencies
const Sinon = require('sinon')

// Things we need to stub
const ViewReturnSubmissionService = require('../../app/services/return-submissions/view-return-submission.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Return Submissions controller', () => {
  let options
  let server

  // Create server before running the tests
  beforeAll(async () => {
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

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Return Submission')
        })

        it('passes the parameters to the service', async () => {
          await server.inject(options)

          const calls = ViewReturnSubmissionService.go.firstCall
          expect(calls.args).toContain('d1f4826a-a8b1-479a-ac25-07b491ebcddd')
          expect(calls.args).toContain('2025-02')
        })
      })
    })
  })
})
