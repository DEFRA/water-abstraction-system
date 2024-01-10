'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const NoReturnsRequiredService = require('../../app/services/return-requirements/no-returns-required.service.js')

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

  describe('GET /return-requirements/{sessionId}/how-do-you-want', () => {
    const options = {
      method: 'GET',
      url: '/return-requirements/64924759-8142-4a08-9d1e-1e902cd9d316/how-do-you-want',
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

    beforeEach(async () => {
      Sinon.stub(NoReturnsRequiredService, 'go').resolves({ id: '8702b98f-ae51-475d-8fcc-e049af8b8d38' })
    })

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

  describe('GET /return-requirements/{sessionId}/check-your-answers', () => {
    const options = {
      method: 'GET',
      url: '/return-requirements/64924759-8142-4a08-9d1e-1e902cd9d316/check-your-answers',
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

  describe('GET /return-requirements/{sessionId}/frequency-collected', () => {
    const options = {
      method: 'GET',
      url: '/return-requirements/64924759-8142-4a08-9d1e-1e902cd9d316/frequency-collected',
      auth: {
        strategy: 'session',
        credentials: { scope: ['billing'] }
      }
    }

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select how often readings or volumes are collected')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/description', () => {
    const options = {
      method: 'GET',
      url: '/return-requirements/64924759-8142-4a08-9d1e-1e902cd9d316/description',
      auth: {
        strategy: 'session',
        credentials: { scope: ['billing'] }
      }
    }

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Enter a site description for the return requirement')
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

  describe('GET /return-requirements/{sessionId}/returns-cycle', () => {
    const options = {
      method: 'GET',
      url: '/return-requirements/64924759-8142-4a08-9d1e-1e902cd9d316/returns-cycle',
      auth: {
        strategy: 'session',
        credentials: { scope: ['billing'] }
      }
    }

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select the returns cycle for the return requirement')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/frequency-reported', () => {
    const options = {
      method: 'GET',
      url: '/return-requirements/64924759-8142-4a08-9d1e-1e902cd9d316/frequency-reported',
      auth: {
        strategy: 'session',
        credentials: { scope: ['billing'] }
      }
    }

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select how often collected readings or volumes are reported')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/settings', () => {
    const options = {
      method: 'GET',
      url: '/return-requirements/64924759-8142-4a08-9d1e-1e902cd9d316/settings',
      auth: {
        strategy: 'session',
        credentials: { scope: ['billing'] }
      }
    }

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select agreements and exceptions for the return requirement')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/purpose', () => {
    const options = {
      method: 'GET',
      url: '/return-requirements/64924759-8142-4a08-9d1e-1e902cd9d316/purpose',
      auth: {
        strategy: 'session',
        credentials: { scope: ['billing'] }
      }
    }

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Select the purpose for the return requirement')
      })
    })
  })

  describe('GET /return-requirements/{sessionId}/abstraction-period', () => {
    const options = {
      method: 'GET',
      url: '/return-requirements/64924759-8142-4a08-9d1e-1e902cd9d316/abstraction-period',
      auth: {
        strategy: 'session',
        credentials: { scope: ['billing'] }
      }
    }

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Enter the abstraction period for the return requirement')
      })
    })
  })
})
