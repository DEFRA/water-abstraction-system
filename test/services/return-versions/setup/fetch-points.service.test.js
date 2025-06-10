'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
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

describe('Return Versions - Setup - Fetch Points service', () => {
  let licence
  let points

  before(async () => {
    points = await _points()

    const region = RegionHelper.select()

    // Create the initial licenceId
    licence = await LicenceHelper.add({
      regionId: region.id
    })

    // Add a licence version to it
    const licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id })

    // To demonstrate that we are fetching the points from _all_ purposes we add two purposes each with their own
    // point
    for (let i = 1; i < 3; i++) {
      const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({ licenceVersionId: licenceVersion.id })

      // Create a link between the purpose and the point created just for it
      await LicenceVersionPurposePointHelper.add({
        licenceVersionPurposeId: licenceVersionPurpose.id,
        pointId: points[i].id
      })

      // Create a link between the purpose and the shared point
      await LicenceVersionPurposePointHelper.add({
        licenceVersionPurposeId: licenceVersionPurpose.id,
        pointId: points[0].id
      })
    }
  })

  describe('when the matching licence exists', () => {
    it('returns the licence version purpose points for the licence', async () => {
      const results = await FetchPointsService.go(licence.id)

      expect(results).to.have.length(3)

      expect(results).to.equal([
        {
          id: points[2].id,
          description: 'I am point 2',
          ngr1: points[2].ngr1,
          ngr2: null,
          ngr3: null,
          ngr4: null
        },
        {
          id: points[0].id,
          description: 'I am the shared point',
          ngr1: points[0].ngr1,
          ngr2: null,
          ngr3: null,
          ngr4: null
        },
        {
          id: points[1].id,
          description: 'I am point 1',
          ngr1: points[1].ngr1,
          ngr2: null,
          ngr3: null,
          ngr4: null
        }
      ])
    })
  })

  describe('when the matching licence does not exist', () => {
    it('throws an error', async () => {
      await expect(FetchPointsService.go('7f665e1b-a2cf-4241-9dc9-9351edc16533')).to.reject()
    })
  })
})

/**
 * Creates the points that will be assigned to the licence version purposes
 *
 * This function generates three points: one shared point that is expected to appear only once in the
 * service results, and two additional points each uniquely assigned to the different purposes.
 *
 * It also generates the first NGR for them so we can assert that the results are ordered by NGR1.
 *
 * @private
 */
async function _points() {
  const points = []

  // To demonstrate that the service returns a an array of unique points, we create one that all purposes will share. We
  // expect to see it only listed once in the results from the service.
  const sharedPoint = await PointHelper.add({
    description: `I am the shared point`,
    ngr1: `SU${PointHelper.generateNationalGridReference().slice(2)}`
  })

  points.push(sharedPoint)

  // This point will only be assigned to the first of the two purposes we'll add
  const point1 = await PointHelper.add({
    description: 'I am point 1',
    ngr1: `TQ${PointHelper.generateNationalGridReference().slice(2)}`
  })

  points.push(point1)

  // This point will only be assigned to the second of the two purposes we'll add
  const point2 = await PointHelper.add({
    description: 'I am point 2',
    ngr1: `SE${PointHelper.generateNationalGridReference().slice(2)}`
  })

  points.push(point2)

  return points
}
