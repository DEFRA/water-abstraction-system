// Test framework dependencies

// Test helpers
import http2 from 'node:http2'
import { postRequestOptions } from '../support/general.js'

// Things we need to stub
import * as AbstractionPeriodService from '../../app/services/licence-monitoring-station/setup/abstraction-period.service.js'
import * as CheckService from '../../app/services/licence-monitoring-station/setup/check.service.js'
import * as FullConditionService from '../../app/services/licence-monitoring-station/setup/full-condition.service.js'
import * as InitiateSessionService from '../../app/services/licence-monitoring-station/setup/initiate-session.service.js'
import * as LicenceNumberService from '../../app/services/licence-monitoring-station/setup/licence-number.service.js'
import * as StopOrReduceService from '../../app/services/licence-monitoring-station/setup/stop-or-reduce.service.js'
import * as SubmitAbstractionPeriodService from '../../app/services/licence-monitoring-station/setup/submit-abstraction-period.service.js'
import * as SubmitCheckService from '../../app/services/licence-monitoring-station/setup/submit-check.service.js'
import * as SubmitFullConditionService from '../../app/services/licence-monitoring-station/setup/submit-full-condition.service.js'
import * as SubmitLicenceNumberService from '../../app/services/licence-monitoring-station/setup/submit-licence-number.service.js'
import * as SubmitStopOrReduceService from '../../app/services/licence-monitoring-station/setup/submit-stop-or-reduce.service.js'
import * as SubmitThresholdAndUnitService from '../../app/services/licence-monitoring-station/setup/submit-threshold-and-unit.service.js'
import * as ThresholdAndUnitService from '../../app/services/licence-monitoring-station/setup/threshold-and-unit.service.js'

// For running our service
import { init } from '../../app/server.js'
const { HTTP_STATUS_FOUND, HTTP_STATUS_OK } = http2.constants

const sessionId = 'b0ebf12a-c238-4c48-9526-64513a8df935'

