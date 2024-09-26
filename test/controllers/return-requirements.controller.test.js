'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const AbstractionPeriodService = require('../../app/services/return-requirements/abstraction-period.service.js')
const AdditionalSubmissionOptionsService = require('../../app/services/return-requirements/additional-submission-options.service.js')
const AgreementsExceptionService = require('../../app/services/return-requirements/agreements-exceptions.service.js')
const CancelService = require('../../app/services/return-requirements/cancel.service.js')
const CheckService = require('../../app/services/return-requirements/check.service.js')
const DeleteNoteService = require('../../app/services/return-requirements/delete-note.service.js')
const FrequencyCollectedService = require('../../app/services/return-requirements/frequency-collected.service.js')
const FrequencyReportedService = require('../../app/services/return-requirements/frequency-reported.service.js')
const ExistingService = require('../../app/services/return-requirements/existing.service.js')
const NoReturnsRequiredService = require('../../app/services/return-requirements/no-returns-required.service.js')
const NoteService = require('../../app/services/return-requirements/note.service.js')
const PointsService = require('../../app/services/return-requirements/points.service.js')
const RemoveService = require('../../app/services/return-requirements/remove.service.js')
const ReturnCycleService = require('../../app/services/return-requirements/returns-cycle.service.js')
const SelectPurposeService = require('../../app/services/return-requirements/purpose.service.js')
const SelectReasonService = require('../../app/services/return-requirements/reason.service.js')
const SetupService = require('../../app/services/return-requirements/setup/setup.service.js')
const SiteDescriptionService = require('../../app/services/return-requirements/site-description.service.js')
const StartDateService = require('../../app/services/return-requirements/start-date.service.js')
const SubmitAbstractionPeriod = require('../../app/services/return-requirements/submit-abstraction-period.service.js')
const SubmitAgreementsExceptions = require('../../app/services/return-requirements/submit-agreements-exceptions.service.js')
const SubmitExistingService = require('../../app/services/return-requirements/submit-existing.service.js')
const SubmitFrequencyCollectedService = require('../../app/services/return-requirements/submit-frequency-collected.service.js')
const SubmitFrequencyReportedService = require('../../app/services/return-requirements/submit-frequency-reported.service.js')
const SubmitNoReturnsRequiredService = require('../../app/services/return-requirements/submit-no-returns-required.service.js')
const SubmitPointsService = require('../../app/services/return-requirements/submit-points.service.js')
const SubmitPurposeService = require('../../app/services/return-requirements/submit-purpose.service.js')
const SubmitReasonService = require('../../app/services/return-requirements/submit-reason.service.js')
const SubmitReturnsCycleService = require('../../app/services/return-requirements/submit-returns-cycle.service.js')
const SubmitSetupService = require('../../app/services/return-requirements/setup/submit-setup.service.js')
const SubmitSiteDescriptionService = require('../../app/services/return-requirements/submit-site-description.service.js')
const SubmitStartDateService = require('../../app/services/return-requirements/submit-start-date.service.js')
const ViewService = require('../../app/services/return-requirements/view.service.js')

// For running our service
const { init } = require('../../app/server.js')

const sessionId = '64924759-8142-4a08-9d1e-1e902cd9d316'
const requirementIndex = 0

