'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const AbstractionPeriodService = require('../../app/services/return-requirements/abstraction-period.service.js')
const AdditionalSubmissionOptionsService = require('../../app/services/return-requirements/additional-submission-options.service.js')
const AgreementsExceptionService = require('../../app/services/return-requirements/agreements-exceptions.service.js')
const CancelService = require('../../app/services/return-requirements/cancel.service.js')
const CheckService = require('../../app/services/return-requirements/check.service.js')
const DeleteNoteService = require('../../app/services/return-requirements/delete-note.service.js')
const FrequencyCollectedService = require('../../app/services/return-requirements/frequency-collected.service.js')
const FrequencyReportedService = require('../../app/services/return-requirements/frequency-reported.service.js')
const NoReturnsRequiredService = require('../../app/services/return-requirements/no-returns-required.service.js')
const NoteService = require('../../app/services/return-requirements/note.service.js')
const PointsService = require('../../app/services/return-requirements/points.service.js')
const RemoveService = require('../../app/services/return-requirements/remove.service.js')
const ReturnCycleService = require('../../app/services/return-requirements/returns-cycle.service.js')
const SelectPurposeService = require('../../app/services/return-requirements/purpose.service.js')
const SelectReasonService = require('../../app/services/return-requirements/reason.service.js')
const SetupService = require('../../app/services/return-requirements/setup.service.js')
const SiteDescriptionService = require('../../app/services/return-requirements/site-description.service.js')
const StartDateService = require('../../app/services/return-requirements/start-date.service.js')

// For running our service
const { init } = require('../../app/server.js')
const sessionId = '64924759-8142-4a08-9d1e-1e902cd9d316'

describe('Return requirements controller', () => {
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

  describe('GET /return-requirements/{sessionId}/abstraction-period', () => {
    beforeEach(async () => {
      Sinon.stub(AbstractionPeriodService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
        pageTitle: 'Enter the abstraction period for the requirements for returns'
      })
    })

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('abstraction-period', 0))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Enter the abstraction period for the requirements for returns')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/additional-submission-options', () => {
    beforeEach(async () => {
      Sinon.stub(AdditionalSubmissionOptionsService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
        pageTitle: 'Select any additional submission options for the return requirements',
        additionalSubmissionOptions: []
      })
    })

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('additional-submission-options'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select any additional submission options for the return requirements')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/note', () => {
    beforeEach(async () => {
      Sinon.stub(NoteService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Add a note'
      })
    })

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('note'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Add a note')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/agreements-exceptions', () => {
    beforeEach(async () => {
      Sinon.stub(AgreementsExceptionService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
        pageTitle: 'Select agreements and exceptions for the return requirement'
      })
    })

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('agreements-exceptions', 0))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select agreements and exceptions for the return requirement')
      })
    })
  })

  describe('GET /return-requirements/{licenceId}/approved', () => {
    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('approved'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Requirements for returns approved')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/cancel', () => {
    beforeEach(async () => {
      Sinon.stub(CancelService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
        pageTitle: 'You are about to cancel these requirements for returns'
      })
    })

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('cancel'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('You are about to cancel these requirements for returns')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/check', () => {
    beforeEach(async () => {
      Sinon.stub(CheckService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Check the return requirements for Acme Corp.'
      })
    })

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('check'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Check the return requirements for')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/delete-note', () => {
    beforeEach(async () => {
      Sinon.stub(DeleteNoteService, 'go').resolves({
        title: 'Removed',
        text: 'Note removed'
      })
    })

    it('redirects on success', async () => {
      const result = await server.inject(_options('delete-note'))

      expect(result.statusCode).to.equal(302)
      expect(result.headers.location).to.equal(`/system/return-requirements/${sessionId}/check`)
    })
  })

  describe('GET /return-requirements/{sessionId}/existing', () => {
    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('existing'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select an existing return requirement from')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/frequency-collected', () => {
    beforeEach(async () => {
      Sinon.stub(FrequencyCollectedService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Select how often readings or volumes are collected'
      })
    })

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('frequency-collected', 0))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select how often readings or volumes are collected')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/frequency-reported', () => {
    beforeEach(async () => {
      Sinon.stub(FrequencyReportedService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Select how often readings or volumes are reported'
      })
    })

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('frequency-reported', 0))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select how often readings or volumes are reported')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/no-returns-required', () => {
    beforeEach(async () => {
      Sinon.stub(NoReturnsRequiredService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Why are no returns required?'
      })
    })

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('no-returns-required'))
        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Why are no returns required?')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/points', () => {
    beforeEach(async () => {
      Sinon.stub(PointsService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Select the points for the requirements for returns'
      })
    })

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('points', 0))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select the points for the requirements for returns')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/purpose', () => {
    beforeEach(async () => {
      Sinon.stub(SelectPurposeService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Select the purpose for the requirement for returns'
      })
    })
    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('purpose', 0))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select the purpose for the requirement for returns')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/reason', () => {
    beforeEach(async () => {
      Sinon.stub(SelectReasonService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Select the reason for the requirements for returns'
      })
    })
    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('reason'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select the reason for the requirements for returns')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/remove', () => {
    beforeEach(async () => {
      Sinon.stub(RemoveService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'You are about to remove these requirements for returns'
      })
    })

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('remove', 0))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('You are about to remove these requirements for returns')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/returns-cycle', () => {
    beforeEach(async () => {
      Sinon.stub(ReturnCycleService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Select the returns cycle for the return requirement'
      })
    })
    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('returns-cycle', 0))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select the returns cycle for the return requirement')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/setup', () => {
    beforeEach(async () => {
      Sinon.stub(SetupService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'How do you want to set up the requirements for returns?'
      })
    })
    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('setup'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('How do you want to set up the requirements for returns?')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/site-description', () => {
    beforeEach(async () => {
      Sinon.stub(SiteDescriptionService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
        pageTitle: 'Enter a site description for the requirements for returns'
      })
    })
    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('site-description', 0))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Enter a site description for the requirements for returns')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/start-date', () => {
    beforeEach(async () => {
      Sinon.stub(StartDateService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Select the start date for the requirements for returns'
      })
    })
    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('start-date'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select the start date for the requirements for returns')
      })
    })
  })
})

function _options (path, index = -1) {
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
