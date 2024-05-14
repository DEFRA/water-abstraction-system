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
const InitiateSessionService = require('../../app/services/return-requirements/initiate-session.service.js')
const ViewLicenceBillsService = require('../../app/services/licences/view-licence-bills.service')
const ViewLicenceContactDetailsService = require('../../app/services/licences/view-licence-contact-details.service')
const ViewLicenceSummaryService = require('../../app/services/licences/view-licence-summary.service')
const ViewLicenceReturnsService = require('../../app/services/licences/view-licence-returns.service')

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
        Sinon.stub(InitiateSessionService, 'go').resolves(session)
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
          Sinon.stub(InitiateSessionService, 'go').rejects(Boom.notFound())
        })

        it('returns a 404 and page not found', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(404)
          expect(response.payload).to.contain('Page not found')
        })
      })

      describe('because the initialise session service errors', () => {
        beforeEach(async () => {
          Sinon.stub(InitiateSessionService, 'go').rejects()
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
        Sinon.stub(InitiateSessionService, 'go').resolves(session)
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
          Sinon.stub(InitiateSessionService, 'go').rejects(Boom.notFound())
        })

        it('returns a 404 and page not found', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(404)
          expect(response.payload).to.contain('Page not found')
        })
      })

      describe('because the initialise session service errors', () => {
        beforeEach(async () => {
          Sinon.stub(InitiateSessionService, 'go').rejects()
        })

        it('returns a 200 and there is a problem with the service page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Sorry, there is a problem with the service')
        })
      })
    })
  })

  describe('GET /licences/{id}/bills', () => {
    beforeEach(async () => {
      options = {
        method: 'GET',
        url: '/licences/7861814c-ca19-43f2-be11-3c612f0d744b/bills',
        auth: {
          strategy: 'session',
          credentials: { scope: ['billing'] }
        }
      }
    })

    describe('when a request is valid and has bills', () => {
      beforeEach(async () => {
        Sinon.stub(ViewLicenceBillsService, 'go').resolves(_viewLicenceBills())
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Bills')
        //  Check the table titles
        expect(response.payload).to.contain('Bill number')
        expect(response.payload).to.contain('Date created')
        expect(response.payload).to.contain('Billing account')
        expect(response.payload).to.contain('Bill run type')
        expect(response.payload).to.contain('Bill total')
      })
    })
    describe('when a request is valid and has no bills', () => {
      beforeEach(async () => {
        Sinon.stub(ViewLicenceBillsService, 'go').resolves({ activeTab: 'bills', bills: [] })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Bills')
        //  Check the table titles
        expect(response.payload).to.contain('Bills')
        expect(response.payload).to.contain('No bills sent for this licence.')
      })
    })
  })

  describe('GET /licences/{id}/contact-details', () => {
    beforeEach(async () => {
      options = {
        method: 'GET',
        url: '/licences/7861814c-ca19-43f2-be11-3c612f0d744b/contact-details',
        auth: {
          strategy: 'session',
          credentials: { scope: [] }
        }
      }
    })

    describe('when a request is valid and has contacts', () => {
      beforeEach(async () => {
        Sinon.stub(ViewLicenceContactDetailsService, 'go').resolves(_viewLicenceContactDetails())
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Contact Details')
        // Table row titles
        expect(response.payload).to.contain('Name')
        expect(response.payload).to.contain('Communication type')
        expect(response.payload).to.contain('Send to')
      })
    })

    describe('when a request is valid and has no contact details', () => {
      beforeEach(async () => {
        Sinon.stub(ViewLicenceContactDetailsService, 'go').resolves({ activeTab: 'contact-details' })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Contact Details')
        expect(response.payload).to.contain('No contacts found.')
      })
    })
  })

  describe('GET /licences/{id}/summary', () => {
    beforeEach(async () => {
      options = {
        method: 'GET',
        url: '/licences/7861814c-ca19-43f2-be11-3c612f0d744b/summary',
        auth: {
          strategy: 'session',
          credentials: { scope: [] }
        }
      }
    })

    describe('when a request is valid', () => {
      beforeEach(async () => {
        Sinon.stub(ViewLicenceSummaryService, 'go').resolves(_viewLicenceSummary())
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Summary')
        expect(response.payload).to.contain('Effective from')
        expect(response.payload).to.contain('End date')
      })
    })
  })

  describe('GET /licences/{id}/returns', () => {
    beforeEach(async () => {
      options = {
        method: 'GET',
        url: '/licences/7861814c-ca19-43f2-be11-3c612f0d744b/returns',
        auth: {
          strategy: 'session',
          credentials: { scope: ['billing'] }
        }
      }
    })

    describe('when a request is valid and has returns', () => {
      beforeEach(async () => {
        Sinon.stub(ViewLicenceReturnsService, 'go').resolves(_viewLicenceReturns())
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Returns')
        //  Check the table titles
        expect(response.payload).to.contain('Return reference and dates')
        expect(response.payload).to.contain('Purpose and description')
        expect(response.payload).to.contain('Due date')
        expect(response.payload).to.contain('Status')
      })
    })

    describe('when a request is valid and has NO returns', () => {
      beforeEach(async () => {
        Sinon.stub(ViewLicenceReturnsService, 'go').resolves({
          activeTab: 'returns',
          returns: []
        })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Returns')
        //  Check the table titles
        expect(response.payload).to.contain('No returns found')
      })
    })
  })
})

function _viewLicenceBills () {
  return {
    activeTab: 'bills',
    bills: [{ id: 'bills-id' }]
  }
}

function _viewLicenceContactDetails () {
  return {
    activeTab: 'contact-details',
    licenceContacts: [{}],
    customerContacts: [{}]
  }
}

function _viewLicenceReturns () {
  return {
    activeTab: 'returns',
    returns: [{ id: 'returns-id' }]
  }
}

function _viewLicenceSummary () {
  return {
    id: '7861814c-ca19-43f2-be11-3c612f0d744b',
    licenceRef: '01/130/R01',
    region: 'Southern',
    startDate: '1 November 2022',
    endDate: '1 November 2032',
    activeTab: 'summary'
  }
}
