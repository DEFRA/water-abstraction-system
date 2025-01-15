'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const InitiateSessionService = require('../../app/services/return-logs/setup/initiate-session.service.js')
const ReceivedService = require('../../app/services/return-logs/setup/received.service.js')
const ReportedService = require('../../app/services/return-logs/setup/reported.service.js')
const StartService = require('../../app/services/return-logs/setup/start.service.js')
const SubmitReceivedService = require('../../app/services/return-logs/setup/submit-received.service.js')
const SubmitStartService = require('../../app/services/return-logs/setup/submit-start.service.js')
const SubmitReportedService = require('../../app/services/return-logs/setup/submit-reported.service.js')
const SubmitUnitsService = require('../../app/services/return-logs/setup/submit-units.service.js')
const UnitsService = require('../../app/services/return-logs/setup/units.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Return Logs Setup controller', () => {
  let options
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(() => {
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

      beforeEach(() => {
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
        beforeEach(() => {
          Sinon.stub(InitiateSessionService, 'go').resolves(session)
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/return-logs/setup/${session.id}/start`)
        })
      })
    })
  })

  describe('/return-logs/setup/{sessionId}/start', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: '/return-logs/setup/e0c77b74-7326-493d-be5e-0d1ad41594b5/start',
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(StartService, 'go').resolves({ pageTitle: 'Abstraction return' })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Abstraction return')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          options = _postOptions('start', { journey: 'selectedOption' })
        })

        describe('and an option is selected', () => {
          beforeEach(() => {
            Sinon.stub(SubmitStartService, 'go').resolves({})
          })

          it('redirects to the "received" page', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(
              '/system/return-logs/setup/e0c77b74-7326-493d-be5e-0d1ad41594b5/received'
            )
          })
        })
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          options = _postOptions('start', {})
        })

        describe('and the validation fails as no option has been selected', () => {
          beforeEach(() => {
            Sinon.stub(SubmitStartService, 'go').resolves({
              pageTitle: 'Abstraction return',
              error: { text: 'Select what you want to do with this return' }
            })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Select what you want to do with this return')
            expect(response.payload).to.contain('Abstraction return')
          })
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/received', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: '/return-logs/setup/e0c77b74-7326-493d-be5e-0d1ad41594b5/received',
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(ReceivedService, 'go').resolves({
            sessionId: 'e0c77b74-7326-493d-be5e-0d1ad41594b5',
            licenceId: '3154ea03-e232-4c66-a711-a72956b7de61',
            pageTitle: 'When was the return received?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('When was the return received?')
        })
      })
    })

    describe('POST', () => {
      describe('when a request is valid', () => {
        beforeEach(() => {
          options = _postOptions('received', {})
        })

        describe('and the received date is entered', () => {
          beforeEach(() => {
            Sinon.stub(SubmitReceivedService, 'go').resolves({})
          })

          it('redirects to the "reported" page', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(
              '/system/return-logs/setup/e0c77b74-7326-493d-be5e-0d1ad41594b5/reported'
            )
          })
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(() => {
          options = _postOptions('received')

          Sinon.stub(SubmitReceivedService, 'go').resolves({
            error: { message: 'Enter a real received date' },
            pageTitle: 'When was the return received?',
            sessionId: 'e0c77b74-7326-493d-be5e-0d1ad41594b5'
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Enter a real received date')
          expect(response.payload).to.contain('There is a problem')
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/reported', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: '/return-logs/setup/e0c77b74-7326-493d-be5e-0d1ad41594b5/reported',
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(ReportedService, 'go').resolves({
            sessionId: 'e0c77b74-7326-493d-be5e-0d1ad41594b5',
            licenceId: '3154ea03-e232-4c66-a711-a72956b7de61',
            pageTitle: 'How was this return reported?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('How was this return reported?')
        })
      })
    })

    describe('POST', () => {
      describe('when a request is valid', () => {
        beforeEach(() => {
          options = _postOptions('reported', {})
        })

        describe('and the reported type is entered', () => {
          beforeEach(() => {
            Sinon.stub(SubmitReportedService, 'go').resolves({})
          })

          it('redirects to the "units" page', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(
              '/system/return-logs/setup/e0c77b74-7326-493d-be5e-0d1ad41594b5/units'
            )
          })
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(() => {
          options = _postOptions('reported')

          Sinon.stub(SubmitReportedService, 'go').resolves({
            error: { text: 'Select how this return was reported' },
            pageTitle: 'How was this return reported?',
            sessionId: 'e0c77b74-7326-493d-be5e-0d1ad41594b5'
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select how this return was reported')
          expect(response.payload).to.contain('There is a problem')
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/units', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: '/return-logs/setup/e0c77b74-7326-493d-be5e-0d1ad41594b5/units',
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(UnitsService, 'go').resolves({
            sessionId: 'e0c77b74-7326-493d-be5e-0d1ad41594b5',
            licenceId: '3154ea03-e232-4c66-a711-a72956b7de61',
            pageTitle: 'Which units were used?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Which units were used?')
        })
      })
    })

    describe('POST', () => {
      describe('when a request is valid', () => {
        beforeEach(() => {
          options = _postOptions('units', {})
        })

        describe('and the unit type is entered', () => {
          beforeEach(() => {
            Sinon.stub(SubmitUnitsService, 'go').resolves({})
          })

          it('redirects to the "meter provided" page', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(
              '/system/return-logs/setup/e0c77b74-7326-493d-be5e-0d1ad41594b5/meter-provided'
            )
          })
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(() => {
          options = _postOptions('units')

          Sinon.stub(SubmitUnitsService, 'go').resolves({
            error: { text: 'Select which units were used' },
            pageTitle: 'Which units were used?',
            sessionId: 'e0c77b74-7326-493d-be5e-0d1ad41594b5'
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select which units were used')
          expect(response.payload).to.contain('There is a problem')
        })
      })
    })
  })
})

function _postOptions(path, payload) {
  return postRequestOptions(`/return-logs/setup/e0c77b74-7326-493d-be5e-0d1ad41594b5/${path}`, payload)
}
