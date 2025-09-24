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
const CancelService = require('../../app/services/return-logs/setup/cancel.service.js')
const CheckService = require('../../app/services/return-logs/setup/check.service.js')
const ConfirmedService = require('../../app/services/return-logs/setup/confirmed.service.js')
const DeleteNoteService = require('../../app/services/return-logs/setup/delete-note.service.js')
const InitiateSessionService = require('../../app/services/return-logs/setup/initiate-session.service.js')
const MeterDetailsService = require('../../app/services/return-logs/setup/meter-details.service.js')
const MeterProvidedService = require('../../app/services/return-logs/setup/meter-provided.service.js')
const MultipleEntriesService = require('../../app/services/return-logs/setup/multiple-entries.service.js')
const NoteService = require('../../app/services/return-logs/setup/note.service.js')
const PeriodUsedService = require('../../app/services/return-logs/setup/period-used.service.js')
const ReadingsService = require('../../app/services/return-logs/setup/readings.service.js')
const ReceivedService = require('../../app/services/return-logs/setup/received.service.js')
const ReportedService = require('../../app/services/return-logs/setup/reported.service.js')
const SingleVolumeService = require('../../app/services/return-logs/setup/single-volume.service.js')
const StartReadingService = require('../../app/services/return-logs/setup/start-reading.service.js')
const SubmissionService = require('../../app/services/return-logs/setup/submission.service.js')
const SubmitCancelService = require('../../app/services/return-logs/setup/submit-cancel.service.js')
const SubmitCheckService = require('../../app/services/return-logs/setup/submit-check.service.js')
const SubmitConfirmedService = require('../../app/services/return-logs/setup/submit-confirmed.service.js')
const SubmitMeterDetailsService = require('../../app/services/return-logs/setup/submit-meter-details.service.js')
const SubmitMeterProvidedService = require('../../app/services/return-logs/setup/submit-meter-provided.service.js')
const SubmitMultipleEntriesService = require('../../app/services/return-logs/setup/submit-multiple-entries.service.js')
const SubmitNoteService = require('../../app/services/return-logs/setup/submit-note.service.js')
const SubmitPeriodUsedService = require('../../app/services/return-logs/setup/submit-period-used.service.js')
const SubmitReadingsService = require('../../app/services/return-logs/setup/submit-readings.service.js')
const SubmitReceivedService = require('../../app/services/return-logs/setup/submit-received.service.js')
const SubmitReportedService = require('../../app/services/return-logs/setup/submit-reported.service.js')
const SubmitSingleVolumeService = require('../../app/services/return-logs/setup/submit-single-volume.service.js')
const SubmitStartReadingService = require('../../app/services/return-logs/setup/submit-start-reading.service.js')
const SubmitSubmissionService = require('../../app/services/return-logs/setup/submit-submission.service.js')
const SubmitUnitsService = require('../../app/services/return-logs/setup/submit-units.service.js')
const SubmitVolumesService = require('../../app/services/return-logs/setup/submit-volumes.service.js')
const UnitsService = require('../../app/services/return-logs/setup/units.service.js')
const VolumesService = require('../../app/services/return-logs/setup/volumes.service.js')

// For running our service
const { init } = require('../../app/server.js')

const sessionId = 'f01efb63-4d27-4be7-ab10-54cf177f1908'

