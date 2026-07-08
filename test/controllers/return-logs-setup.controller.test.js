
// Test framework dependencies

// Test helpers
import http2 from 'node:http2'
const { HTTP_STATUS_FOUND, HTTP_STATUS_OK  } = http2.constants
import { postRequestOptions } from '../support/general.js'

// Things we need to stub
import CancelService from '../../app/services/return-logs/setup/cancel.service.js'
import CheckService from '../../app/services/return-logs/setup/check.service.js'
import ConfirmedService from '../../app/services/return-logs/setup/confirmed.service.js'
import DeleteNoteService from '../../app/services/return-logs/setup/delete-note.service.js'
import InitiateSessionService from '../../app/services/return-logs/setup/initiate-session.service.js'
import MeterDetailsService from '../../app/services/return-logs/setup/meter-details.service.js'
import MeterProvidedService from '../../app/services/return-logs/setup/meter-provided.service.js'
import MultipleEntriesService from '../../app/services/return-logs/setup/multiple-entries.service.js'
import NoteService from '../../app/services/return-logs/setup/note.service.js'
import PeriodUsedService from '../../app/services/return-logs/setup/period-used.service.js'
import ReadingsService from '../../app/services/return-logs/setup/readings.service.js'
import ReceivedService from '../../app/services/return-logs/setup/received.service.js'
import ReportedService from '../../app/services/return-logs/setup/reported.service.js'
import SingleVolumeService from '../../app/services/return-logs/setup/single-volume.service.js'
import StartReadingService from '../../app/services/return-logs/setup/start-reading.service.js'
import SubmissionService from '../../app/services/return-logs/setup/submission.service.js'
import SubmitCancelService from '../../app/services/return-logs/setup/submit-cancel.service.js'
import SubmitCheckService from '../../app/services/return-logs/setup/submit-check.service.js'
import SubmitConfirmedService from '../../app/services/return-logs/setup/submit-confirmed.service.js'
import SubmitMeterDetailsService from '../../app/services/return-logs/setup/submit-meter-details.service.js'
import SubmitMeterProvidedService from '../../app/services/return-logs/setup/submit-meter-provided.service.js'
import SubmitMultipleEntriesService from '../../app/services/return-logs/setup/submit-multiple-entries.service.js'
import SubmitNoteService from '../../app/services/return-logs/setup/submit-note.service.js'
import SubmitPeriodUsedService from '../../app/services/return-logs/setup/submit-period-used.service.js'
import SubmitReadingsService from '../../app/services/return-logs/setup/submit-readings.service.js'
import SubmitReceivedService from '../../app/services/return-logs/setup/submit-received.service.js'
import SubmitReportedService from '../../app/services/return-logs/setup/submit-reported.service.js'
import SubmitSingleVolumeService from '../../app/services/return-logs/setup/submit-single-volume.service.js'
import SubmitStartReadingService from '../../app/services/return-logs/setup/submit-start-reading.service.js'
import SubmitSubmissionService from '../../app/services/return-logs/setup/submit-submission.service.js'
import SubmitUnitsService from '../../app/services/return-logs/setup/submit-units.service.js'
import SubmitVolumesService from '../../app/services/return-logs/setup/submit-volumes.service.js'
import UnitsService from '../../app/services/return-logs/setup/units.service.js'
import VolumesService from '../../app/services/return-logs/setup/volumes.service.js'

// For running our service
import { init } from '../../app/server.js'

const sessionId = 'f01efb63-4d27-4be7-ab10-54cf177f1908'