describe.only('Return requirements controller', () => {
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

  describe('/return-requirements/{sessionId}/abstraction-period', () => {
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

          it('redirects to /system/return-requirements/{sessionId}/returns-cycle/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/returns-cycle/0')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitAbstractionPeriod, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to /system/return-requirements/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-requirements/{sessionId}/additional-submission-options', () => {
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

  describe('/return-requirements/{sessionId}/note', () => {
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

  describe('/return-requirements/{sessionId}/agreements-exceptions', () => {
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

          it('redirects to /system/return-requirements/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-requirements/{licenceId}/approved', () => {
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

  describe('/return-requirements/{sessionId}/cancel', () => {
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

  describe('/return-requirements/{sessionId}/check', () => {
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

  describe('/return-requirements/{sessionId}/delete-note', () => {
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
        expect(result.headers.location).to.equal(`/system/return-requirements/${sessionId}/check`)
      })
    })
  })

  describe('/return-requirements/{sessionId}/existing', () => {
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

          it('redirects to /system/return-requirements/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-requirements/{sessionId}/frequency-collected', () => {
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

          it('redirects to /system/return-requirements/{sessionId}/frequency-reported/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/frequency-reported/0')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitFrequencyCollectedService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to /system/return-requirements/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-requirements/{sessionId}/frequency-reported', () => {
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

          it('redirects to /system/return-requirements/{sessionId}/agreements-exceptions/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/agreements-exceptions/0')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitFrequencyReportedService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to /system/return-requirements/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-requirements/{sessionId}/no-returns-required', () => {
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

          it('redirects to /system/return-requirements/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/check')
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

  describe('/return-requirements/{sessionId}/points', () => {
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

          it('redirects to /system/return-requirements/{sessionId}/abstraction-period/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/abstraction-period/0')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitPointsService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to /system/return-requirements/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-requirements/{sessionId}/purpose', () => {
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

          it('redirects to /system/return-requirements/{sessionId}/points/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/points/0')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitPurposeService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to /system/return-requirements/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-requirements/{sessionId}/reason', () => {
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

          it('redirects to /system/return-requirements/{sessionId}/setup', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/setup')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitReasonService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to /system/return-requirements/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-requirements/{sessionId}/remove', () => {
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

  describe('/return-requirements/{sessionId}/returns-cycle', () => {
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

          it('redirects to /system/return-requirements/{sessionId}/site-description/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/site-description/0')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitReturnsCycleService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to /system/return-requirements/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-requirements/{sessionId}/setup', () => {
    const path = 'setup'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(SetupService, 'go').resolves({
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
            Sinon.stub(SubmitSetupService, 'go').resolves({ error: {} })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })

        describe('and the validation passes', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitSetupService, 'go').resolves({ redirect: 'page-data-redirect' })
          })

          it('redirects to /system/return-requirements/{sessionId}/{pageData.redirect}', async () => {
            const response = await server.inject(_postOptions(path))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/page-data-redirect')
          })
        })
      })
    })
  })

  describe('/return-requirements/{sessionId}/site-description', () => {
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

          it('redirects to /system/return-requirements/{sessionId}/frequency-collected/{requirementIndex}', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/frequency-collected/0')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitSiteDescriptionService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to /system/return-requirements/{sessionId}/check', async () => {
            const response = await server.inject(_postOptions(path, requirementIndex))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-requirements/{sessionId}/start-date', () => {
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
            const response = await server.inject(postRequestOptions(`/return-requirements/${sessionId}/${path}`))

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })

        describe('and the journey is returns-required', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitStartDateService, 'go').resolves({ journey: 'returns-required' })
          })

          it('redirects to /system/return-requirements/{sessionId}/reason', async () => {
            const response = await server.inject(postRequestOptions(`/return-requirements/${sessionId}/${path}`))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/reason')
          })
        })

        describe('and the page has not been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitStartDateService, 'go').resolves({})
          })

          it('redirects to /system/return-requirements/{sessionId}/no-returns-required', async () => {
            const response = await server.inject(postRequestOptions(`/return-requirements/${sessionId}/${path}`))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/no-returns-required')
          })
        })

        describe('and the page has been visited previously ', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitStartDateService, 'go').resolves({ checkPageVisited: true })
          })

          it('redirects to /system/return-requirements/{sessionId}/check', async () => {
            const response = await server.inject(postRequestOptions(`/return-requirements/${sessionId}/${path}`))

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/return-requirements/' + sessionId + '/check')
          })
        })
      })
    })
  })

  describe('/return-requirements/{sessionId}/view', () => {
    const path = 'view'
    const returnVersionId = '2a075724-b66c-410e-9fc8-b964077204f2'

    describe('GET', () => {
      beforeEach(async () => {
        Sinon.stub(ViewService, 'go').resolves({
          pageTitle: 'Requirements for returns valid from'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject({
            method: 'GET',
            url: `/return-requirements/${returnVersionId}/${path}`,
            auth: {
              strategy: 'session',
              credentials: { scope: ['billing'] }
            }
          })

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Requirements for returns valid from')
        })
      })
    })
  })
})

function _getOptions (path, index = -1) {
  let url = `/return-requirements/${sessionId}/${path}`

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
  let url = `/return-requirements/${sessionId}/${path}`

  if (index > -1) {
    url = `${url}/${index}`
  }

  return postRequestOptions(url, payload)
}
