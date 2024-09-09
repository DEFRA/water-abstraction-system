'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const Boom = require('@hapi/boom')
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const InitiateSessionService = require('../../app/services/return-requirements/initiate-session.service.js')
const LicenceSupplementaryProcessBillingFlagService = require('../../app/services/licences/supplementary/process-billing-flag.service.js')
const MarkedForSupplementaryBillingService = require('../../app/services/licences/supplementary/marked-for-supplementary-billing.service.js')
const MarkForSupplementaryBillingService = require('../../app/services/licences/supplementary/mark-for-supplementary-billing.service.js')
const SubmitMarkForSupplementaryBillingService = require('../../app/services/licences/supplementary/submit-mark-for-supplementary-billing.service.js')
const ViewLicenceBillsService = require('../../app/services/licences/view-licence-bills.service.js')
const ViewLicenceCommunicationsService = require('../../app/services/licences/view-licence-communications.service.js')
const ViewLicenceContactDetailsService = require('../../app/services/licences/view-licence-contact-details.service.js')
const ViewLicenceReturnsService = require('../../app/services/licences/view-licence-returns.service.js')
const ViewLicenceSetUpService = require('../../app/services/licences/view-licence-set-up.service.js')
const ViewLicenceSummaryService = require('../../app/services/licences/view-licence-summary.service.js')

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

  describe('/licences/{id}/bills', () => {
    describe('GET', () => {
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

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(ViewLicenceBillsService, 'go').resolves(_viewLicenceBills())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Bills')
        })
      })
    })
  })

  describe('/licences/{id}/communications', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = {
          method: 'GET',
          url: '/licences/7861814c-ca19-43f2-be11-3c612f0d744b/communications',
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(ViewLicenceCommunicationsService, 'go').resolves(_viewLicenceCommunications())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Communications')
        })
      })
    })
  })

  describe('/licences/{id}/contact-details', () => {
    describe('GET', () => {
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
          expect(response.payload).to.contain('Contact details')
        })
      })
    })
  })

  describe('/licences/{id}/no-returns-required', () => {
    describe('GET', () => {
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
  })

  describe('/licences/{id}/returns-required', () => {
    describe('GET', () => {
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
  })

  describe('/licences/{id}/returns', () => {
    describe('GET', () => {
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

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(ViewLicenceReturnsService, 'go').resolves(_viewLicenceReturns())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Returns')
        })
      })
    })
  })

  describe('/licences/{id}/set-up', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = {
          method: 'GET',
          url: '/licences/7861814c-ca19-43f2-be11-3c612f0d744b/set-up',
          auth: {
            strategy: 'session',
            credentials: { scope: ['view_charge_versions'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(ViewLicenceSetUpService, 'go').resolves(_viewLicenceSetUp())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Licence set up')
        })
      })
    })
  })

  describe('/licences/{id}/summary', () => {
    describe('GET', () => {
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
        })
      })
    })
  })

  describe('/licences/supplementary', () => {
    describe('POST', () => {
      beforeEach(() => {
        options = { method: 'POST', url: '/licences/supplementary' }
      })

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          Sinon.stub(LicenceSupplementaryProcessBillingFlagService, 'go').resolves()
        })

        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(204)
        })
      })
    })
  })

  describe('/licences/{id}/mark-for-supplementary-billing', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = {
          method: 'GET',
          url: '/licences/7861814c-ca19-43f2-be11-3c612f0d744b/mark-for-supplementary-billing',
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(MarkForSupplementaryBillingService, 'go').resolves(_markForSupplementaryBilling())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Mark for the supplementary bill run')
        })
      })
    })

    describe('POST', () => {
      beforeEach(async () => {
        options = postRequestOptions('/licences/7861814c-ca19-43f2-be11-3c612f0d744b/mark-for-supplementary-billing')
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(SubmitMarkForSupplementaryBillingService, 'go').resolves({ error: null })
        })

        it('redirects to the marked for supplementary billing page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(
            '/system/licences/7861814c-ca19-43f2-be11-3c612f0d744b/marked-for-supplementary-billing'
          )
        })
      })
    })
  })

  describe('/licences/{id}/marked-for-supplementary-billing', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = {
          method: 'GET',
          url: '/licences/7861814c-ca19-43f2-be11-3c612f0d744b/marked-for-supplementary-billing',
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(MarkedForSupplementaryBillingService, 'go').resolves({
            licenceId: '7861814c-ca19-43f2-be11-3c612f0d744b', licenceRef: '01/test'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('You’ve marked this licence for the next supplementary bill run')
        })
      })
    })
  })
})

function _markForSupplementaryBilling () {
  return {
    licenceId: '7861814c-ca19-43f2-be11-3c612f0d744b',
    licenceRef: '01/test',
    financialYears: [
      { text: '2024 to 2025', value: 2025 },
      { text: '2023 to 2024', value: 2024 },
      { text: '2022 to 2023', value: 2023 },
      { text: 'Before 2022', value: 'preSroc', hint: { text: 'Old charge scheme' } }
    ]
  }
}

function _viewLicenceBills () {
  const commonLicenceData = _viewLicence()

  return {
    ...commonLicenceData,
    activeTab: 'bills',
    bills: [{ id: 'bills-id' }]
  }
}

function _viewLicenceCommunications () {
  const commonLicenceData = _viewLicence()

  return {
    ...commonLicenceData,
    activeTab: 'communications',
    communications: [{ type: 'paper return', sent: 'date', sender: 'admin@email.com', method: 'letter' }]
  }
}

function _viewLicenceContactDetails () {
  const commonLicenceData = _viewLicence()

  return {
    ...commonLicenceData,
    activeTab: 'contact-details',
    licenceContacts: [{ name: 'jobo', communicationType: 'Licence Holder' }],
    customerContacts: [{ name: 'jimbo', communicationType: 'customer' }]
  }
}

function _viewLicenceReturns () {
  const commonLicenceData = _viewLicence()

  return {
    ...commonLicenceData,
    activeTab: 'returns',
    returns: [
      { id: 'returns-id' }
    ],
    noReturnsMessage: null
  }
}

function _viewLicenceSetUp () {
  const commonLicenceData = _viewLicence()

  return {
    ...commonLicenceData,
    activeTab: 'set-up',
    agreements: [{}],
    chargeInformation: [{ }],
    enableRequirementsForReturns: true,
    links: {
      agreements: {
        setUpAgreement: '/'
      },
      chargeInformation: {
        setupNewCharge: '/',
        makeLicenceNonChargeable: '/'
      },
      returnVersions: {
        returnsRequired: '/',
        noReturnsRequired: '/'
      }
    },
    returnVersions: [{ }]
  }
}

function _viewLicenceSummary () {
  const commonLicenceData = _viewLicence()

  return {
    ...commonLicenceData,
    id: '7861814c-ca19-43f2-be11-3c612f0d744b',
    region: 'Southern',
    startDate: '1 November 2022',
    endDate: '1 November 2032',
    activeTab: 'summary'
  }
}

function _viewLicence () {
  return {
    documentId: 'e8f491f0-0c60-4083-9d41-d2be69f17a1e',
    licenceId: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
    licenceName: 'Between two ferns',
    licenceRef: '01/123',
    notification: null,
    pageTitle: 'Licence 01/123',
    primaryUser: {
      id: 10036,
      username: 'grace.hopper@example.co.uk'
    },
    roles: ['billing', 'view_charge_versions'],
    warning: null,
    workflowWarning: true
  }
}
