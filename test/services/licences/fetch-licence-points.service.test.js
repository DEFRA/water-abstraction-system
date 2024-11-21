'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposePointHelper = require('../../support/helpers/licence-version-purpose-point.helper.js')
const PointHelper = require('../../support/helpers/point.helper.js')
const SourceHelper = require('../../support/helpers/source.helper.js')

// Thing under test
const FetchLicencePointsService = require('../../../app/services/licences/fetch-licence-points.service.js')

describe('Fetch Licence Points service', () => {
  let licence
  let licenceVersion
  let licenceVersionPurpose
  let point
  let source

  describe('when the licence has licence versions, licence version purposes, points, and sources', () => {
    before(async () => {
      licence = await LicenceHelper.add()

      licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id })

      licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersion.id
      })

      source = await SourceHelper.select()
      point = await PointHelper.add({
        bgsReference: 'TL 14/123',
        category: 'Single Point',
        depth: 123,
        description: 'RIVER OUSE AT BLETSOE',
        hydroInterceptDistance: 8.01,
        hydroReference: 'TL 14/133',
        hydroOffsetDistance: 5.56,
        locationNote: 'Castle Farm, The Loke, Gresham, Norfolk',
        ngr1: 'SD 963 193',
        ngr2: 'SD 963 193',
        ngr3: 'SD 963 193',
        ngr4: 'SD 963 193',
        note: 'WELL IS SPRING-FED',
        primaryType: 'Groundwater',
        secondaryType: 'Borehole',
        sourceId: source.id,
        wellReference: '81312'
      })

      await LicenceVersionPurposePointHelper.add({
        licenceVersionPurposeId: licenceVersionPurpose.id,
        pointId: point.id
      })
    })

    it('returns the matching licence and its related points and source', async () => {
      const result = await FetchLicencePointsService.go(licence.id)

      expect(result).to.equal({
        licence: {
          id: licence.id,
          licenceRef: licence.licenceRef
        },
        points: [
          {
            bgsReference: 'TL 14/123',
            category: 'Single Point',
            depth: 123,
            description: 'RIVER OUSE AT BLETSOE',
            hydroInterceptDistance: 8.01,
            hydroReference: 'TL 14/133',
            hydroOffsetDistance: 5.56,
            pointId: point.id,
            locationNote: 'Castle Farm, The Loke, Gresham, Norfolk',
            ngr1: 'SD 963 193',
            ngr2: 'SD 963 193',
            ngr3: 'SD 963 193',
            ngr4: 'SD 963 193',
            note: 'WELL IS SPRING-FED',
            primaryType: 'Groundwater',
            secondaryType: 'Borehole',
            wellReference: '81312',
            sourceDescription: source.description,
            sourceType: source.sourceType
          }
        ]
      })
    })
  })
})
