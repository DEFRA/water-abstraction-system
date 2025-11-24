'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ViewLicencesFixture = require('../../fixtures/view-licences.fixture.js')

// Things we need to stub
const FetchLicencePurposesService = require('../../../app/services/licences/fetch-licence-purposes.service.js')
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

// Thing under test
const ViewPurposesService = require('../../../app/services/licences/view-purposes.service.js')

describe('Licences - View Purposes service', () => {
  let auth
  let licence
  let purposes

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

    licence = ViewLicencesFixture.licence()

    purposes = [ViewLicencesFixture.licenceVersionPurpose()]

    Sinon.stub(FetchLicenceService, 'go').returns(licence)

    Sinon.stub(FetchLicencePurposesService, 'go').returns(purposes)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a licence with a matching ID exists', () => {
    it('correctly presents the data', async () => {
      const result = await ViewPurposesService.go(licence.id, auth)

      expect(result).to.equal({
        activeNavBar: 'search',
        activeSecondaryNav: 'summary',
        activeSummarySubNav: 'purposes',
        backLink: {
          href: `/system/licences/${licence.id}/summary`,
          text: 'Go back to summary'
        },
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
        pageTitleCaption: `Licence ${licence.licenceRef}`,
        roles: ['billing'],
        showingPurposes: 'Showing 1 purpose'
      })
    })
  })
})
