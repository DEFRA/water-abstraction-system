'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicencesFixture = require('../../fixtures/licences.fixture.js')

// Things we need to stub
const FetchLicencePurposesService = require('../../../app/services/licences/fetch-licence-purposes.service.js')

// Thing under test
const ViewPurposesService = require('../../../app/services/licences/view-purposes.service.js')

describe('Licences - View Purposes service', () => {
  let auth
  let licenceFixture

  beforeEach(() => {
    auth = {
      credentials: {
        roles: [
          {
            role: 'billing'
          }
        ]
      }
    }

    licenceFixture = LicencesFixture.licence()

    Sinon.stub(FetchLicencePurposesService, 'go').returns(licenceFixture.licence)
  })

  describe('when a licence with a matching ID exists', () => {
    it('correctly presents the data', async () => {
      const result = await ViewPurposesService.go(licenceFixture.licence.id, auth)

      expect(result).to.equal({
        activeNavBar: 'search',
        activeSummarySubNav: 'purposes',
        activeTab: 'summary',
        backLink: {
          href: `/system/licences/${licenceFixture.licence.id}/summary`,
          text: 'Go back to summary'
        },
        licenceBaseLink: `/system/licences/${licenceFixture.licence.id}`,
        licencePurposes: [
          {
            abstractionAmounts: [
              '180,000.00 cubic metres per year',
              '720.00 cubic metres per day',
              '144.00 cubic metres per hour',
              '40.00 litres per second'
            ],
            abstractionAmountsTitle: 'Abstraction amounts',
            abstractionMethods: 'Unspecified Pump',
            abstractionMethodsTitle: 'Method of abstraction',
            abstractionPeriod: '1 April to 31 October',
            abstractionPoints: ['At National Grid Reference TL 23198 88603'],
            abstractionPointsTitle: 'Abstraction point',
            purposeDescription: 'Spray Irrigation - Storage'
          }
        ],
        pageTitle: 'Purposes, periods and amounts',
        pageTitleCaption: `Licence ${licenceFixture.licence.licenceRef}`,
        roles: ['billing'],
        showingPurposes: 'Showing 1 purposes'
      })
    })
  })
})
