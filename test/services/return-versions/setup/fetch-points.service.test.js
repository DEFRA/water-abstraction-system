'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposePointHelper = require('../../../support/helpers/licence-version-purpose-point.helper.js')
const PointHelper = require('../../../support/helpers/point.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Thing under test
const FetchPointsService = require('../../../../app/services/return-versions/setup/fetch-points.service.js')

describe('Return Versions Setup - Fetch Points service', () => {
  let licence
  let points

  before(async () => {
    const region = RegionHelper.select()

    // Create the initial licenceId
    licence = await LicenceHelper.add({
      regionId: region.id
    })

    const licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id })

    points = []
    for (let i = 0; i < 2; i++) {
      // To demonstrate that we are fetching the points from _all_ purposes we add two purposes each with their own
      // point
      const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({ licenceVersionId: licenceVersion.id })
      const point = await PointHelper.add({ description: `I am point ${i + 1}` })

      await LicenceVersionPurposePointHelper.add({
        licenceVersionPurposeId: licenceVersionPurpose.id,
        pointId: point.id
      })

      points.push(point)
    }
  })

  describe('when the matching licence exists', () => {
    it('returns the licence version purpose points for the licence', async () => {
      const results = await FetchPointsService.go(licence.id)

      expect(results[0]).to.equal({
        id: points[0].id,
        description: points[0].description,
        ngr1: points[0].ngr1,
        ngr2: points[0].ngr2,
        ngr3: points[0].ngr3,
        ngr4: points[0].ngr4
      })

      expect(results[1]).to.equal({
        id: points[1].id,
        description: points[1].description,
        ngr1: points[1].ngr1,
        ngr2: points[1].ngr2,
        ngr3: points[1].ngr3,
        ngr4: points[1].ngr4
      })
    })
  })

  describe('when the matching licence does not exist', () => {
    it('throws an error', async () => {
      await expect(FetchPointsService.go('7f665e1b-a2cf-4241-9dc9-9351edc16533')).to.reject()
    })
  })
})
