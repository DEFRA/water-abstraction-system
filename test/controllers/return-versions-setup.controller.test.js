// Test framework
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import http2 from 'node:http2'
import { postRequestOptions } from '../support/general.js'

// Things we need to stub
import * as AbstractionPeriodService from '../../app/services/return-versions/setup/abstraction-period.service.js'
import * as AdditionalSubmissionOptionsService from '../../app/services/return-versions/setup/additional-submission-options.service.js'
import * as AgreementsExceptionService from '../../app/services/return-versions/setup/agreements-exceptions.service.js'
import * as CancelService from '../../app/services/return-versions/setup/cancel.service.js'
import * as CheckService from '../../app/services/return-versions/setup/check/check.service.js'
import * as DeleteNoteService from '../../app/services/return-versions/setup/delete-note.service.js'
import * as ExistingService from '../../app/services/return-versions/setup/existing/existing.service.js'
import * as FrequencyCollectedService from '../../app/services/return-versions/setup/frequency-collected.service.js'
import * as FrequencyReportedService from '../../app/services/return-versions/setup/frequency-reported.service.js'
import * as MethodService from '../../app/services/return-versions/setup/method/method.service.js'
import * as NoReturnsRequiredService from '../../app/services/return-versions/setup/no-returns-required.service.js'
import * as NoteService from '../../app/services/return-versions/setup/note.service.js'
import * as PointsService from '../../app/services/return-versions/setup/points.service.js'
import * as RemoveService from '../../app/services/return-versions/setup/remove.service.js'
import * as ReturnCycleService from '../../app/services/return-versions/setup/returns-cycle.service.js'
import * as SelectPurposeService from '../../app/services/return-versions/setup/purpose.service.js'
import * as SelectReasonService from '../../app/services/return-versions/setup/reason.service.js'
import * as SiteDescriptionService from '../../app/services/return-versions/setup/site-description.service.js'
import * as StartDateService from '../../app/services/return-versions/setup/start-date.service.js'
import * as SubmitAbstractionPeriod from '../../app/services/return-versions/setup/submit-abstraction-period.service.js'
import * as SubmitAgreementsExceptions from '../../app/services/return-versions/setup/submit-agreements-exceptions.service.js'
import * as SubmitCancelService from '../../app/services/return-versions/setup/submit-cancel.service.js'
import * as SubmitExistingService from '../../app/services/return-versions/setup/existing/submit-existing.service.js'
import * as SubmitFrequencyCollectedService from '../../app/services/return-versions/setup/submit-frequency-collected.service.js'
import * as SubmitFrequencyReportedService from '../../app/services/return-versions/setup/submit-frequency-reported.service.js'
import * as SubmitMethodService from '../../app/services/return-versions/setup/method/submit-method.service.js'
import * as SubmitNoReturnsRequiredService from '../../app/services/return-versions/setup/submit-no-returns-required.service.js'
import * as SubmitNoteService from '../../app/services/return-versions/setup/submit-note.service.js'
import * as SubmitPointsService from '../../app/services/return-versions/setup/submit-points.service.js'
import * as SubmitPurposeService from '../../app/services/return-versions/setup/submit-purpose.service.js'
import * as SubmitReasonService from '../../app/services/return-versions/setup/submit-reason.service.js'
import * as SubmitReturnsCycleService from '../../app/services/return-versions/setup/submit-returns-cycle.service.js'
import * as SubmitSiteDescriptionService from '../../app/services/return-versions/setup/submit-site-description.service.js'
import * as SubmitStartDateService from '../../app/services/return-versions/setup/submit-start-date.service.js'

// For running our service
import { init } from '../../app/server.js'

