// Test framework dependencies

// Test helpers
import http2 from 'node:http2'
const { HTTP_STATUS_FOUND, HTTP_STATUS_OK } = http2.constants
import { postRequestOptions } from '../support/general.js'

// Things we need to stub
import AbstractionPeriodService from '../../app/services/return-versions/setup/abstraction-period.service.js'
import AdditionalSubmissionOptionsService from '../../app/services/return-versions/setup/additional-submission-options.service.js'
import AgreementsExceptionService from '../../app/services/return-versions/setup/agreements-exceptions.service.js'
import CancelService from '../../app/services/return-versions/setup/cancel.service.js'
import CheckService from '../../app/services/return-versions/setup/check/check.service.js'
import DeleteNoteService from '../../app/services/return-versions/setup/delete-note.service.js'
import ExistingService from '../../app/services/return-versions/setup/existing/existing.service.js'
import FrequencyCollectedService from '../../app/services/return-versions/setup/frequency-collected.service.js'
import FrequencyReportedService from '../../app/services/return-versions/setup/frequency-reported.service.js'
import MethodService from '../../app/services/return-versions/setup/method/method.service.js'
import NoReturnsRequiredService from '../../app/services/return-versions/setup/no-returns-required.service.js'
import NoteService from '../../app/services/return-versions/setup/note.service.js'
import PointsService from '../../app/services/return-versions/setup/points.service.js'
import RemoveService from '../../app/services/return-versions/setup/remove.service.js'
import ReturnCycleService from '../../app/services/return-versions/setup/returns-cycle.service.js'
import SelectPurposeService from '../../app/services/return-versions/setup/purpose.service.js'
import SelectReasonService from '../../app/services/return-versions/setup/reason.service.js'
import SiteDescriptionService from '../../app/services/return-versions/setup/site-description.service.js'
import StartDateService from '../../app/services/return-versions/setup/start-date.service.js'
import SubmitAbstractionPeriod from '../../app/services/return-versions/setup/submit-abstraction-period.service.js'
import SubmitAgreementsExceptions from '../../app/services/return-versions/setup/submit-agreements-exceptions.service.js'
import SubmitCancelService from '../../app/services/return-versions/setup/submit-cancel.service.js'
import SubmitExistingService from '../../app/services/return-versions/setup/existing/submit-existing.service.js'
import SubmitFrequencyCollectedService from '../../app/services/return-versions/setup/submit-frequency-collected.service.js'
import SubmitFrequencyReportedService from '../../app/services/return-versions/setup/submit-frequency-reported.service.js'
import SubmitMethodService from '../../app/services/return-versions/setup/method/submit-method.service.js'
import SubmitNoReturnsRequiredService from '../../app/services/return-versions/setup/submit-no-returns-required.service.js'
import SubmitNoteService from '../../app/services/return-versions/setup/submit-note.service.js'
import SubmitPointsService from '../../app/services/return-versions/setup/submit-points.service.js'
import SubmitPurposeService from '../../app/services/return-versions/setup/submit-purpose.service.js'
import SubmitReasonService from '../../app/services/return-versions/setup/submit-reason.service.js'
import SubmitReturnsCycleService from '../../app/services/return-versions/setup/submit-returns-cycle.service.js'
import SubmitSiteDescriptionService from '../../app/services/return-versions/setup/submit-site-description.service.js'
import SubmitStartDateService from '../../app/services/return-versions/setup/submit-start-date.service.js'

// For running our service
import { init } from '../../app/server.js'

const sessionId = '64924759-8142-4a08-9d1e-1e902cd9d316'
const requirementIndex = 0

