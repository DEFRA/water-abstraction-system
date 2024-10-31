'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Test helpers
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const AbstractionPeriodService = require('../../app/services/return-versions/setup/abstraction-period.service.js')
const AdditionalSubmissionOptionsService = require('../../app/services/return-versions/setup/additional-submission-options.service.js')
const AgreementsExceptionService = require('../../app/services/return-versions/setup/agreements-exceptions.service.js')
const CancelService = require('../../app/services/return-versions/setup/cancel.service.js')
const CheckService = require('../../app/services/return-versions/setup/check/check.service.js')
const DeleteNoteService = require('../../app/services/return-versions/setup/delete-note.service.js')
const ExistingService = require('../../app/services/return-versions/setup/existing.service.js')
const FrequencyCollectedService = require('../../app/services/return-versions/setup/frequency-collected.service.js')
const FrequencyReportedService = require('../../app/services/return-versions/setup/frequency-reported.service.js')
const MethodService = require('../../app/services/return-versions/setup/method/method.service.js')
const NoReturnsRequiredService = require('../../app/services/return-versions/setup/no-returns-required.service.js')
const NoteService = require('../../app/services/return-versions/setup/note.service.js')
const PointsService = require('../../app/services/return-versions/setup/points.service.js')
const RemoveService = require('../../app/services/return-versions/setup/remove.service.js')
const ReturnCycleService = require('../../app/services/return-versions/setup/returns-cycle.service.js')
const SelectPurposeService = require('../../app/services/return-versions/setup/purpose.service.js')
const SelectReasonService = require('../../app/services/return-versions/setup/reason.service.js')
const SiteDescriptionService = require('../../app/services/return-versions/setup/site-description.service.js')
const StartDateService = require('../../app/services/return-versions/setup/start-date.service.js')
const SubmitAbstractionPeriod = require('../../app/services/return-versions/setup/submit-abstraction-period.service.js')
const SubmitAgreementsExceptions = require('../../app/services/return-versions/setup/submit-agreements-exceptions.service.js')
const SubmitExistingService = require('../../app/services/return-versions/setup/submit-existing.service.js')
const SubmitFrequencyCollectedService = require('../../app/services/return-versions/setup/submit-frequency-collected.service.js')
const SubmitFrequencyReportedService = require('../../app/services/return-versions/setup/submit-frequency-reported.service.js')
const SubmitMethodService = require('../../app/services/return-versions/setup/method/submit-method.service.js')
const SubmitNoReturnsRequiredService = require('../../app/services/return-versions/setup/submit-no-returns-required.service.js')
const SubmitPointsService = require('../../app/services/return-versions/setup/submit-points.service.js')
const SubmitPurposeService = require('../../app/services/return-versions/setup/submit-purpose.service.js')
const SubmitReasonService = require('../../app/services/return-versions/setup/submit-reason.service.js')
const SubmitReturnsCycleService = require('../../app/services/return-versions/setup/submit-returns-cycle.service.js')
const SubmitSiteDescriptionService = require('../../app/services/return-versions/setup/submit-site-description.service.js')
const SubmitStartDateService = require('../../app/services/return-versions/setup/submit-start-date.service.js')

// For running our service
const { init } = require('../../app/server.js')

const sessionId = '64924759-8142-4a08-9d1e-1e902cd9d316'
const requirementIndex = 0

