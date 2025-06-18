'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceVersionHelper = require('../../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposePointHelper = require('../../../support/helpers/licence-version-purpose-point.helper.js')
const PointHelper = require('../../../support/helpers/point.helper.js')
const PointModel = require('../../../../app/models/point.model.js')

// Thing under test
const FetchPointsService = require('../../../../app/services/return-versions/setup/fetch-points.service.js')

describe('Return Versions - Setup - Fetch Points service', () => {
  let licenceVersion
  let points

  before(async () => {
    points = await _points()

    // Create the initial licenceId
    licenceVersion = await LicenceVersionHelper.add()

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
      const results = await FetchPointsService.go(licenceVersion.id)

      // NOTE: The final list of points the user sees is sorted by their generated description. So, the service does not
      // sort the results in the fetch, which means we cannot guarantee what order they'll be in for the test. So, to
      // avoid intermittent failures we check that the results contain each point we expect, and has the expected number
      // of results
      expect(results).to.have.length(3)

      expect(results).to.contain(
        PointModel.fromJson({
          id: points[0].id,
          description: 'I am the shared point',
          ngr1: points[0].ngr1,
          ngr2: null,
          ngr3: null,
          ngr4: null
        })
      )

      expect(results).to.contain(
        PointModel.fromJson({
          id: points[1].id,
          description: 'I am point 1',
          ngr1: points[1].ngr1,
          ngr2: null,
          ngr3: null,
          ngr4: null
        })
      )

      expect(results).to.contain(
        PointModel.fromJson({
          id: points[2].id,
          description: 'I am point 2',
          ngr1: points[2].ngr1,
          ngr2: null,
          ngr3: null,
          ngr4: null
        })
      )
    })
  })

  describe('when the matching licence version does not exist', () => {
    it('returns an empty array', async () => {
      const results = await FetchPointsService.go('7f665e1b-a2cf-4241-9dc9-9351edc16533')

      expect(results).to.be.empty()
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

  // To demonstrate that the service returns an array of unique points, we create one that all purposes will share. We
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
