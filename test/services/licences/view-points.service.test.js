'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../app/models/licence.model.js')
const PointModel = require('../../../app/models/point.model.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const FetchLicencePointsService = require('../../../app/services/licences/fetch-licence-points.service.js')

// Thing under test
const ViewPointsService = require('../../../app/services/licences/view-points.service.js')

describe('Licences - View Points service', () => {
  let licenceId
  let licenceRef

  beforeEach(() => {
    licenceId = generateUUID()
    licenceRef = generateLicenceRef()

    Sinon.stub(FetchLicencePointsService, 'go').returns(_testFetchLicencePoints(licenceId, licenceRef))
  })

  describe('when a licence with a matching ID exists', () => {
    it('correctly presents the data', async () => {
      const result = await ViewPointsService.go('761bc44f-80d5-49ae-ab46-0a90495417b5')

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: {
          href: `/system/licences/${licenceId}/summary`,
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
        pageTitle: 'Licence abstraction points',
        pageTitleCaption: `Licence ${licenceRef}`
      })
    })
  })
})

function _testFetchLicencePoints(licenceId, licenceRef) {
  const point = PointModel.fromJson({
    bgsReference: 'TL 14/123',
    category: 'Single Point',
    depth: 123,
    description: 'RIVER OUSE AT BLETSOE',
    hydroInterceptDistance: 8.01,
    hydroReference: 'TL 14/133',
    hydroOffsetDistance: 5.56,
    id: generateUUID(),
    locationNote: 'Castle Farm, The Loke, Gresham, Norfolk',
    ngr1: 'SD 963 193',
    ngr2: 'SD 963 193',
    ngr3: 'SD 963 193',
    ngr4: 'SD 963 193',
    note: 'WELL IS SPRING-FED',
    primaryType: 'Groundwater',
    secondaryType: 'Borehole',
    wellReference: '81312',
    sourceDescription: 'SURFACE WATER SOURCE OF SUPPLY',
    sourceType: 'Borehole'
  })

  const licence = LicenceModel.fromJson({
    id: licenceId,
    licenceRef
  })

  return {
    licence,
    points: [point]
  }
}
