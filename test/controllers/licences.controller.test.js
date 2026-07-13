// Test framework dependencies

// Test helpers
import Boom from '@hapi/boom'
import http2 from 'node:http2'
import { postRequestOptions } from '../support/general.js'

// Things we need to stub
import * as InitiateSessionService from '../../app/services/return-versions/setup/initiate-session.service.js'
import * as LicenceSupplementaryProcessBillingFlagService from '../../app/services/licences/supplementary/process-billing-flag.service.js'
import * as SubmitMarkForSupplementaryBillingService from '../../app/services/licences/supplementary/submit-mark-for-supplementary-billing.service.js'
import * as ViewBillsService from '../../app/services/licences/view-bills.service.js'
import * as ViewCommunicationsService from '../../app/services/licences/view-communications.service.js'
import * as ViewConditionsService from '../../app/services/licences/view-conditions.service.js'
import * as ViewContactDetailsService from '../../app/services/licences/view-contact-details.service.js'
import * as ViewHistoryService from '../../app/services/licences/view-history.service.js'
import * as ViewMarkForSupplementaryBillingService from '../../app/services/licences/supplementary/view-mark-for-supplementary-billing.service.js'
import * as ViewMarkedForSupplementaryBillingService from '../../app/services/licences/supplementary/view-marked-for-supplementary-billing.service.js'
import * as ViewPointsService from '../../app/services/licences/view-points.service.js'
import * as ViewPurposesService from '../../app/services/licences/view-purposes.service.js'
import * as ViewReturnsService from '../../app/services/licences/view-returns.service.js'
import * as ViewSetUpService from '../../app/services/licences/view-set-up.service.js'
import * as ViewSummaryService from '../../app/services/licences/view-summary.service.js'

// For running our service
import { init } from '../../app/server.js'
const { HTTP_STATUS_FOUND, HTTP_STATUS_NOT_FOUND, HTTP_STATUS_NO_CONTENT, HTTP_STATUS_OK } = http2.constants

