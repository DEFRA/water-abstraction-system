'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const AbstractionPeriodService = require('../../app/services/return-requirements/abstraction-period.service.js')
const AddNoteService = require('../../app/services/return-requirements/add-note.service.js')
const CheckYourAnswersService = require('../../app/services/return-requirements/check-your-answers.service.js')
const NoReturnsRequiredService = require('../../app/services/return-requirements/no-returns-required.service.js')
const PointsService = require('../../app/services/return-requirements/points.service.js')
const SelectPurposeService = require('../../app/services/return-requirements/purpose.service.js')
const SelectReasonService = require('../../app/services/return-requirements/reason.service.js')
const SetupService = require('../../app/services/return-requirements/setup.service.js')
const SiteDescriptionService = require('../../app/services/return-requirements/site-description.service.js')
const StartDateService = require('../../app/services/return-requirements/start-date.service.js')

// For running our service
const { init } = require('../../app/server.js')

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
        const response = await server.inject(_options('abstraction-period'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Enter the abstraction period for the requirements for returns')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/add-note', () => {
    beforeEach(async () => {
      Sinon.stub(AddNoteService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Add a note'
      })
    })

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('add-note'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Add a note')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/agreements-exceptions', () => {
    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('agreements-exceptions'))

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
        expect(response.payload).to.contain('Returns requirements approved')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/check-your-answers', () => {
    beforeEach(async () => {
      Sinon.stub(CheckYourAnswersService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Check the return requirements for Acme Corp.'
      })
    })

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('check-your-answers'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Check the return requirements for')
      })
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
    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('frequency-collected'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select how often readings or volumes are collected')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/frequency-reported', () => {
    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('frequency-reported'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select how often collected readings or volumes are reported')
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
        const response = await server.inject(_options('points'))

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
        const response = await server.inject(_options('purpose'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select the purpose for the requirement for returns')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/reason', () => {
    beforeEach(async () => {
      Sinon.stub(SelectReasonService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Select the reason for the return requirement'
      })
    })
    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('reason'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select the reason for the return requirement')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/returns-cycle', () => {
    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('returns-cycle'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select the returns cycle for the return requirement')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/setup', () => {
    beforeEach(async () => {
      Sinon.stub(SetupService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'How do you want to set up the return requirement?'
      })
    })
    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('setup'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('How do you want to set up the return requirement?')
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
        const response = await server.inject(_options('site-description'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Enter a site description for the requirements for returns')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/start-date', () => {
    beforeEach(async () => {
      Sinon.stub(StartDateService, 'go').resolves({
        id: '8702b98f-ae51-475d-8fcc-e049af8b8d38', pageTitle: 'Select the start date for the return requirement'
      })
    })
    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(_options('start-date'))

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select the start date for the return requirement')
      })
    })
  })
})

function _options (path) {
  return {
    method: 'GET',
    url: `/return-requirements/64924759-8142-4a08-9d1e-1e902cd9d316/${path}`,
    auth: {
      strategy: 'session',
      credentials: { scope: ['billing'] }
    }
  }
}
