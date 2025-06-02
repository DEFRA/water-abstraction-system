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
const InitiateSessionService = require('../../app/services/licence-monitoring-station/setup/initiate-session.service.js')
const LicenceNumberService = require('../../app/services/licence-monitoring-station/setup/licence-number.service.js')
const SubmitLicenceNumberService = require('../../app/services/licence-monitoring-station/setup/submit-licence-number.service.js')
const StopOrReduceService = require('../../app/services/licence-monitoring-station/setup/stop-or-reduce.service.js')
const ThresholdAndUnitService = require('../../app/services/licence-monitoring-station/setup/threshold-and-unit.service.js')
const SubmitStopOrReduceService = require('../../app/services/licence-monitoring-station/setup/submit-stop-or-reduce.service.js')
const SubmitThresholdAndUnitService = require('../../app/services/licence-monitoring-station/setup/submit-threshold-and-unit.service.js')

// For running our service
const { init } = require('../../app/server.js')

const sessionId = 'b0ebf12a-c238-4c48-9526-64513a8df935'

describe('Licence Monitoring Station - Setup - Controller', () => {
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

  describe('licence-monitoring-station/setup', () => {
    describe('POST', () => {
      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(InitiateSessionService, 'go').resolves('b0ebf12a-c238-4c48-9526-64513a8df935')
          options = postRequestOptions(
            `/licence-monitoring-station/setup`,
            {
              payload: { monitoringStationId: '3c59382a-df8a-4c1b-827d-f4a2d0d8b4f4' }
            },
            'manage_gauging_station_licence_links'
          )
        })

        it('redirects to the returned page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(
            `/system/licence-monitoring-station/setup/${sessionId}/threshold-and-unit`
          )
        })
      })
    })
  })

  describe('licence-monitoring-station/setup/{sessionId}/threshold-and-unit', () => {
    const path = 'threshold-and-unit'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(ThresholdAndUnitService, 'go').resolves({
            sessionId,
            monitoringStationLabel: 'Station Label',
            pageTitle: 'What is the licence hands-off flow or level threshold?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('What is the licence hands-off flow or level threshold?')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the page has not been visited previously', () => {
          beforeEach(() => {
            Sinon.stub(SubmitThresholdAndUnitService, 'go').resolves({})
          })

          it('redirects to the "stop-or-reduce" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(
              `/system/licence-monitoring-station/setup/${sessionId}/stop-or-reduce`
            )
          })
        })

        describe('and the page has been visited previously', () => {
          beforeEach(() => {
            Sinon.stub(SubmitThresholdAndUnitService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/licence-monitoring-station/setup/${sessionId}/check`)
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
            Sinon.stub(SubmitThresholdAndUnitService, 'go').resolves({
              error: {
                errorList: [{ href: '#threshold', text: 'Enter a threshold' }],
                threshold: { message: 'Enter a threshold' }
              },
              monitoringStationLabel: 'Station Label',
              pageTitle: 'What is the licence hands-off flow or level threshold?',
              sessionId
            })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Enter a threshold')
            expect(response.payload).to.contain('There is a problem')
          })
        })
      })
    })
  })

  describe('licence-monitoring-station/setup/{sessionId}/stop-or-reduce', () => {
    const path = 'stop-or-reduce'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(StopOrReduceService, 'go').resolves({
            sessionId,
            backLink: `/system/licence-monitoring-station/setup/${sessionId}/threshold-and-unit`,
            monitoringStationLabel: 'Station Label',
            pageTitle: 'Does the licence holder need to stop or reduce at this threshold?',
            reduceAtThreshold: null,
            stopOrReduce: null
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Does the licence holder need to stop or reduce at this threshold?')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the page has not been visited previously', () => {
          beforeEach(() => {
            Sinon.stub(SubmitStopOrReduceService, 'go').resolves({})
          })

          it('redirects to the "licence-number" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(
              `/system/licence-monitoring-station/setup/${sessionId}/licence-number`
            )
          })
        })

        describe('and the page has been visited previously', () => {
          beforeEach(() => {
            Sinon.stub(SubmitStopOrReduceService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/licence-monitoring-station/setup/${sessionId}/check`)
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
            Sinon.stub(SubmitStopOrReduceService, 'go').resolves({
              error: {
                message: 'Select if the licence holder needs to stop or reduce',
                reduceAtThresholdRadioElement: null,
                stopOrReduceRadioElement: { text: 'Select if the licence holder needs to stop or reduce' }
              },
              monitoringStationLabel: 'Station Label',
              pageTitle: 'Does the licence holder need to stop or reduce at this threshold?',
              sessionId,
              reduceAtThreshold: null,
              stopOrReduce: null
            })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Select if the licence holder needs to stop or reduce')
            expect(response.payload).to.contain('There is a problem')
          })
        })
      })
    })
  })

  describe('licence-monitoring-station/setup/{sessionId}/licence-number', () => {
    const path = 'licence-number'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(LicenceNumberService, 'go').resolves({
            backLink: `/system/licence-monitoring-station/setup/${sessionId}/stop-or-reduce`,
            monitoringStationLabel: 'Station Label',
            pageTitle: 'Enter the licence number this threshold applies to',
            activeNavBar: 'search'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Enter the licence number this threshold applies to')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the page has not been visited previously', () => {
          beforeEach(() => {
            Sinon.stub(SubmitLicenceNumberService, 'go').resolves({})
          })

          it('redirects to the "licence-number" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(
              `/system/licence-monitoring-station/setup/${sessionId}/full-condition`
            )
          })
        })

        describe('and the page has been visited previously', () => {
          beforeEach(() => {
            Sinon.stub(SubmitLicenceNumberService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/licence-monitoring-station/setup/${sessionId}/check`)
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
            Sinon.stub(SubmitLicenceNumberService, 'go').resolves({
              error: { text: 'Enter a valid licence number' },
              backLink: `/system/licence-monitoring-station/setup/${sessionId}/stop-or-reduce`,
              monitoringStationLabel: 'Station Label',
              pageTitle: 'Enter the licence number this threshold applies to',
              activeNavBar: 'search'
            })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Enter a valid licence number')
            expect(response.payload).to.contain('There is a problem')
          })
        })
      })
    })
  })
})

function _getOptions(path) {
  const url = `/licence-monitoring-station/setup/${sessionId}/${path}`

  return {
    method: 'GET',
    url,
    auth: {
      strategy: 'session',
      credentials: { scope: ['manage_gauging_station_licence_links'] }
    }
  }
}

function _postOptions(path, payload) {
  return postRequestOptions(
    `/licence-monitoring-station/setup/${sessionId}/${path}`,
    payload,
    'manage_gauging_station_licence_links'
  )
}