describe('Licences controller', () => {
  let options
  let server

  // Create server before running the tests
  beforeAll(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    vi.spyOn(server.logger, 'error').mockImplementation(() => {})

    // We silence sending a notification to our Errbit instance using Airbrake
    vi.spyOn(server.app.airbrake, 'notify').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(async () => {
    await server.stop()
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
          vi.spyOn(ViewBillsService, 'default').mockResolvedValue(_viewBills())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Bills')
        })
      })
    })
  })

  describe('/licences/{id}/conditions', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = {
          method: 'GET',
          url: '/licences/7861814c-ca19-43f2-be11-3c612f0d744b/conditions',
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }
      })

      describe('when a request is valid and has conditions', () => {
        beforeEach(async () => {
          vi.spyOn(ViewConditionsService, 'default').mockResolvedValue(_viewConditions())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Licence abstraction conditions')
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
          vi.spyOn(ViewCommunicationsService, 'default').mockResolvedValue(_viewCommunications())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Communications')
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
          vi.spyOn(ViewContactDetailsService, 'default').mockResolvedValue(_viewContactDetails())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Contact details')
        })
      })
    })
  })

  describe('/licences/{id}/history', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = {
          method: 'GET',
          url: '/licences/7861814c-ca19-43f2-be11-3c612f0d744b/history',
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          vi.spyOn(ViewHistoryService, 'default').mockResolvedValue(_viewHistory())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('History')
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
          vi.spyOn(InitiateSessionService, 'default').mockResolvedValue(session)
        })

        it('redirects to select return start date page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/return-versions/setup/${session.id}/start-date`)
        })
      })

      describe('when a request is invalid', () => {
        describe('because the licence ID is unrecognised', () => {
          beforeEach(async () => {
            vi.spyOn(InitiateSessionService, 'default').mockRejectedValue(Boom.notFound())
          })

          it('returns a 404 and page not found', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
            expect(response.payload).toContain('Page not found')
          })
        })

        describe('because the initialise session service errors', () => {
          beforeEach(async () => {
            vi.spyOn(InitiateSessionService, 'default').mockRejectedValue()
          })

          it('returns a 200 and there is a problem with the service page', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Sorry, there is a problem with the service')
          })
        })
      })
    })
  })

  describe('/licences/{id}/points', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = {
          method: 'GET',
          url: '/licences/7861814c-ca19-43f2-be11-3c612f0d744b/points',
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          vi.spyOn(ViewPointsService, 'default').mockResolvedValue(_viewPoints())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Points')
        })
      })
    })
  })

  describe('/licences/{id}/purposes', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = {
          method: 'GET',
          url: '/licences/7861814c-ca19-43f2-be11-3c612f0d744b/purposes',
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          vi.spyOn(ViewPurposesService, 'default').mockResolvedValue(_viewPurposes())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Purposes, periods and amounts')
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
          vi.spyOn(InitiateSessionService, 'default').mockResolvedValue(session)
        })

        it('redirects to select return start date page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/return-versions/setup/${session.id}/start-date`)
        })
      })

      describe('when a request is invalid', () => {
        describe('because the licence ID is unrecognised', () => {
          beforeEach(async () => {
            vi.spyOn(InitiateSessionService, 'default').mockRejectedValue(Boom.notFound())
          })

          it('returns a 404 and page not found', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
            expect(response.payload).toContain('Page not found')
          })
        })

        describe('because the initialise session service errors', () => {
          beforeEach(async () => {
            vi.spyOn(InitiateSessionService, 'default').mockRejectedValue()
          })

          it('returns a 200 and there is a problem with the service page', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Sorry, there is a problem with the service')
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
          vi.spyOn(ViewReturnsService, 'default').mockResolvedValue(_viewReturns())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Returns')
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
          vi.spyOn(ViewSetUpService, 'default').mockResolvedValue(_viewSetUp())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Licence set up')
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
          vi.spyOn(ViewSummaryService, 'default').mockResolvedValue(_viewSummary())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Licence summary')
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
          vi.spyOn(LicenceSupplementaryProcessBillingFlagService, 'default').mockResolvedValue()
        })

        it('returns a 204 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
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
          vi.spyOn(ViewMarkForSupplementaryBillingService, 'default').mockResolvedValue(_markForSupplementaryBilling())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Mark for the supplementary bill run')
        })
      })
    })

    describe('POST', () => {
      beforeEach(async () => {
        options = postRequestOptions('/licences/7861814c-ca19-43f2-be11-3c612f0d744b/mark-for-supplementary-billing')
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          vi.spyOn(SubmitMarkForSupplementaryBillingService, 'default').mockResolvedValue({ error: null })
        })

        it('redirects to the marked for supplementary billing page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(
            '/system/licences/7861814c-ca19-43f2-be11-3c612f0d744b/marked-for-supplementary-billing'
          )
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          vi.spyOn(SubmitMarkForSupplementaryBillingService, 'default').mockResolvedValue({
            pageTitle: 'Mark for the supplementary bill run',
            error: {
              errorList: [
                {
                  href: '#supplementaryYears',
                  text: 'Select at least one financial year'
                }
              ],
              supplementaryYears: {
                text: 'Select at least one financial year'
              }
            },
            licenceId: '7861814c-ca19-43f2-be11-3c612f0d744b',
            licenceRef: '01/Test',
            financialYears: [
              { text: '2024 to 2025', value: 2025 },
              { text: '2023 to 2024', value: 2024 },
              { text: '2022 to 2023', value: 2023 },
              { text: 'Before 2022', value: 'preSroc', hint: { text: 'Old charge scheme' } }
            ]
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select at least one financial year')
          expect(response.payload).toContain('There is a problem')
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
          vi.spyOn(ViewMarkedForSupplementaryBillingService, 'default').mockResolvedValue({
            licenceId: '7861814c-ca19-43f2-be11-3c612f0d744b',
            licenceRef: '01/test',
            pageTitle: "You've marked this licence for the next supplementary bill run"
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('You&#39;ve marked this licence for the next supplementary bill run')
        })
      })
    })
  })
})

