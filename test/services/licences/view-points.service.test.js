'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ViewLicencesFixture = require('../../fixtures/view-licences.fixture.js')

// Things we need to stub
const FetchPointsService = require('../../../app/services/licences/fetch-points.service.js')
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

// Thing under test
const ViewPointsService = require('../../../app/services/licences/view-points.service.js')

describe('Licences - View Points service', () => {
  let auth
  let licence

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

    Sinon.stub(FetchLicenceService, 'go').returns(licence)

    Sinon.stub(FetchPointsService, 'go').returns([
      {
        ...ViewLicencesFixture.point(),
        sourceDescription: 'SURFACE WATER SOURCE OF SUPPLY',
        sourceType: 'Borehole'
      }
    ])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a licence with a matching ID exists', () => {
    it('correctly presents the data', async () => {
      const result = await ViewPointsService.go(licence.id, auth)

      expect(result).to.equal({
        activeNavBar: 'search',
        activeSecondaryNav: 'summary',
        activeSummarySubNav: 'points',
        backLink: {
          href: `/system/licences/${licence.id}/summary`,
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
        pageTitleCaption: `Licence ${licence.licenceRef}`,
        roles: ['billing'],
        showingPoints: 'Showing 1 abstraction point'
      })
    })
  })
})