describe('Return Versions controller', () => {
  let server

  // Create server before running the tests
  beforeAll(async () => {
    server = await init()
  })

  beforeEach(async () => {
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

  describe('/return-versions/setup/{sessionId}/abstraction-period', () => {
    const path = 'abstraction-period'

    describe('GET', () => {
      beforeEach(async () => {
        vi.mock('../../app/services/return-versions/setup/abstraction-period.service.js')
        AbstractionPeriodService.mockResolvedValue({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Enter the abstraction period for the requirements for returns'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path, requirementIndex))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Enter the abstraction period for the requirements for returns')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-abstraction-period.service.js')
            SubmitAbstractionPeriod.mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-abstraction-period.service.js')
            SubmitAbstractionPeriod.mockResolvedValue({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/returns-cycle/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/returns-cycle/0')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-abstraction-period.service.js')
            SubmitAbstractionPeriod.mockResolvedValue({ checkPageVisited: true })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/additional-submission-options', () => {
    const path = 'additional-submission-options'

    describe('GET', () => {
      beforeEach(async () => {
        vi.mock('../../app/services/return-versions/setup/additional-submission-options.service.js')
        AdditionalSubmissionOptionsService.mockResolvedValue({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Select any additional submission options for the return requirements',
          additionalSubmissionOptions: []
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select any additional submission options for the return requirements')
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/note', () => {
    const path = 'note'

    describe('GET', () => {
      beforeEach(async () => {
        vi.mock('../../app/services/return-versions/setup/note.service.js')
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
          vi.mock('../../app/services/return-versions/setup/submit-note.service.js')
          SubmitNoteService.mockResolvedValue({})
        })

        it('redirects to the "check" page', async () => {
          const response = await server.inject(_postOptions(path, {}))

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/return-versions/setup/${sessionId}/check`)
        })
      })

      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(() => {
            vi.mock('../../app/services/return-versions/setup/submit-note.service.js')
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

  describe('/return-versions/setup/{sessionId}/agreements-exceptions', () => {
    const path = 'agreements-exceptions'

    describe('GET', () => {
      beforeEach(async () => {
        vi.mock('../../app/services/return-versions/setup/agreements-exceptions.service.js')
        AgreementsExceptionService.mockResolvedValue({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Select agreements and exceptions for the return requirement'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path, requirementIndex))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select agreements and exceptions for the return requirement')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-agreements-exceptions.service.js')
            SubmitAgreementsExceptions.mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-agreements-exceptions.service.js')
            SubmitAgreementsExceptions.mockResolvedValue({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{licenceId}/approved', () => {
    const path = 'approved'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Requirements for returns approved')
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/cancel', () => {
    const path = 'cancel'

    describe('GET', () => {
      beforeEach(async () => {
        vi.mock('../../app/services/return-versions/setup/cancel.service.js')
        CancelService.mockResolvedValue({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'You are about to cancel these requirements for returns'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('You are about to cancel these requirements for returns')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        const licenceId = '2c6d79e7-f25c-48ad-9af6-9ab5520a4b73'

        beforeEach(() => {
          vi.mock('../../app/services/return-versions/setup/submit-cancel.service.js')
          SubmitCancelService.mockResolvedValue()
        })

        it('redirects to the "check" page', async () => {
          const response = await server.inject(
            postRequestOptions(`/return-versions/setup/${sessionId}/${path}`, { licenceId })
          )

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/licences/${licenceId}/set-up`)
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/check', () => {
    const path = 'check'

    describe('GET', () => {
      beforeEach(async () => {
        vi.mock('../../app/services/return-versions/setup/check/check.service.js')
        CheckService.mockResolvedValue({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Check the return requirements for Acme Corp.'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Check the return requirements for')
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/delete-note', () => {
    const path = 'delete-note'

    describe('GET', () => {
      beforeEach(async () => {
        vi.mock('../../app/services/return-versions/setup/delete-note.service.js')
        DeleteNoteService.mockResolvedValue({
          title: 'Removed',
          text: 'Note removed'
        })
      })

      it('redirects on success', async () => {
        const result = await server.inject(_getOptions(path))

        expect(result.statusCode).toEqual(HTTP_STATUS_FOUND)
        expect(result.headers.location).toEqual(`/system/return-versions/setup/${sessionId}/check`)
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/existing', () => {
    const path = 'existing'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(async () => {
          vi.mock('../../app/services/return-versions/setup/existing/existing.service.js')
          ExistingService.mockResolvedValue({
            id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
            pageTitle: 'Use previous requirements for returns'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Use previous requirements for returns')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/existing/submit-existing.service.js')
            SubmitExistingService.mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the validation succeeds', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/existing/submit-existing.service.js')
            SubmitExistingService.mockResolvedValue({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/frequency-collected', () => {
    const path = 'frequency-collected'

    describe('GET ', () => {
      beforeEach(async () => {
        vi.mock('../../app/services/return-versions/setup/frequency-collected.service.js')
        FrequencyCollectedService.mockResolvedValue({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Select how often readings or volumes are collected'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path, requirementIndex))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select how often readings or volumes are collected')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-frequency-collected.service.js')
            SubmitFrequencyCollectedService.mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-frequency-collected.service.js')
            SubmitFrequencyCollectedService.mockResolvedValue({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/frequency-reported/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(
              '/system/return-versions/setup/' + sessionId + '/frequency-reported/0'
            )
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-frequency-collected.service.js')
            SubmitFrequencyCollectedService.mockResolvedValue({ checkPageVisited: true })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/frequency-reported', () => {
    const path = 'frequency-reported'

    describe('GET', () => {
      beforeEach(async () => {
        vi.mock('../../app/services/return-versions/setup/frequency-reported.service.js')
        FrequencyReportedService.mockResolvedValue({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Select how often readings or volumes are reported'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path, requirementIndex))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select how often readings or volumes are reported')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-frequency-reported.service.js')
            SubmitFrequencyReportedService.mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-frequency-reported.service.js')
            SubmitFrequencyReportedService.mockResolvedValue({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/agreements-exceptions/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(
              '/system/return-versions/setup/' + sessionId + '/agreements-exceptions/0'
            )
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-frequency-reported.service.js')
            SubmitFrequencyReportedService.mockResolvedValue({ checkPageVisited: true })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/method', () => {
    const path = 'method'

    describe('GET', () => {
      beforeEach(async () => {
        vi.mock('../../app/services/return-versions/setup/method/method.service.js')
        MethodService.mockResolvedValue({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'How do you want to set up the requirements for returns?'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('How do you want to set up the requirements for returns?')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/method/submit-method.service.js')
            SubmitMethodService.mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the validation passes', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/method/submit-method.service.js')
            SubmitMethodService.mockResolvedValue({ redirect: 'page-data-redirect' })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/{pageData.redirect}', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(
              '/system/return-versions/setup/' + sessionId + '/page-data-redirect'
            )
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/no-returns-required', () => {
    const path = 'no-returns-required'

    describe('GET', () => {
      beforeEach(async () => {
        vi.mock('../../app/services/return-versions/setup/no-returns-required.service.js')
        NoReturnsRequiredService.mockResolvedValue({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Why are no returns required?'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Why are no returns required?')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation passes', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-no-returns-required.service.js')
            SubmitNoReturnsRequiredService.mockResolvedValue({})
          })

          it('redirects to /system/return-versions/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/check')
          })
        })

        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-no-returns-required.service.js')
            SubmitNoReturnsRequiredService.mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/points', () => {
    const path = 'points'

    describe('GET', () => {
      beforeEach(async () => {
        vi.mock('../../app/services/return-versions/setup/points.service.js')
        PointsService.mockResolvedValue({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Select the points for the requirements for returns'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path, requirementIndex))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select the points for the requirements for returns')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-points.service.js')
            SubmitPointsService.mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-points.service.js')
            SubmitPointsService.mockResolvedValue({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/abstraction-period/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(
              '/system/return-versions/setup/' + sessionId + '/abstraction-period/0'
            )
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-points.service.js')
            SubmitPointsService.mockResolvedValue({ checkPageVisited: true })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/purpose', () => {
    const path = 'purpose'

    describe('GET', () => {
      beforeEach(async () => {
        vi.mock('../../app/services/return-versions/setup/purpose.service.js')
        SelectPurposeService.mockResolvedValue({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Select the purpose for the requirement for returns'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path, requirementIndex))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select the purpose for the requirement for returns')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-purpose.service.js')
            SubmitPurposeService.mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-purpose.service.js')
            SubmitPurposeService.mockResolvedValue({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/points/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/points/0')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-purpose.service.js')
            SubmitPurposeService.mockResolvedValue({ checkPageVisited: true })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/reason', () => {
    const path = 'reason'

    describe('GET', () => {
      beforeEach(async () => {
        vi.mock('../../app/services/return-versions/setup/reason.service.js')
        SelectReasonService.mockResolvedValue({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Select the reason for the requirements for returns'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select the reason for the requirements for returns')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-reason.service.js')
            SubmitReasonService.mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-reason.service.js')
            SubmitReasonService.mockResolvedValue({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/method', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/method')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-reason.service.js')
            SubmitReasonService.mockResolvedValue({ checkPageVisited: true })
          })

          it('redirects to /system/return-versions/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/remove', () => {
    const path = 'remove'

    describe('GET', () => {
      beforeEach(async () => {
        vi.mock('../../app/services/return-versions/setup/remove.service.js')
        RemoveService.mockResolvedValue({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'You are about to remove these requirements for returns'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path, requirementIndex))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('You are about to remove these requirements for returns')
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/returns-cycle', () => {
    const path = 'returns-cycle'

    describe('GET', () => {
      beforeEach(async () => {
        vi.mock('../../app/services/return-versions/setup/returns-cycle.service.js')
        ReturnCycleService.mockResolvedValue({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Select the returns cycle for the return requirement'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path, requirementIndex))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select the returns cycle for the return requirement')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-returns-cycle.service.js')
            SubmitReturnsCycleService.mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-returns-cycle.service.js')
            SubmitReturnsCycleService.mockResolvedValue({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/site-description/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(
              '/system/return-versions/setup/' + sessionId + '/site-description/0'
            )
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-returns-cycle.service.js')
            SubmitReturnsCycleService.mockResolvedValue({ checkPageVisited: true })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/site-description', () => {
    const path = 'site-description'

    describe('GET', () => {
      beforeEach(async () => {
        vi.mock('../../app/services/return-versions/setup/site-description.service.js')
        SiteDescriptionService.mockResolvedValue({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Enter a site description for the requirements for returns'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path, requirementIndex))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Enter a site description for the requirements for returns')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-site-description.service.js')
            SubmitSiteDescriptionService.mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-site-description.service.js')
            SubmitSiteDescriptionService.mockResolvedValue({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/frequency-collected/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(
              '/system/return-versions/setup/' + sessionId + '/frequency-collected/0'
            )
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-site-description.service.js')
            SubmitSiteDescriptionService.mockResolvedValue({ checkPageVisited: true })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/start-date', () => {
    const path = 'start-date'

    describe('GET', () => {
      beforeEach(async () => {
        vi.mock('../../app/services/return-versions/setup/start-date.service.js')
        StartDateService.mockResolvedValue({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Select the start date for the requirements for returns'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select the start date for the requirements for returns')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-start-date.service.js')
            SubmitStartDateService.mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(postRequestOptions(`/return-versions/setup/${sessionId}/${path}`))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the journey is returns-required', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-start-date.service.js')
            SubmitStartDateService.mockResolvedValue({ journey: 'returns-required' })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/reason', async () => {
            const response = await server.inject(postRequestOptions(`/return-versions/setup/${sessionId}/${path}`))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/reason')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-start-date.service.js')
            SubmitStartDateService.mockResolvedValue({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/no-returns-required', async () => {
            const response = await server.inject(postRequestOptions(`/return-versions/setup/${sessionId}/${path}`))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(
              '/system/return-versions/setup/' + sessionId + '/no-returns-required'
            )
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            vi.mock('../../app/services/return-versions/setup/submit-start-date.service.js')
            SubmitStartDateService.mockResolvedValue({ checkPageVisited: true })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(postRequestOptions(`/return-versions/setup/${sessionId}/${path}`))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })
})

function _getOptions(path, index = -1) {
  let url = `/return-versions/setup/${sessionId}/${path}`

  if (index > -1) {
    url = `${url}/${index}`
  }

  return {
    method: 'GET',
    url,
    auth: {
      strategy: 'session',
      credentials: { scope: ['billing'] }
    }
  }
}

function _postOptions(path, index = -1, payload) {
  let url = `/return-versions/setup/${sessionId}/${path}`

  if (index > -1) {
    url = `${url}/${index}`
  }

  return postRequestOptions(url, payload)
}