function _commonData() {
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

function _markForSupplementaryBilling() {
  return {
    licenceId: '7861814c-ca19-43f2-be11-3c612f0d744b',
    licenceRef: '01/test',
    financialYears: [
      { text: '2024 to 2025', value: 2025 },
      { text: '2023 to 2024', value: 2024 },
      { text: '2022 to 2023', value: 2023 },
      { text: 'Before 2022', value: 'preSroc', hint: { text: 'Old charge scheme' } }
    ],
    pageTitle: 'Mark for the supplementary bill run'
  }
}

function _viewBills() {
  const commonLicenceData = _commonData()

  return {
    ...commonLicenceData,
    activeSecondaryNav: 'bills',
    bills: [{ id: 'bills-id' }]
  }
}

function _viewConditions() {
  const commonLicenceData = _commonData()

  return {
    ...commonLicenceData,
    activeSecondaryNav: 'search',
    conditionTypes: [
      {
        conditions: [
          {
            abstractionPoints: {
              label: 'Abstraction point',
              descriptions: [
                'Within the area formed by the straight lines running between National Grid References TQ 78157 78848, TQ 79800 76896, TQ 77808 75242 and TQ 75736 76766 (INLAND WATER DITCHES AND DRAINS KNOWN AS THE LIPWELL STREAM)'
              ]
            },
            conditionType: 'Aggregate',
            otherInformation:
              'Aggregate quantity across purposes 4.1(i), 4.1(ii), and 4.1(iii):\n' +
              '455 cubic metres per hour\n' +
              '10,920 cubic metres per day\n' +
              '165,000 cubic metres per year.',
            param1: null,
            param2: {
              label: 'Aggregate quantity',
              value: '455/hr;10920/d;165000/y'
            },
            purpose: 'Make-Up Or Top Up Water'
          }
        ],
        displayTitle: 'Aggregate condition purpose to purpose within a licence'
      }
    ],
    licenceId: '5ca7bf18-d433-491c-ac83-483f67ee7d93',
    licenceRef: '01/140/R01',
    pageTitle: 'Licence abstraction conditions'
  }
}

function _viewCommunications() {
  const commonLicenceData = _commonData()

  return {
    ...commonLicenceData,
    activeSecondaryNav: 'communications',
    communications: [{ type: 'paper return', sent: 'date', sender: 'admin@email.com', method: 'letter' }]
  }
}

function _viewContactDetails() {
  const commonLicenceData = _commonData()

  return {
    ...commonLicenceData,
    activeSecondaryNav: 'contact-details',
    licenceContacts: [{ name: 'jobo', communicationType: 'Licence Holder' }],
    customerContacts: [{ name: 'jimbo', communicationType: 'customer' }]
  }
}

function _viewHistory() {
  const commonLicenceData = _commonData()

  return {
    ...commonLicenceData,
    entries: [{}],
    pageTitle: 'History'
  }
}

function _viewPoints() {
  const commonLicenceData = _commonData()

  return {
    ...commonLicenceData,
    id: 'f500992f-b178-480b-9325-51fe7fdbc9fd',
    licencePoints: [
      {
        bgsReference: '',
        category: 'Single Point',
        depth: 183,
        description: 'MIZKAN UK LTD, BURNTWOOD - BOREHOLE',
        gridReference: 'At National Grid Reference SK 05769 08747',
        hydroOffsetDistance: '',
        hydroReference: '',
        locationNote: '',
        note: '',
        primaryType: 'Groundwater',
        secondaryType: 'Borehole',
        sourceDescription: 'Groundwater Midlands Region',
        sourceType: 'Groundwater',
        wellReference: ''
      }
    ],
    licenceRef: '03/28/07/0006',
    pageTitle: 'Points'
  }
}

function _viewPurposes() {
  const commonLicenceData = _commonData()

  return {
    ...commonLicenceData,
    id: '5ca7bf18-d433-491c-ac83-483f67ee7d93',
    licenceRef: '01/140/R01',
    licencePurposes: [
      {
        abstractionAmounts: [
          '165000.00 cubic metres per year',
          '10920.00 cubic metres per day',
          '455.00 cubic metres per hour'
        ],
        abstractionPeriod: '1 November to 31 March',
        abstractionPoints: ['At National Grid Reference TQ 78392 78004 (LIPWELL STREAM POINT A)'],
        purposeDescription: 'Transfer Between Sources (Pre Water Act 2003)'
      }
    ],
    pageTitle: 'Purposes, periods and amounts'
  }
}

function _viewReturns() {
  const commonLicenceData = _commonData()

  return {
    ...commonLicenceData,
    activeSecondaryNav: 'returns',
    returns: [{ id: 'returns-id' }],
    noReturnsMessage: null
  }
}

function _viewSetUp() {
  const commonLicenceData = _commonData()

  return {
    ...commonLicenceData,
    activeSecondaryNav: 'set-up',
    agreements: [{}],
    chargeInformation: [{}],
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
    returnVersions: [{}]
  }
}

function _viewSummary() {
  const commonLicenceData = _commonData()

  return {
    ...commonLicenceData,
    id: '7861814c-ca19-43f2-be11-3c612f0d744b',
    region: 'Southern',
    startDate: '1 November 2022',
    endDate: '1 November 2032',
    activeSecondaryNav: 'summary'
  }
}