const { HTTP_STATUS_FOUND, HTTP_STATUS_OK } = http2.constants

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
        vi.spyOn(AbstractionPeriodService, 'default').mockResolvedValue({
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
            vi.spyOn(SubmitAbstractionPeriod, 'default').mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitAbstractionPeriod, 'default').mockResolvedValue({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/returns-cycle/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/returns-cycle/0')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitAbstractionPeriod, 'default').mockResolvedValue({ checkPageVisited: true })
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
        vi.spyOn(AdditionalSubmissionOptionsService, 'default').mockResolvedValue({
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
        vi.spyOn(NoteService, 'default').mockResolvedValue({
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
          vi.spyOn(SubmitNoteService, 'default').mockResolvedValue({})
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
            vi.spyOn(SubmitNoteService, 'default').mockResolvedValue({ error: {} })
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
        vi.spyOn(AgreementsExceptionService, 'default').mockResolvedValue({
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
            vi.spyOn(SubmitAgreementsExceptions, 'default').mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitAgreementsExceptions, 'default').mockResolvedValue({})
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
        vi.spyOn(CancelService, 'default').mockResolvedValue({
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
          vi.spyOn(SubmitCancelService, 'default').mockResolvedValue()
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
        vi.spyOn(CheckService, 'default').mockResolvedValue({
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
        vi.spyOn(DeleteNoteService, 'default').mockResolvedValue({
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
          vi.spyOn(ExistingService, 'default').mockResolvedValue({
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
            vi.spyOn(SubmitExistingService, 'default').mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the validation succeeds', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitExistingService, 'default').mockResolvedValue({})
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
        vi.spyOn(FrequencyCollectedService, 'default').mockResolvedValue({
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
            vi.spyOn(SubmitFrequencyCollectedService, 'default').mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitFrequencyCollectedService, 'default').mockResolvedValue({})
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
            vi.spyOn(SubmitFrequencyCollectedService, 'default').mockResolvedValue({ checkPageVisited: true })
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
        vi.spyOn(FrequencyReportedService, 'default').mockResolvedValue({
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
            vi.spyOn(SubmitFrequencyReportedService, 'default').mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitFrequencyReportedService, 'default').mockResolvedValue({})
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
            vi.spyOn(SubmitFrequencyReportedService, 'default').mockResolvedValue({ checkPageVisited: true })
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
        vi.spyOn(MethodService, 'default').mockResolvedValue({
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
            vi.spyOn(SubmitMethodService, 'default').mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the validation passes', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitMethodService, 'default').mockResolvedValue({ redirect: 'page-data-redirect' })
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
        vi.spyOn(NoReturnsRequiredService, 'default').mockResolvedValue({
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
            vi.spyOn(SubmitNoReturnsRequiredService, 'default').mockResolvedValue({})
          })

          it('redirects to /system/return-versions/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/check')
          })
        })

        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitNoReturnsRequiredService, 'default').mockResolvedValue({ error: {} })
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
        vi.spyOn(PointsService, 'default').mockResolvedValue({
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
            vi.spyOn(SubmitPointsService, 'default').mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitPointsService, 'default').mockResolvedValue({})
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
            vi.spyOn(SubmitPointsService, 'default').mockResolvedValue({ checkPageVisited: true })
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
        vi.spyOn(SelectPurposeService, 'default').mockResolvedValue({
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
            vi.spyOn(SubmitPurposeService, 'default').mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitPurposeService, 'default').mockResolvedValue({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/points/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/points/0')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitPurposeService, 'default').mockResolvedValue({ checkPageVisited: true })
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
        vi.spyOn(SelectReasonService, 'default').mockResolvedValue({
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
            vi.spyOn(SubmitReasonService, 'default').mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitReasonService, 'default').mockResolvedValue({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/method', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/method')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitReasonService, 'default').mockResolvedValue({ checkPageVisited: true })
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
        vi.spyOn(RemoveService, 'default').mockResolvedValue({
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
        vi.spyOn(ReturnCycleService, 'default').mockResolvedValue({
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
            vi.spyOn(SubmitReturnsCycleService, 'default').mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitReturnsCycleService, 'default').mockResolvedValue({})
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
            vi.spyOn(SubmitReturnsCycleService, 'default').mockResolvedValue({ checkPageVisited: true })
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
        vi.spyOn(SiteDescriptionService, 'default').mockResolvedValue({
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
            vi.spyOn(SubmitSiteDescriptionService, 'default').mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitSiteDescriptionService, 'default').mockResolvedValue({})
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
            vi.spyOn(SubmitSiteDescriptionService, 'default').mockResolvedValue({ checkPageVisited: true })
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
        vi.spyOn(StartDateService, 'default').mockResolvedValue({
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
            vi.spyOn(SubmitStartDateService, 'default').mockResolvedValue({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(postRequestOptions(`/return-versions/setup/${sessionId}/${path}`))

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the journey is returns-required', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitStartDateService, 'default').mockResolvedValue({ journey: 'returns-required' })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/reason', async () => {
            const response = await server.inject(postRequestOptions(`/return-versions/setup/${sessionId}/${path}`))

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/return-versions/setup/' + sessionId + '/reason')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitStartDateService, 'default').mockResolvedValue({})
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
            vi.spyOn(SubmitStartDateService, 'default').mockResolvedValue({ checkPageVisited: true })
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
