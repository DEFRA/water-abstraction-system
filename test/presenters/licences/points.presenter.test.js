'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ViewLicencesFixture = require('../../fixtures/view-licences.fixture.js')

// Thing under test
const PointsPresenter = require('../../../app/presenters/licences/points.presenter.js')

describe('Licences - Points presenter', () => {
  let licence
  let points

  beforeEach(() => {
    licence = ViewLicencesFixture.licence()

    points = [
      {
        ...ViewLicencesFixture.point(),
        sourceDescription: 'SURFACE WATER SOURCE OF SUPPLY',
        sourceType: 'Borehole'
      }
    ]
  })

  describe('when provided with a populated licence and points', () => {
    it('returns the expected licence points details', () => {
      const result = PointsPresenter.go(points, licence)

      expect(result).to.equal({
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
        showingPoints: 'Showing 1 abstraction point'
      })
    })
  })
})
