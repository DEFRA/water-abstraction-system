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
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const FetchPointsService = require('../../../app/services/return-requirements/fetch-points.service.js')

describe('Return Requirements - Fetch Points service', () => {
  let licence
  let licenceVersionPurposePoints

  before(async () => {
    const region = RegionHelper.select()

    // Create the initial licenceId
    licence = await LicenceHelper.add({
      regionId: region.id
    })

    const licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id })

    licenceVersionPurposePoints = []
    for (let i = 0; i < 2; i++) {
      // To demonstrate that we are fetching the points from _all_ purposes we add two purposes each with their own
      // point
      const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({ licenceVersionId: licenceVersion.id })
      const licenceVersionPurposePoint = await LicenceVersionPurposePointHelper.add({
        description: `I am point ${i + 1}`,
        licenceVersionPurposeId: licenceVersionPurpose.id
      })

      licenceVersionPurposePoints.push(licenceVersionPurposePoint)
    }
  })

  describe('when the matching licence exists', () => {
    it('returns the licence version purpose points for the licence', async () => {
      const results = await FetchPointsService.go(licence.id)

      expect(results[0]).to.equal({
        id: licenceVersionPurposePoints[0].id,
        description: licenceVersionPurposePoints[0].description,
        ngr1: licenceVersionPurposePoints[0].ngr1,
        ngr2: licenceVersionPurposePoints[0].ngr2,
        ngr3: licenceVersionPurposePoints[0].ngr3,
        ngr4: licenceVersionPurposePoints[0].ngr4
      })

      expect(results[1]).to.equal({
        id: licenceVersionPurposePoints[1].id,
        description: licenceVersionPurposePoints[1].description,
        ngr1: licenceVersionPurposePoints[1].ngr1,
        ngr2: licenceVersionPurposePoints[1].ngr2,
        ngr3: licenceVersionPurposePoints[1].ngr3,
        ngr4: licenceVersionPurposePoints[1].ngr4
      })
    })
  })

  describe('when the matching licence does not exist', () => {
    it('throws an error', async () => {
      await expect(FetchPointsService.go('7f665e1b-a2cf-4241-9dc9-9351edc16533')).to.reject()
    })
  })
})