describe('Return Versions controller', () => {
  let server

  beforeEach(async () => {
    // Create server before each test
    server = await init()

    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('/return-versions/setup/{sessionId}/abstraction-period', () => {
    const path = 'abstraction-period'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(AbstractionPeriodService, 'go').resolves({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Enter the abstraction period for the requirements for returns'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path, requirementIndex))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Enter the abstraction period for the requirements for returns')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitAbstractionPeriod, 'go').resolves({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitAbstractionPeriod, 'go').resolves({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/returns-cycle/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/returns-cycle/0')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitAbstractionPeriod, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/additional-submission-options', () => {
    const path = 'additional-submission-options'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(AdditionalSubmissionOptionsService, 'go').resolves({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Select any additional submission options for the return requirements',
          additionalSubmissionOptions: []
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select any additional submission options for the return requirements')
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/note', () => {
    const path = 'note'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(NoteService, 'go').resolves({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Add a note'
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
  })

  describe('/return-versions/setup/{sessionId}/agreements-exceptions', () => {
    const path = 'agreements-exceptions'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(AgreementsExceptionService, 'go').resolves({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Select agreements and exceptions for the return requirement'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path, requirementIndex))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select agreements and exceptions for the return requirement')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitAgreementsExceptions, 'go').resolves({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitAgreementsExceptions, 'go').resolves({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/check')
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

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Requirements for returns approved')
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/cancel', () => {
    const path = 'cancel'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(CancelService, 'go').resolves({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'You are about to cancel these requirements for returns'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('You are about to cancel these requirements for returns')
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/check', () => {
    const path = 'check'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(CheckService, 'go').resolves({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Check the return requirements for Acme Corp.'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Check the return requirements for')
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/delete-note', () => {
    const path = 'delete-note'

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
        expect(result.headers.location).to.equal(`/system/return-versions/setup/${sessionId}/check`)
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/existing', () => {
    const path = 'existing'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(async () => {
          Sinon.stub(ExistingService, 'go').resolves({
            id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Use previous requirements for returns'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Use previous requirements for returns')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitExistingService, 'go').resolves({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })

        describe('and the validation succeeds', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitExistingService, 'go').resolves({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/frequency-collected', () => {
    const path = 'frequency-collected'

    describe('GET ', () => {
      beforeEach(async () => {
        Sinon.stub(FrequencyCollectedService, 'go').resolves({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Select how often readings or volumes are collected'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path, requirementIndex))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select how often readings or volumes are collected')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitFrequencyCollectedService, 'go').resolves({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitFrequencyCollectedService, 'go').resolves({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/frequency-reported/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/frequency-reported/0')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitFrequencyCollectedService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/frequency-reported', () => {
    const path = 'frequency-reported'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(FrequencyReportedService, 'go').resolves({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Select how often readings or volumes are reported'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path, requirementIndex))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select how often readings or volumes are reported')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitFrequencyReportedService, 'go').resolves({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitFrequencyReportedService, 'go').resolves({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/agreements-exceptions/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/agreements-exceptions/0')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitFrequencyReportedService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/method', () => {
    const path = 'method'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(MethodService, 'go').resolves({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'How do you want to set up the requirements for returns?'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('How do you want to set up the requirements for returns?')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitMethodService, 'go').resolves({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })

        describe('and the validation passes', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitMethodService, 'go').resolves({ redirect: 'page-data-redirect' })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/{pageData.redirect}', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/page-data-redirect')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/no-returns-required', () => {
    const path = 'no-returns-required'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(NoReturnsRequiredService, 'go').resolves({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Why are no returns required?'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Why are no returns required?')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation passes', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitNoReturnsRequiredService, 'go').resolves({ })
          })

          it('redirects to /system/return-versions/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/check')
          })
        })

        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitNoReturnsRequiredService, 'go').resolves({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/points', () => {
    const path = 'points'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(PointsService, 'go').resolves({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Select the points for the requirements for returns'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path, requirementIndex))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select the points for the requirements for returns')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitPointsService, 'go').resolves({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitPointsService, 'go').resolves({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/abstraction-period/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/abstraction-period/0')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitPointsService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/purpose', () => {
    const path = 'purpose'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(SelectPurposeService, 'go').resolves({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Select the purpose for the requirement for returns'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path, requirementIndex))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select the purpose for the requirement for returns')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitPurposeService, 'go').resolves({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitPurposeService, 'go').resolves({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/points/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/points/0')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitPurposeService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/reason', () => {
    const path = 'reason'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(SelectReasonService, 'go').resolves({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Select the reason for the requirements for returns'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select the reason for the requirements for returns')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitReasonService, 'go').resolves({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitReasonService, 'go').resolves({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/method', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/method')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitReasonService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to /system/return-versions/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/remove', () => {
    const path = 'remove'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(RemoveService, 'go').resolves({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'You are about to remove these requirements for returns'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path, requirementIndex))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('You are about to remove these requirements for returns')
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/returns-cycle', () => {
    const path = 'returns-cycle'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(ReturnCycleService, 'go').resolves({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Select the returns cycle for the return requirement'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path, requirementIndex))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select the returns cycle for the return requirement')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitReturnsCycleService, 'go').resolves({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitReturnsCycleService, 'go').resolves({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/site-description/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/site-description/0')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitReturnsCycleService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/site-description', () => {
    const path = 'site-description'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(SiteDescriptionService, 'go').resolves({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
          pageTitle: 'Enter a site description for the requirements for returns'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path, requirementIndex))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Enter a site description for the requirements for returns')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitSiteDescriptionService, 'go').resolves({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitSiteDescriptionService, 'go').resolves({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/frequency-collected/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/frequency-collected/0')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitSiteDescriptionService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-versions/setup/{sessionId}/start-date', () => {
    const path = 'start-date'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(StartDateService, 'go').resolves({
          id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Select the start date for the requirements for returns'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select the start date for the requirements for returns')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitStartDateService, 'go').resolves({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(postRequestOptions(`/return-versions/setup/${sessionId}/${path}`))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })

        describe('and the journey is returns-required', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitStartDateService, 'go').resolves({ journey: 'returns-required' })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/reason', async () => {
            const response = await server.inject(postRequestOptions(`/return-versions/setup/${sessionId}/${path}`))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/reason')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitStartDateService, 'go').resolves({})
          })

          it('redirects to /system/return-versions/setup/{sessionId}/no-returns-required', async () => {
            const response = await server.inject(postRequestOptions(`/return-versions/setup/${sessionId}/${path}`))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/no-returns-required')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitStartDateService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to /system/return-versions/setup/{sessionId}/check', async () => {
            const response = await server.inject(postRequestOptions(`/return-versions/setup/${sessionId}/${path}`))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-versions/setup/' + sessionId + '/check')
          })
        })
      })
    })
  })
})

function _getOptions (path, index = -1) {
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

function _postOptions (path, index = -1, payload) {
  let url = `/return-versions/setup/${sessionId}/${path}`

  if (index > -1) {
    url = `${url}/${index}`
  }

  return postRequestOptions(url, payload)
}
