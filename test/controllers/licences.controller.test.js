'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const Boom = require('@hapi/boom')

// Things we need to stub
const InitiateReturnRequirementSessionService = require('../../app/services/return-requirements/initiate-return-requirement-session.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Licences controller', () => {
  let options
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

  describe('GET /licences/{id}/no-returns-required', () => {
    const session = { id: '1c265420-6a5e-4a4c-94e4-196d7799ed01' }

    beforeEach(async () => {
      options = {
        method: 'GET',
        url: '/licences/64924759-8142-4a08-9d1e-1e902cd9d316/no-returns-required',
        auth: {
          strategy: 'session',
          credentials: { scope: ['billing'] }
        }
      }
    })

    describe('when a request is valid', () => {
      beforeEach(async () => {
        Sinon.stub(InitiateReturnRequirementSessionService, 'go').resolves(session)
      })

      it('redirects to select return start date page', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(302)
        expect(response.headers.location).to.equal(`/system/return-requirements/${session.id}/start-date`)
      })
    })

    describe('when a request is invalid', () => {
      describe('because the licence ID is unrecognised', () => {
        beforeEach(async () => {
          Sinon.stub(InitiateReturnRequirementSessionService, 'go').rejects(Boom.notFound())
        })

        it('returns a 404 and page not found', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(404)
          expect(response.payload).to.contain('Page not found')
        })
      })

      describe('because the initialise session service errors', () => {
        beforeEach(async () => {
          Sinon.stub(InitiateReturnRequirementSessionService, 'go').rejects()
        })

        it('returns a 200 and there is a problem with the service page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Sorry, there is a problem with the service')
        })
      })
    })
  })

  describe('GET /licences/{id}/returns-required', () => {
    const session = { id: '1c265420-6a5e-4a4c-94e4-196d7799ed01' }

    beforeEach(async () => {
      options = {
        method: 'GET',
        url: '/licences/64924759-8142-4a08-9d1e-1e902cd9d316/returns-required',
        auth: {
          strategy: 'session',
          credentials: { scope: ['billing'] }
        }
      }
    })

    describe('when a request is valid', () => {
      beforeEach(async () => {
        Sinon.stub(InitiateReturnRequirementSessionService, 'go').resolves(session)
      })

      it('redirects to select return start date page', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(302)
        expect(response.headers.location).to.equal(`/system/return-requirements/${session.id}/start-date`)
      })
    })

    describe('when a request is invalid', () => {
      describe('because the licence ID is unrecognised', () => {
        beforeEach(async () => {
          Sinon.stub(InitiateReturnRequirementSessionService, 'go').rejects(Boom.notFound())
        })

        it('returns a 404 and page not found', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(404)
          expect(response.payload).to.contain('Page not found')
        })
      })

      describe('because the initialise session service errors', () => {
        beforeEach(async () => {
          Sinon.stub(InitiateReturnRequirementSessionService, 'go').rejects()
        })

        it('returns a 200 and there is a problem with the service page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Sorry, there is a problem with the service')
        })
      })
    })
  })

  describe('GET /licences/{id}/', () => {
    beforeEach(async () => {
      options = {
        method: 'GET',
        url: '/system/licences/7861814c-ca19-43f2-be11-3c612f0d744b/',
        auth: {
          strategy: 'session',
          credentials: { scope: ['billing'] }
        }
      }
    })

    describe('when a request is valid', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Summary')
        expect(response.payload).to.contain('Effective from')
        expect(response.payload).to.contain('End Date')
      })
    })
  })
})
