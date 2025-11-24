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
const FetchLicencePointsService = require('../../../app/services/licences/fetch-licence-points.service.js')

// Thing under test
const ViewPointsService = require('../../../app/services/licences/view-points.service.js')

describe('Licences - View Points service', () => {
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

    Sinon.stub(FetchLicencePointsService, 'go').returns(licenceFixture)
  })

  describe('when a licence with a matching ID exists', () => {
    it('correctly presents the data', async () => {
      const result = await ViewPointsService.go(licenceFixture.licence.id, auth)

      expect(result).to.equal({
        activeNavBar: 'search',
        activeSecondaryNav: 'summary',
        activeSummarySubNav: 'points',
        backLink: {
          href: `/system/licences/${licenceFixture.licence.id}/summary`,
          text: 'Go back to summary'
        },
        licencePoints: [
          {
            bgsReference: 'TL 14/123',
            category: 'Single Point',
            depth: '123',
            description: 'RIVER OUSE AT BLETSOE',
            gridReference:
              'Within the area formed by the straight lines running between National Grid References SD 963 193, SD 963 193, SD 963 193 and SD 963 193 (RIVER OUSE AT BLETSOE)',
            hydroInterceptDistance: '8.01',
            hydroOffsetDistance: '5.56',
            hydroReference: 'TL 14/133',
            locationNote: 'Castle Farm, The Loke, Gresham, Norfolk',
            note: 'WELL IS SPRING-FED',
            primaryType: 'Groundwater',
            secondaryType: 'Borehole',
            sourceDescription: 'SURFACE WATER SOURCE OF SUPPLY',
            sourceType: 'Borehole',
            wellReference: '81312'
          }
        ],
        pageTitle: 'Points',
        pageTitleCaption: `Licence ${licenceFixture.licence.licenceRef}`,
        roles: ['billing'],
        showingPoints: 'Showing 1 abstraction point'
      })
    })
  })
})