describe('Return Logs - Setup - Controller', () => {
  let options
  let path
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

  describe('return-logs/setup', () => {
    describe('POST', () => {
      describe('when a request is valid', () => {
        beforeEach(() => {
          options = postRequestOptions(`/return-logs/setup`, { payload: { returnLogId: 'RETURN_LOG_ID' } }, ['returns'])

                    vi.mock('../../app/services/return-logs/setup/initiate-session.service.js')
          InitiateSessionService.mockResolvedValue(`/system/return-logs/setup/${sessionId}/check`)
        })

        it('redirects to the returned page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/check`)
        })
      })
    })
  })

  describe('return-logs/setup/confirmed/{returnLogId}', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: '/return-logs/setup/confirmed/227d174d-500b-4e88-ae95-c70b0676bb88',
          auth: {
            strategy: 'session',
            credentials: { scope: ['returns'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/confirmed.service.js')
          ConfirmedService.mockResolvedValue({
            licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
            licenceRef: '01/117',
            pageTitle: 'Return 10032788 received',
            purposeDetails: {
              label: 'Purpose',
              value: 'Spray Irrigation - Direct'
            },
            siteDescription: 'Addington Sandpits',
            status: 'received'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Return 10032788 received')
          expect(response.payload).toContain('View returns for 01/117')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        options = postRequestOptions('/return-logs/setup/confirmed/227d174d-500b-4e88-ae95-c70b0676bb88', {}, [
          'returns'
        ])
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/submit-confirmed.service.js')
          SubmitConfirmedService.mockResolvedValue('91aff99a-3204-4727-86bd-7bdf3ef24533')
        })

        it('redirects to the licence returns page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual('/system/licences/91aff99a-3204-4727-86bd-7bdf3ef24533/returns')
        })
      })
    })
  })

  describe('return-logs/setup/guidance', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: '/return-logs/setup/guidance',
          auth: {
            strategy: 'session',
            credentials: { scope: ['returns'] }
          }
        }
      })

      describe('when a request is valid', () => {
        it('redirects to the "guidance" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Help to enter multiple volumes or readings into a return')
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/cancel', () => {
    beforeEach(() => {
      path = 'cancel'
    })

    describe('GET', () => {
      beforeEach(() => {
                vi.mock('../../app/services/return-logs/setup/cancel.service.js')
        CancelService.mockResolvedValue({ pageTitle: 'You are about to cancel this return submission' })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('You are about to cancel this return submission')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/submit-cancel.service.js')
          SubmitCancelService.mockResolvedValue()
        })

        it('redirects to the "abstraction return" page', async () => {
          const response = await server.inject(
            _postOptions(path, { returnLogId: '4ddbac0e-a176-420a-8176-4ce410327641' })
          )

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual('/system/return-logs/4ddbac0e-a176-420a-8176-4ce410327641/details')
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/check', () => {
    beforeEach(() => {
      path = 'check'
    })

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/check.service.js')
          CheckService.mockResolvedValue({ pageTitle: 'Check details and enter new volumes or readings' })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Check details and enter new volumes or readings')
        })
      })
    })

    describe('POST', () => {
      describe('when a request is valid', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/submit-check.service.js')
          SubmitCheckService.mockResolvedValue({ returnLogId: '168026d8-f29b-4165-8726-734c6b14adec' })
        })

        it('redirects to the confirmed page on success', async () => {
          const response = await server.inject(_postOptions(path, {}))

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(
            '/system/return-logs/setup/confirmed/168026d8-f29b-4165-8726-734c6b14adec'
          )
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/submit-check.service.js')
          SubmitCheckService.mockResolvedValue({
            error: {
              errorList: [{ text: 'Returns with an abstraction volume of 0 should be recorded as a nil return.' }]
            },
            pageTitle: 'Check details and enter new volumes or readings',
            sessionId
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(_postOptions(path, {}))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Check details and enter new volumes or readings')
          expect(response.payload).toContain('There is a problem')
          expect(response.payload).toContain(
            'Returns with an abstraction volume of 0 should be recorded as a nil return.'
          )
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/delete-note', () => {
    beforeEach(() => {
      path = 'delete-note'
    })

    describe('GET', () => {
      beforeEach(async () => {
                vi.mock('../../app/services/return-logs/setup/delete-note.service.js')
        DeleteNoteService.mockResolvedValue({
          title: 'Removed',
          text: 'Note removed'
        })
      })

      it('redirects on success', async () => {
        const result = await server.inject(_getOptions(path))

        expect(result.statusCode).toEqual(HTTP_STATUS_FOUND)
        expect(result.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/check`)
      })
    })
  })

  describe('return-logs/setup/{sessionId}/meter-provided', () => {
    const path = 'meter-provided'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/meter-provided.service.js')
          MeterProvidedService.mockResolvedValue({
            sessionId,
            licenceId: '3154ea03-e232-4c66-a711-a72956b7de61',
            pageTitle: 'Have meter details been provided?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Have meter details been provided?')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and a meter was provided', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-meter-provided.service.js')
            SubmitMeterProvidedService.mockResolvedValue({ meterProvided: 'yes' })
          })

          it('redirects to the "meter details" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/meter-details`)
          })
        })

        describe('and a meter was not provided', () => {
          describe('and the page has not been visited previously', () => {
            beforeEach(() => {
                            vi.mock('../../app/services/return-logs/setup/submit-meter-provided.service.js')
              SubmitMeterProvidedService.mockResolvedValue({ meterProvided: 'no' })
            })

            it('redirects to the "single volume" page', async () => {
              const response = await server.inject(_postOptions(path, {}))

              expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
              expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/single-volume`)
            })
          })

          describe('and the page has been visited previously', () => {
            beforeEach(() => {
                            vi.mock('../../app/services/return-logs/setup/submit-meter-provided.service.js')
              SubmitMeterProvidedService.mockResolvedValue({ checkPageVisited: true, meterProvided: 'no' })
            })

            it('redirects to the "check" page', async () => {
              const response = await server.inject(_postOptions(path, {}))

              expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
              expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/check`)
            })
          })

          describe('and the reported type is "meterReadings"', () => {
            beforeEach(() => {
                            vi.mock('../../app/services/return-logs/setup/submit-meter-provided.service.js')
              SubmitMeterProvidedService.mockResolvedValue({ meterProvided: 'no', reported: 'meterReadings' })
            })

            it('redirects to the "check" page', async () => {
              const response = await server.inject(_postOptions(path, {}))

              expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
              expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/check`)
            })
          })
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/submit-meter-provided.service.js')
          SubmitMeterProvidedService.mockResolvedValue({
            error: {
              errorList: [{ href: '#meterProvided', text: 'Select if meter details have been provided' }],
              meterProvided: { text: 'Select if meter details have been provided' }
            },
            pageTitle: 'Have meter details been provided?',
            sessionId
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(_postOptions(path, {}))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select if meter details have been provided')
          expect(response.payload).toContain('There is a problem')
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/meter-details', () => {
    beforeEach(() => {
      path = 'meter-details'
    })

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/meter-details.service.js')
          MeterDetailsService.mockResolvedValue({
            sessionId,
            pageTitle: 'Meter details'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Meter details')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the page has not been visited previously', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-meter-details.service.js')
            SubmitMeterDetailsService.mockResolvedValue({
              meterMake: 'Meter',
              meterSerialNumber: '1234',
              meter10TimesDisplay: 'no'
            })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/check`)
          })
        })

        describe('and the page has been visited previously', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-meter-details.service.js')
            SubmitMeterDetailsService.mockResolvedValue({
              checkPageVisited: true,
              meterMake: 'Meter',
              meterSerialNumber: '1234',
              meter10TimesDisplay: 'no'
            })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/check`)
          })
        })

        describe('and the reporting type is "abstractionVolumes"', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-meter-details.service.js')
            SubmitMeterDetailsService.mockResolvedValue({
              reported: 'abstractionVolumes',
              meterMake: 'Meter',
              meterSerialNumber: '1234',
              meter10TimesDisplay: 'no'
            })
          })

          it('redirects to the "single-volume" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/single-volume`)
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-meter-details.service.js')
            SubmitMeterDetailsService.mockResolvedValue({
              error: {
                errorList: [{ href: '#meter-make', text: 'Enter the make of the meter' }],
                meterMake: { message: 'Enter the make of the meter' }
              },
              pageTitle: 'Have meter details been provided?',
              sessionId: 'Meter details'
            })
          })

          it('re-renders the page with an error message', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Enter the make of the meter')
            expect(response.payload).toContain('There is a problem')
          })
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/multiple-entries', () => {
    beforeEach(() => {
      path = 'multiple-entries'
    })

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/multiple-entries.service.js')
          MultipleEntriesService.mockResolvedValue({
            sessionId,
            licenceId: '3154ea03-e232-4c66-a711-a72956b7de61',
            pageTitle: 'Enter multiple daily volumes'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Enter multiple daily volumes')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/submit-multiple-entries.service.js')
          SubmitMultipleEntriesService.mockResolvedValue({})
        })

        it('redirects to the "check" page', async () => {
          const response = await server.inject(_postOptions(path, {}))

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/check`)
        })
      })

      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-multiple-entries.service.js')
            SubmitMultipleEntriesService.mockResolvedValue({
              error: { errorList: [{ href: '#multipleEntries', text: 'Enter 12 daily volumes' }] },
              pageTitle: 'Enter multiple daily volumes',
              sessionId
            })
          })

          it('re-renders the page with an error message', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Enter 12 daily volumes')
            expect(response.payload).toContain('There is a problem')
          })
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/note', () => {
    beforeEach(() => {
      path = 'note'
    })

    describe('GET', () => {
      beforeEach(async () => {
                vi.mock('../../app/services/return-logs/setup/note.service.js')
        NoteService.mockResolvedValue({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Add a note'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Add a note')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/submit-note.service.js')
          SubmitNoteService.mockResolvedValue({})
        })

        it('redirects to the "check" page', async () => {
          const response = await server.inject(_postOptions(path, { journey: 'selectedOption' }))

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/check`)
        })
      })

      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-note.service.js')
            SubmitNoteService.mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/period-used', () => {
    beforeEach(() => {
      path = 'period-used'
    })

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/period-used.service.js')
          PeriodUsedService.mockResolvedValue({
            sessionId,
            licenceId: '3154ea03-e232-4c66-a711-a72956b7de61',
            pageTitle: 'What period was used for this volume?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('What period was used for this volume?')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/submit-period-used.service.js')
          SubmitPeriodUsedService.mockResolvedValue({})
        })

        it('redirects to the "check" page', async () => {
          const response = await server.inject(_postOptions(path, {}))

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/check`)
        })
      })

      describe('and the validation fails', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/submit-period-used.service.js')
          SubmitPeriodUsedService.mockResolvedValue({
            error: {
              errorList: [{ href: '#period-date-used-options', text: 'Select what period was used for this volume' }],
              meterMake: { message: 'Select what period was used for this volume' }
            },
            pageTitle: 'What period was used for this volume?',
            sessionId
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(_postOptions(path, {}))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select what period was used for this volume')
          expect(response.payload).toContain('There is a problem')
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/readings/{yearMonth}', () => {
    const path = 'readings/2023-3'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/readings.service.js')
          ReadingsService.mockResolvedValue({ pageTitle: 'Water abstracted April 2023' })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Water abstracted April 2023')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation passes', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-readings.service.js')
            SubmitReadingsService.mockResolvedValue({})
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/check`)
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-readings.service.js')
            SubmitReadingsService.mockResolvedValue({
              error: {
                '2023-04-30T00:00:00.000Z': {
                  text: 'Reading must be a number or blank'
                },
                errorList: [
                  {
                    href: '#2023-04-30T00:00:00.000Z',
                    text: 'Reading must be a number or blank'
                  }
                ]
              },
              pageTitle: 'Water abstracted April 2023'
            })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Water abstracted April 2023')
            expect(response.payload).toContain('There is a problem')
            expect(response.payload).toContain('Reading must be a number or blank')
          })
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/received', () => {
    const path = 'received'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/received.service.js')
          ReceivedService.mockResolvedValue({
            sessionId,
            licenceId: '3154ea03-e232-4c66-a711-a72956b7de61',
            pageTitle: 'When was the return received?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('When was the return received?')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the page has not been visited previously', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-received.service.js')
            SubmitReceivedService.mockResolvedValue({})
          })

          it('redirects to the "submission" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/submission`)
          })
        })

        describe('and the page has been visited previously', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-received.service.js')
            SubmitReceivedService.mockResolvedValue({ checkPageVisited: true })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/check`)
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-received.service.js')
            SubmitReceivedService.mockResolvedValue({
              error: {
                errorList: [
                  {
                    href: '#receivedDateOptions',
                    text: 'Select the return received date'
                  }
                ],
                receivedDateOptions: { text: 'Select the return received date' }
              },
              pageTitle: 'When was the return received?',
              sessionId
            })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Select the return received date')
            expect(response.payload).toContain('There is a problem')
          })
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/reported', () => {
    const path = 'reported'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/reported.service.js')
          ReportedService.mockResolvedValue({
            sessionId,
            licenceId: '3154ea03-e232-4c66-a711-a72956b7de61',
            pageTitle: 'How was this return reported?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('How was this return reported?')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the page has not been visited previously', () => {
          describe('and "Meter readings" has been selected', () => {
            beforeEach(() => {
                            vi.mock('../../app/services/return-logs/setup/submit-reported.service.js')
              SubmitReportedService.mockResolvedValue({ reported: 'meterReadings' })
            })

            it('redirects to the "start-reading" page', async () => {
              const response = await server.inject(_postOptions(path, {}))

              expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
              expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/start-reading`)
            })
          })

          describe('and "Abstraction Volumes" has been selected', () => {
            beforeEach(() => {
                            vi.mock('../../app/services/return-logs/setup/submit-reported.service.js')
              SubmitReportedService.mockResolvedValue({ reported: 'abstractionVolumes' })
            })

            it('redirects to the "units" page', async () => {
              const response = await server.inject(_postOptions(path, {}))

              expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
              expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/units`)
            })
          })
        })

        describe('and the page has been visited previously', () => {
          describe('and "Meter readings" has been selected', () => {
            beforeEach(() => {
                            vi.mock('../../app/services/return-logs/setup/submit-reported.service.js')
              SubmitReportedService.mockResolvedValue({ checkPageVisited: true, reported: 'meterReadings' })
            })

            it('redirects to the "start-reading" page', async () => {
              const response = await server.inject(_postOptions(path, {}))

              expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
              expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/start-reading`)
            })
          })

          describe('and "Abstraction Volumes" has been selected', () => {
            beforeEach(() => {
                            vi.mock('../../app/services/return-logs/setup/submit-reported.service.js')
              SubmitReportedService.mockResolvedValue({
                checkPageVisited: true,
                reported: 'abstractionVolumes'
              })
            })

            it('redirects to the "check" page', async () => {
              const response = await server.inject(_postOptions(path, {}))

              expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
              expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/check`)
            })
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-reported.service.js')
            SubmitReportedService.mockResolvedValue({
              error: {
                errorList: [{ href: '#reported', text: 'Select how this return was reported' }],
                reported: { text: 'Select how this return was reported' }
              },
              pageTitle: 'How was this return reported?',
              sessionId
            })
          })

          it('re-renders the page with an error message', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Select how this return was reported')
            expect(response.payload).toContain('There is a problem')
          })
        })
      })
    })
  })

  describe('/return-logs/setup/{sessionId}/submission', () => {
    const path = 'submission'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/submission.service.js')
          SubmissionService.mockResolvedValue({ pageTitle: 'Abstraction return' })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Abstraction return')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and "Enter and submit" has been selected', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-submission.service.js')
            SubmitSubmissionService.mockResolvedValue({ redirect: 'reported' })
          })

          it('redirects to the "reported" page', async () => {
            const response = await server.inject(_postOptions(path, { journey: 'enterReturn' }))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/reported`)
          })
        })

        describe('and "Enter a nil return" has been selected', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-submission.service.js')
            SubmitSubmissionService.mockResolvedValue({ redirect: 'check' })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, { journey: 'nilReturn' }))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/check`)
          })
        })

        describe('and "Record receipt" has been selected', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-submission.service.js')
            SubmitSubmissionService.mockResolvedValue({
              redirect: 'confirm-received',
              returnLogId: 'fb875afa-de26-44d3-9255-370020cceb3b'
            })
          })

          it('redirects to the "confirmed" page', async () => {
            const response = await server.inject(_postOptions(path, { journey: 'recordReceipt' }))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(
              '/system/return-logs/setup/confirmed/fb875afa-de26-44d3-9255-370020cceb3b'
            )
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-submission.service.js')
            SubmitSubmissionService.mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/single-volume', () => {
    beforeEach(() => {
      path = 'single-volume'
    })

    describe('GET', () => {
      describe('when a request is valid', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/single-volume.service.js')
          SingleVolumeService.mockResolvedValue({
            sessionId,
            pageTitle: 'Is it a single volume?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Is it a single volume?')
        })
      })
    })

    describe('POST', () => {
      describe('when a request is valid', () => {
        describe('and a single volume was provided', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-single-volume.service.js')
            SubmitSingleVolumeService.mockResolvedValue({
              singleVolume: 'yes',
              singleVolumeQuantity: '1000'
            })
          })

          it('redirects to the "period used" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/period-used`)
          })
        })

        describe('and a single volume was not provided', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-single-volume.service.js')
            SubmitSingleVolumeService.mockResolvedValue({
              singleVolume: 'no'
            })
          })

          it('redirects to the "check answers" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/check`)
          })
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/submit-single-volume.service.js')
          SubmitSingleVolumeService.mockResolvedValue({
            error: {
              // Actual error message includes a ' which changes to &#39; in the HTML. For ease of testing we therefore
              // use a placeholder error message.
              errorList: [{ href: '#singleVolume', text: 'SINGLE_VOLUME_ERROR' }],
              singleVolume: { text: 'SINGLE_VOLUME_ERROR' }
            },
            pageTitle: 'Is it a single volume?',
            sessionId
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(_postOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('SINGLE_VOLUME_ERROR')
          expect(response.payload).toContain('There is a problem')
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/start-reading', () => {
    beforeEach(() => {
      path = 'start-reading'
    })

    describe('GET', () => {
      describe('when a request is valid', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/start-reading.service.js')
          StartReadingService.mockResolvedValue({
            sessionId,
            pageTitle: 'Enter the start meter reading'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Enter the start meter reading')
        })
      })
    })

    describe('POST', () => {
      describe('when a request is valid', () => {
        describe('and the page has not been visited previously', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-start-reading.service.js')
            SubmitStartReadingService.mockResolvedValue({})
          })

          it('redirects to the "units" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/units`)
          })
        })

        describe('and the page has been visited previously', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-start-reading.service.js')
            SubmitStartReadingService.mockResolvedValue({ checkPageVisited: true })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/check`)
          })
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/submit-start-reading.service.js')
          SubmitStartReadingService.mockResolvedValue({
            error: {
              errorList: [{ text: 'Enter a start meter reading', href: '#startReading' }]
            },
            pageTitle: 'Enter the start meter reading',
            sessionId
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(_postOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Enter a start meter reading')
          expect(response.payload).toContain('There is a problem')
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/units', () => {
    const path = 'units'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/units.service.js')
          UnitsService.mockResolvedValue({
            sessionId,
            licenceId: '3154ea03-e232-4c66-a711-a72956b7de61',
            pageTitle: 'Which units were used?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Which units were used?')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the page has not been visited previously', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-units.service.js')
            SubmitUnitsService.mockResolvedValue({})
          })

          it('redirects to the "meter provided" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/meter-provided`)
          })
        })

        describe('and the page has been visited previously', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-units.service.js')
            SubmitUnitsService.mockResolvedValue({ checkPageVisited: true })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/check`)
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-units.service.js')
            SubmitUnitsService.mockResolvedValue({
              error: {
                errorList: [{ href: '#units', text: 'Select which units were used' }],
                units: { text: 'Select which units were used' }
              },
              pageTitle: 'Which units were used?',
              sessionId
            })
          })

          it('re-renders the page with an error message', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Select which units were used')
            expect(response.payload).toContain('There is a problem')
          })
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/volumes/{yearMonth}', () => {
    const path = 'volumes/2023-3'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
                    vi.mock('../../app/services/return-logs/setup/volumes.service.js')
          VolumesService.mockResolvedValue({ pageTitle: 'Water abstracted April 2023' })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Water abstracted April 2023')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation passes', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-volumes.service.js')
            SubmitVolumesService.mockResolvedValue({})
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/return-logs/setup/${sessionId}/check`)
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
                        vi.mock('../../app/services/return-logs/setup/submit-volumes.service.js')
            SubmitVolumesService.mockResolvedValue({
              error: {
                errorList: [
                  {
                    href: '#2023-04-30T00:00:00.000Z',
                    text: 'Volume must be a number or blank'
                  }
                ],
                '2023-04-30T00:00:00.000Z': { text: 'Volume must be a number or blank' }
              },
              pageTitle: 'Water abstracted April 2023'
            })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Water abstracted April 2023')
            expect(response.payload).toContain('There is a problem')
            expect(response.payload).toContain('Volume must be a number or blank')
          })
        })
      })
    })
  })
})

function _getOptions(path) {
  const url = `/return-logs/setup/${sessionId}/${path}`

  return {
    method: 'GET',
    url,
    auth: {
      strategy: 'session',
      credentials: { scope: ['returns'] }
    }
  }
}

function _postOptions(path, payload) {
  return postRequestOptions(`/return-logs/setup/${sessionId}/${path}`, payload, ['returns'])
})