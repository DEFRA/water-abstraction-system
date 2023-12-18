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

describe('Licences controller', () => {
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

  describe('GET /licences/{id}/reason', () => {
    const options = {
      method: 'GET',
      url: '/licences/64924759-8142-4a08-9d1e-1e902cd9d316/reason',
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

  describe('GET /licences/{id}/select-return-start-date', () => {
    const options = {
      method: 'GET',
      url: '/licences/64924759-8142-4a08-9d1e-1e902cd9d316/select-return-start-date',
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

  describe('GET /licences/{id}/no-returns-required', () => {
    const options = {
      method: 'GET',
      url: '/licences/64924759-8142-4a08-9d1e-1e902cd9d316/no-returns-required',
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

  describe('GET /licences/{id}/requirements-approved', () => {
    const options = {
      method: 'GET',
      url: '/licences/64924759-8142-4a08-9d1e-1e902cd9d316/requirements-approved',
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

  describe('GET /licences/{id}/no-return-check-your-answers', () => {
    const options = {
      method: 'GET',
      url: '/licences/64924759-8142-4a08-9d1e-1e902cd9d316/no-return-check-your-answers',
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

  describe('GET /licences/{id}/returns-check-your-answers', () => {
    const options = {
      method: 'GET',
      url: '/licences/64924759-8142-4a08-9d1e-1e902cd9d316/returns-check-your-answers',
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

  describe('GET /licences/{id}/add-a-note', () => {
    const options = {
      method: 'GET',
      url: '/licences/64924759-8142-4a08-9d1e-1e902cd9d316/add-a-note',
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
})