describe('Return Logs - Setup - Controller', () => {
  let options
  let path
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
    describe('POST', () => {
      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(InitiateSessionService, 'go').resolves(`/system/return-logs/setup/${sessionId}/check`)
          options = postRequestOptions(`/return-logs/setup`, { payload: { returnLogId: 'RETURN_LOG_ID' } })
        })

        it('redirects to the returned page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/check`)
        })
      })
    })
  })

  describe('return-logs/setup/confirmed', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/return-logs/setup/confirmed?id=v1:6:01/117:10032788:2019-04-01:2019-05-12`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(ConfirmedService, 'go').resolves({
            activeNavBar: 'search',
            licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
            licenceRef: '01/117',
            returnLogId: 'v1:6:01/117:10032788:2019-04-01:2019-05-12',
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

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Return 10032788 received')
          expect(response.payload).to.contain('View returns for 01/117')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          options = {
            method: 'POST',
            url: `/return-logs/setup/confirmed?id=v1:6:01/117:10032788:2019-04-01:2019-05-12`,
            auth: {
              strategy: 'session',
              credentials: { scope: ['billing'] }
            }
          }

          Sinon.stub(SubmitConfirmedService, 'go').resolves('91aff99a-3204-4727-86bd-7bdf3ef24533')
        })

        it('redirects to the licence returns page', async () => {
          const response = await server.inject(
            postRequestOptions('/return-logs/setup/confirmed?id=v1:6:01/117:10032788:2019-04-01:2019-05-12')
          )

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal('/system/licences/91aff99a-3204-4727-86bd-7bdf3ef24533/returns')
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
        Sinon.stub(CancelService, 'go').resolves({ pageTitle: 'You are about to cancel this return submission' })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('You are about to cancel this return submission')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(SubmitCancelService, 'go').resolves()
        })

        it('redirects to the "abstraction return" page', async () => {
          const response = await server.inject(
            _postOptions(path, { returnLogId: 'v1:6:09/999:1003992:2022-04-01:2023-03-31' })
          )

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal('/system/return-logs?id=v1:6:09/999:1003992:2022-04-01:2023-03-31')
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
          Sinon.stub(CheckService, 'go').resolves({ pageTitle: 'Check details and enter new volumes or readings' })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Check details and enter new volumes or readings')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        Sinon.stub(SubmitCheckService, 'go').resolves('TEST_RETURN_LOG_ID')
      })

      it('redirects to the confirmed page on success', async () => {
        options = postRequestOptions(`/return-logs/setup/${sessionId}/check`, {})

        const response = await server.inject(options)

        expect(response.statusCode).to.equal(302)
        expect(response.headers.location).to.equal('/system/return-logs/setup/confirmed?id=TEST_RETURN_LOG_ID')
      })
    })
  })

  describe('return-logs/setup/{sessionId}/delete-note', () => {
    beforeEach(() => {
      path = 'delete-note'
    })

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(DeleteNoteService, 'go').resolves({
          title: 'Removed',
          text: 'Note removed'
        })
      })

      it('redirects on success', async () => {
        const result = await server.inject(_getOptions(path))

        expect(result.statusCode).to.equal(302)
        expect(result.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/check`)
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
            credentials: { scope: ['billing'] }
          }
        }
      })

      describe('when a request is valid', () => {
        it('redirects to the "guidance" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Help to enter multiple volumes or readings into a return')
        })
      })
    })
  })

  describe('/return-logs/setup/{sessionId}/note', () => {
    const path = 'note'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(NoteService, 'go').resolves({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Add a note'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Add a note')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(SubmitNoteService, 'go').resolves({})
        })

        it('redirects to the "check" page', async () => {
          const response = await server.inject(_postOptions(path, { journey: 'selectedOption' }))

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/check`)
        })
      })

      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(() => {
            Sinon.stub(SubmitNoteService, 'go').resolves({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/readings/{yearMonth}', () => {
    const path = 'readings/2023-3'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(ReadingsService, 'go').resolves({ pageTitle: 'Water abstracted April 2023' })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Water abstracted April 2023')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation passes', () => {
          beforeEach(() => {
            Sinon.stub(SubmitReadingsService, 'go').resolves({})
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/check`)
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
            Sinon.stub(SubmitReadingsService, 'go').resolves({
              error: [
                {
                  href: '#2023-04-30T00:00:00.000Z',
                  text: 'Meter readings must be a number or blank'
                }
              ],
              pageTitle: 'Water abstracted April 2023'
            })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Water abstracted April 2023')
            expect(response.payload).to.contain('There is a problem')
            expect(response.payload).to.contain('Meter readings must be a number or blank')
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
          Sinon.stub(ReceivedService, 'go').resolves({
            sessionId,
            licenceId: '3154ea03-e232-4c66-a711-a72956b7de61',
            pageTitle: 'When was the return received?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('When was the return received?')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the page has not been visited previously', () => {
          beforeEach(() => {
            Sinon.stub(SubmitReceivedService, 'go').resolves({})
          })

          it('redirects to the "submission" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/submission`)
          })
        })

        describe('and the page has been visited previously', () => {
          beforeEach(() => {
            Sinon.stub(SubmitReceivedService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/check`)
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
            Sinon.stub(SubmitReceivedService, 'go').resolves({
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

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Select the return received date')
            expect(response.payload).to.contain('There is a problem')
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
          Sinon.stub(ReportedService, 'go').resolves({
            sessionId,
            licenceId: '3154ea03-e232-4c66-a711-a72956b7de61',
            pageTitle: 'How was this return reported?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('How was this return reported?')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the page has not been visited previously', () => {
          describe('and "Meter readings" has been selected', () => {
            beforeEach(() => {
              Sinon.stub(SubmitReportedService, 'go').resolves({ reported: 'meter-readings' })
            })

            it('redirects to the "start-reading" page', async () => {
              const response = await server.inject(_postOptions(path, {}))

              expect(response.statusCode).to.equal(302)
              expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/start-reading`)
            })
          })

          describe('and "Abstraction Volumes" has been selected', () => {
            beforeEach(() => {
              Sinon.stub(SubmitReportedService, 'go').resolves({ reported: 'abstraction-volumes' })
            })

            it('redirects to the "units" page', async () => {
              const response = await server.inject(_postOptions(path, {}))

              expect(response.statusCode).to.equal(302)
              expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/units`)
            })
          })
        })

        describe('and the page has been visited previously', () => {
          describe('and "Meter readings" has been selected', () => {
            beforeEach(() => {
              Sinon.stub(SubmitReportedService, 'go').resolves({ checkPageVisited: true, reported: 'meter-readings' })
            })

            it('redirects to the "start-reading" page', async () => {
              const response = await server.inject(_postOptions(path, {}))

              expect(response.statusCode).to.equal(302)
              expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/start-reading`)
            })
          })

          describe('and "Abstraction Volumes" has been selected', () => {
            beforeEach(() => {
              Sinon.stub(SubmitReportedService, 'go').resolves({
                checkPageVisited: true,
                reported: 'abstraction-volumes'
              })
            })

            it('redirects to the "check" page', async () => {
              const response = await server.inject(_postOptions(path, {}))

              expect(response.statusCode).to.equal(302)
              expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/check`)
            })
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
            Sinon.stub(SubmitReportedService, 'go').resolves({
              error: { text: 'Select how this return was reported' },
              pageTitle: 'How was this return reported?',
              sessionId
            })
          })

          it('re-renders the page with an error message', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Select how this return was reported')
            expect(response.payload).to.contain('There is a problem')
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
          Sinon.stub(SubmissionService, 'go').resolves({ pageTitle: 'Abstraction return' })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Abstraction return')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and "Enter and submit" has been selected', () => {
          beforeEach(() => {
            Sinon.stub(SubmitSubmissionService, 'go').resolves({ redirect: 'reported' })
          })

          it('redirects to the "reported" page', async () => {
            const response = await server.inject(_postOptions(path, { journey: 'enterReturn' }))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/reported`)
          })
        })

        describe('and "Enter a nil return" has been selected', () => {
          beforeEach(() => {
            Sinon.stub(SubmitSubmissionService, 'go').resolves({ redirect: 'check' })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, { journey: 'nilReturn' }))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/check`)
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
            Sinon.stub(SubmitSubmissionService, 'go').resolves({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/units', () => {
    const path = 'units'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(UnitsService, 'go').resolves({
            sessionId,
            licenceId: '3154ea03-e232-4c66-a711-a72956b7de61',
            pageTitle: 'Which units were used?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Which units were used?')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the page has not been visited previously', () => {
          beforeEach(() => {
            Sinon.stub(SubmitUnitsService, 'go').resolves({})
          })

          it('redirects to the "meter provided" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/meter-provided`)
          })
        })

        describe('and the page has been visited previously', () => {
          beforeEach(() => {
            Sinon.stub(SubmitUnitsService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/check`)
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
            Sinon.stub(SubmitUnitsService, 'go').resolves({
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

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Select which units were used')
            expect(response.payload).to.contain('There is a problem')
          })
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/meter-provided', () => {
    const path = 'meter-provided'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(MeterProvidedService, 'go').resolves({
            sessionId,
            licenceId: '3154ea03-e232-4c66-a711-a72956b7de61',
            pageTitle: 'Have meter details been provided?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Have meter details been provided?')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and a meter was provided', () => {
          beforeEach(() => {
            Sinon.stub(SubmitMeterProvidedService, 'go').resolves({ meterProvided: 'yes' })
          })

          it('redirects to the "meter details" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/meter-details`)
          })
        })

        describe('and a meter was not provided', () => {
          describe('and the page has not been visited previously', () => {
            beforeEach(() => {
              Sinon.stub(SubmitMeterProvidedService, 'go').resolves({ meterProvided: 'no' })
            })

            it('redirects to the "single volume" page', async () => {
              const response = await server.inject(_postOptions(path, {}))

              expect(response.statusCode).to.equal(302)
              expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/single-volume`)
            })
          })

          describe('and the page has been visited previously', () => {
            beforeEach(() => {
              Sinon.stub(SubmitMeterProvidedService, 'go').resolves({ checkPageVisited: true, meterProvided: 'no' })
            })

            it('redirects to the "check" page', async () => {
              const response = await server.inject(_postOptions(path, {}))

              expect(response.statusCode).to.equal(302)
              expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/check`)
            })
          })

          describe('and the reported type is "meter-readings"', () => {
            beforeEach(() => {
              Sinon.stub(SubmitMeterProvidedService, 'go').resolves({ meterProvided: 'no', reported: 'meter-readings' })
            })

            it('redirects to the "check" page', async () => {
              const response = await server.inject(_postOptions(path, {}))

              expect(response.statusCode).to.equal(302)
              expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/check`)
            })
          })
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(() => {
          Sinon.stub(SubmitMeterProvidedService, 'go').resolves({
            error: {
              errorList: [{ href: '#meterProvided', text: 'Select if meter details have been provided' }],
              meterProvided: { text: 'Select if meter details have been provided' }
            },
            pageTitle: 'Have meter details been provided?',
            sessionId
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(_postOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select if meter details have been provided')
          expect(response.payload).to.contain('There is a problem')
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
          Sinon.stub(MeterDetailsService, 'go').resolves({
            sessionId,
            pageTitle: 'Meter details'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Meter details')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the page has not been visited previously', () => {
          beforeEach(() => {
            Sinon.stub(SubmitMeterDetailsService, 'go').resolves({
              meterMake: 'Meter',
              meterSerialNumber: '1234',
              meter10TimesDisplay: 'no'
            })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/check`)
          })
        })

        describe('and the page has been visited previously', () => {
          beforeEach(() => {
            Sinon.stub(SubmitMeterDetailsService, 'go').resolves({
              checkPageVisited: true,
              meterMake: 'Meter',
              meterSerialNumber: '1234',
              meter10TimesDisplay: 'no'
            })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/check`)
          })
        })

        describe('and the reporting type is "abstraction-volumes"', () => {
          beforeEach(() => {
            Sinon.stub(SubmitMeterDetailsService, 'go').resolves({
              reported: 'abstraction-volumes',
              meterMake: 'Meter',
              meterSerialNumber: '1234',
              meter10TimesDisplay: 'no'
            })
          })

          it('redirects to the "single-volume" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/single-volume`)
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
            Sinon.stub(SubmitMeterDetailsService, 'go').resolves({
              error: {
                errorList: [{ href: '#meter-make', text: 'Enter the make of the meter' }],
                meterMake: { message: 'Enter the make of the meter' }
              },
              pageTitle: 'Have meter details been provided?',
              sessionId: 'Meter details'
            })
          })

          it('re-renders the page with an error message', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Enter the make of the meter')
            expect(response.payload).to.contain('There is a problem')
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
          Sinon.stub(MultipleEntriesService, 'go').resolves({
            sessionId,
            licenceId: '3154ea03-e232-4c66-a711-a72956b7de61',
            pageTitle: 'Enter multiple daily volumes'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Enter multiple daily volumes')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(SubmitMultipleEntriesService, 'go').resolves({})
        })

        it('redirects to the "check" page', async () => {
          const response = await server.inject(_postOptions(path, {}))

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/check`)
        })
      })

      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(() => {
            Sinon.stub(SubmitMultipleEntriesService, 'go').resolves({
              error: { text: 'Enter 12 daily volumes' },
              pageTitle: 'Enter multiple daily volumes',
              sessionId
            })
          })

          it('re-renders the page with an error message', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Enter 12 daily volumes')
            expect(response.payload).to.contain('There is a problem')
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
        Sinon.stub(NoteService, 'go').resolves({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Add a note'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Add a note')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(SubmitNoteService, 'go').resolves({})
        })

        it('redirects to the "check" page', async () => {
          const response = await server.inject(_postOptions(path, { journey: 'selectedOption' }))

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/check`)
        })
      })

      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(() => {
            Sinon.stub(SubmitNoteService, 'go').resolves({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
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
          Sinon.stub(PeriodUsedService, 'go').resolves({
            sessionId,
            licenceId: '3154ea03-e232-4c66-a711-a72956b7de61',
            pageTitle: 'What period was used for this volume?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('What period was used for this volume?')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(SubmitPeriodUsedService, 'go').resolves({})
        })

        it('redirects to the "check" page', async () => {
          const response = await server.inject(_postOptions(path, {}))

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/check`)
        })
      })

      describe('and the validation fails', () => {
        beforeEach(() => {
          Sinon.stub(SubmitPeriodUsedService, 'go').resolves({
            error: {
              errorList: [{ href: '#period-date-used-options', text: 'Select what period was used for this volume' }],
              meterMake: { message: 'Select what period was used for this volume' }
            },
            pageTitle: 'What period was used for this volume?',
            sessionId
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(_postOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select what period was used for this volume')
          expect(response.payload).to.contain('There is a problem')
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
          Sinon.stub(SingleVolumeService, 'go').resolves({
            sessionId,
            pageTitle: 'Is it a single volume?'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Is it a single volume?')
        })
      })
    })

    describe('POST', () => {
      describe('when a request is valid', () => {
        describe('and a single volume was provided', () => {
          beforeEach(() => {
            Sinon.stub(SubmitSingleVolumeService, 'go').resolves({
              singleVolume: 'yes',
              singleVolumeQuantity: '1000'
            })
          })

          it('redirects to the "period used" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/period-used`)
          })
        })

        describe('and a single volume was not provided', () => {
          beforeEach(() => {
            Sinon.stub(SubmitSingleVolumeService, 'go').resolves({
              singleVolume: 'no'
            })
          })

          it('redirects to the "check answers" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/check`)
          })
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(() => {
          Sinon.stub(SubmitSingleVolumeService, 'go').resolves({
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

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('SINGLE_VOLUME_ERROR')
          expect(response.payload).to.contain('There is a problem')
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
          Sinon.stub(StartReadingService, 'go').resolves({
            sessionId,
            pageTitle: 'Enter the start meter reading'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Enter the start meter reading')
        })
      })
    })

    describe('POST', () => {
      describe('when a request is valid', () => {
        describe('and the page has not been visited previously', () => {
          beforeEach(() => {
            Sinon.stub(SubmitStartReadingService, 'go').resolves({})
          })

          it('redirects to the "units" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/units`)
          })
        })

        describe('and the page has been visited previously', () => {
          beforeEach(() => {
            Sinon.stub(SubmitStartReadingService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/check`)
          })
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(() => {
          Sinon.stub(SubmitStartReadingService, 'go').resolves({
            error: {
              errorList: [{ text: 'Enter a start meter reading', href: '#startReading' }]
            },
            pageTitle: 'Enter the start meter reading',
            sessionId
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(_postOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Enter a start meter reading')
          expect(response.payload).to.contain('There is a problem')
        })
      })
    })
  })

  describe('return-logs/setup/{sessionId}/submission', () => {
    beforeEach(() => {
      path = 'submission'
    })

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(SubmissionService, 'go').resolves({ pageTitle: 'Abstraction return' })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Abstraction return')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the user selected "Record receipt"', () => {
          beforeEach(() => {
            Sinon.stub(SubmitSubmissionService, 'go').resolves({ redirect: 'reported' })
          })

          it('redirects to the "reported" page', async () => {
            const response = await server.inject(_postOptions(path, { journey: 'selectedOption' }))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/reported`)
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
            Sinon.stub(SubmitSubmissionService, 'go').resolves({
              error: {
                errorList: [{ href: '#journey', text: 'Select what you want to do with this return' }],
                journey: { text: 'Select what you want to do with this return' }
              }
            })
          })

          it('re-renders the page with an error message', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('what you want to do with this return')
            expect(response.payload).to.contain('There is a problem')
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
          Sinon.stub(VolumesService, 'go').resolves({ pageTitle: 'Water abstracted April 2023' })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Water abstracted April 2023')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation passes', () => {
          beforeEach(() => {
            Sinon.stub(SubmitVolumesService, 'go').resolves({})
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(_postOptions(path, {}))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/return-logs/setup/${sessionId}/check`)
          })
        })

        describe('and the validation fails', () => {
          beforeEach(() => {
            Sinon.stub(SubmitVolumesService, 'go').resolves({
              error: [
                {
                  href: '#2023-04-30T00:00:00.000Z',
                  text: 'Volumes must be a number or blank'
                }
              ],
              pageTitle: 'Water abstracted April 2023'
            })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Water abstracted April 2023')
            expect(response.payload).to.contain('There is a problem')
            expect(response.payload).to.contain('Volumes must be a number or blank')
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
      credentials: { scope: ['billing'] }
    }
  }
}

function _postOptions(path, payload) {
  return postRequestOptions(`/return-logs/setup/${sessionId}/${path}`, payload)
}