describe('Licence Monitoring Station - Setup - Controller', () => {
  let options
  let server

  // Create server before running the tests
  beforeAll(async () => {
    server = await init()
  })

  beforeEach(() => {
    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    vi.spyOn(server.logger, 'error').mockImplementation(() => {})

    // We silence sending a notification to our Errbit instance using Airbrake
    vi.spyOn(server.app.airbrake, 'notify').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(async () => {
    await server.stop()
  })

  describe('licence-monitoring-station/setup', () => {
    describe('POST', () => {
      describe('when a request is valid', () => {
        beforeEach(() => {
          vi.spyOn(InitiateSessionService, 'default').mockResolvedValue('b0ebf12a-c238-4c48-9526-64513a8df935')
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

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(
            `/system/licence-monitoring-station/setup/${sessionId}/threshold-and-unit`
          )
        })
      })
    })
  })

  describe('licence-monitoring-station/setup/{sessionId}/abstraction-period', () => {
    const path = 'abstraction-period'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.spyOn(AbstractionPeriodService, 'default').mockResolvedValue({
            backLink: `/system/licence-monitoring-station/setup/${sessionId}/licence-number`,
            monitoringStationLabel: 'Station Label',
            pageTitle: 'Enter an abstraction period for licence 01/234'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Enter an abstraction period for licence 01/234')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.spyOn(SubmitAbstractionPeriodService, 'default').mockResolvedValue({})
        })

        it('redirects to the "check" page', async () => {
          const response = await server.inject(_postOptions(path, {}))

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/licence-monitoring-station/setup/${sessionId}/check`)
        })
      })

      describe('and the validation fails', () => {
        beforeEach(() => {
          vi.spyOn(SubmitAbstractionPeriodService, 'default').mockResolvedValue({
            error: {
              errorList: [
                {
                  href: '#abstraction-period-start',
                  text: 'Enter a real start date'
                },
                {
                  href: '#abstraction-period-end',
                  text: 'Enter a real end date'
                }
              ],
              'abstraction-period-start': {
                text: 'Enter a real start date'
              },
              'abstraction-period-end': {
                text: 'Enter a real end date'
              }
            },
            abstractionPeriodStartDay: 'INVALID',
            abstractionPeriodEndDay: 'INVALID',
            abstractionPeriodStartMonth: 'INVALID',
            abstractionPeriodEndMonth: 'INVALID',
            backLink: {
              href: `/system/licence-monitoring-station/setup/${sessionId}/licence-number`,
              text: 'Back'
            },
            monitoringStationLabel: 'Station Label',
            pageTitle: 'Enter an abstraction period for licence 01/234'
          })
        })

        it('returns the page successfully with the error summary banner', async () => {
          const response = await server.inject(_postOptions(path, {}))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('There is a problem')
          expect(response.payload).toContain('Enter a real start date')
          expect(response.payload).toContain('Enter a real end date')
        })
      })
    })
  })

  describe('licence-monitoring-station/setup/{sessionId}/check', () => {
    const path = 'check'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.spyOn(CheckService, 'default').mockResolvedValue({
            pageTitle: 'Check the restriction details'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Check the restriction details')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        const monitoringStationId = 'bdd4aab4-0910-4641-b626-9db943d79df6'

        beforeEach(() => {
          vi.spyOn(SubmitCheckService, 'default').mockResolvedValue(monitoringStationId)
        })

        it('redirects to the "monitoring stations" page', async () => {
          const response = await server.inject(_postOptions(path, {}))

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/monitoring-stations/${monitoringStationId}`)
        })
      })
    })
  })

  describe('licence-monitoring-station/setup/{sessionId}/full-condition', () => {
    const path = 'full-condition'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.spyOn(FullConditionService, 'default').mockResolvedValue({
            backLink: `/system/licence-monitoring-station/setup/${sessionId}/licence-number`,
            monitoringStationLabel: 'Station Label',
            pageTitle: 'Select the full condition for licence 01/234'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select the full condition for licence 01/234')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the user selects an option requiring abstraction period entry', () => {
          beforeEach(() => {
            vi.spyOn(SubmitFullConditionService, 'default').mockResolvedValue({ abstractionPeriod: true })
          })

          it('redirects to the "abstraction-period" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(
              `/system/licence-monitoring-station/setup/${sessionId}/abstraction-period`
            )
          })
        })

        describe('and the user selects an option not requiring abstraction period entry', () => {
          beforeEach(() => {
            vi.spyOn(SubmitFullConditionService, 'default').mockResolvedValue({ abstractionPeriod: false })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/licence-monitoring-station/setup/${sessionId}/check`)
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
            vi.spyOn(FullConditionService, 'default').mockResolvedValue({
              error: { text: 'Select a condition' },
              backLink: `/system/licence-monitoring-station/setup/${sessionId}/licence-number`,
              monitoringStationLabel: 'Station Label',
              pageTitle: 'Select the full condition for licence 01/234'
            })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Select a condition')
            expect(response.payload).toContain('There is a problem')
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
          vi.spyOn(LicenceNumberService, 'default').mockResolvedValue({
            backLink: `/system/licence-monitoring-station/setup/${sessionId}/stop-or-reduce`,
            monitoringStationLabel: 'Station Label',
            pageTitle: 'Enter the licence number this threshold applies to'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Enter the licence number this threshold applies to')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the page has not been visited previously', () => {
          beforeEach(() => {
            vi.spyOn(SubmitLicenceNumberService, 'default').mockResolvedValue({})
          })

          it('redirects to the "licence-number" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(
              `/system/licence-monitoring-station/setup/${sessionId}/full-condition`
            )
          })
        })

        describe('and the page has been visited previously', () => {
          beforeEach(() => {
            vi.spyOn(SubmitLicenceNumberService, 'default').mockResolvedValue({ checkPageVisited: true })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/licence-monitoring-station/setup/${sessionId}/check`)
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
            vi.spyOn(SubmitLicenceNumberService, 'default').mockResolvedValue({
              error: { text: 'Enter a valid licence number' },
              backLink: `/system/licence-monitoring-station/setup/${sessionId}/stop-or-reduce`,
              monitoringStationLabel: 'Station Label',
              pageTitle: 'Enter the licence number this threshold applies to'
            })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Enter a valid licence number')
            expect(response.payload).toContain('There is a problem')
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
          vi.spyOn(StopOrReduceService, 'default').mockResolvedValue({
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

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Does the licence holder need to stop or reduce at this threshold?')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the page has not been visited previously', () => {
          beforeEach(() => {
            vi.spyOn(SubmitStopOrReduceService, 'default').mockResolvedValue({})
          })

          it('redirects to the "licence-number" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(
              `/system/licence-monitoring-station/setup/${sessionId}/licence-number`
            )
          })
        })

        describe('and the page has been visited previously', () => {
          beforeEach(() => {
            vi.spyOn(SubmitStopOrReduceService, 'default').mockResolvedValue({ checkPageVisited: true })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/licence-monitoring-station/setup/${sessionId}/check`)
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
            vi.spyOn(SubmitStopOrReduceService, 'default').mockResolvedValue({
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

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Select if the licence holder needs to stop or reduce')
            expect(response.payload).toContain('There is a problem')
          })
        })
      })
    })
  })

  describe('licence-monitoring-station/setup/{sessionId}/threshold-and-unit', () => {
    const path = 'threshold-and-unit'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.spyOn(ThresholdAndUnitService, 'default').mockResolvedValue({
            sessionId,
            monitoringStationLabel: 'Station Label',
            pageTitle: 'What is the licence hands-off flow or level threshold?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('What is the licence hands-off flow or level threshold?')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the page has not been visited previously', () => {
          beforeEach(() => {
            vi.spyOn(SubmitThresholdAndUnitService, 'default').mockResolvedValue({})
          })

          it('redirects to the "stop-or-reduce" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(
              `/system/licence-monitoring-station/setup/${sessionId}/stop-or-reduce`
            )
          })
        })

        describe('and the page has been visited previously', () => {
          beforeEach(() => {
            vi.spyOn(SubmitThresholdAndUnitService, 'default').mockResolvedValue({ checkPageVisited: true })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/licence-monitoring-station/setup/${sessionId}/check`)
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
            vi.spyOn(SubmitThresholdAndUnitService, 'default').mockResolvedValue({
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

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Enter a threshold')
            expect(response.payload).toContain('There is a problem')
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
