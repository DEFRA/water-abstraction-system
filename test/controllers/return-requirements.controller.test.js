'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub

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

  describe('GET /return-requirements/{sessionId}/select-return-start-date', () => {
    const options = {
      method: 'GET',
      url: '/return-requirements/64924759-8142-4a08-9d1e-1e902cd9d316/select-return-start-date',
      auth: {
        strategy: 'session',
        credentials: { scope: ['billing'] }
      }
    }

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select the start date for the return requirement')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/reason', () => {
    const options = {
      method: 'GET',
      url: '/return-requirements/64924759-8142-4a08-9d1e-1e902cd9d316/reason',
      auth: {
        strategy: 'session',
        credentials: { scope: ['billing'] }
      }
    }

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select the reason for the return requirement')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/returns-how-do-you-want', () => {
    const options = {
      method: 'GET',
      url: '/return-requirements/64924759-8142-4a08-9d1e-1e902cd9d316/returns-how-do-you-want',
      auth: {
        strategy: 'session',
        credentials: { scope: ['billing'] }
      }
    }

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('How do you want to set up the return requirement?')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/no-returns-required', () => {
    const options = {
      method: 'GET',
      url: '/return-requirements/64924759-8142-4a08-9d1e-1e902cd9d316/no-returns-required',
      auth: {
        strategy: 'session',
        credentials: { scope: ['billing'] }
      }
    }

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Why are no returns required?')
      })
    })
  })

  describe('GET /return-requirements/requirements-approved', () => {
    const options = {
      method: 'GET',
      url: '/return-requirements/requirements-approved',
      auth: {
        strategy: 'session',
        credentials: { scope: ['billing'] }
      }
    }

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Returns requirements approved')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/no-return-check-your-answers', () => {
    const options = {
      method: 'GET',
      url: '/return-requirements/64924759-8142-4a08-9d1e-1e902cd9d316/no-return-check-your-answers',
      auth: {
        strategy: 'session',
        credentials: { scope: ['billing'] }
      }
    }

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Check your answers')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/returns-check-your-answers', () => {
    const options = {
      method: 'GET',
      url: '/return-requirements/64924759-8142-4a08-9d1e-1e902cd9d316/returns-check-your-answers',
      auth: {
        strategy: 'session',
        credentials: { scope: ['billing'] }
      }
    }

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Check your answers')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/add-a-note', () => {
    const options = {
      method: 'GET',
      url: '/return-requirements/64924759-8142-4a08-9d1e-1e902cd9d316/add-a-note',
      auth: {
        strategy: 'session',
        credentials: { scope: ['billing'] }
      }
    }

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Add a note')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/points', () => {
    const options = {
      method: 'GET',
      url: '/return-requirements/64924759-8142-4a08-9d1e-1e902cd9d316/points',
      auth: {
        strategy: 'session',
        credentials: { scope: ['billing'] }
      }
    }

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select the points for the return requirement')
      })
    })
  })
})
