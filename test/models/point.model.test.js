'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceVersionPurposeHelper = require('../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposeModel = require('../../app/models/licence-version-purpose.model.js')
const LicenceVersionPurposePointHelper = require('../support/helpers/licence-version-purpose-point.helper.js')
const PointHelper = require('../support/helpers/point.helper.js')
const ReturnRequirementHelper = require('../support/helpers/return-requirement.helper.js')
const ReturnRequirementModel = require('../../app/models/return-requirement.model.js')
const ReturnRequirementPointHelper = require('../support/helpers/return-requirement-point.helper.js')
const SourceHelper = require('../support/helpers/source.helper.js')
const SourceModel = require('../../app/models/source.model.js')

// Thing under test
const PointModel = require('../../app/models/point.model.js')

describe('Point model', () => {
  let testLicenceVersionPurpose
  let testRecord
  let testReturnRequirement
  let testSource

  before(async () => {
    testSource = SourceHelper.select()
    testRecord = await PointHelper.add({ sourceId: testSource.id })

    testReturnRequirement = await ReturnRequirementHelper.add()
    await ReturnRequirementPointHelper.add({
      pointId: testRecord.id, returnRequirementId: testReturnRequirement.id
    })

    testLicenceVersionPurpose = await LicenceVersionPurposeHelper.add()
    await LicenceVersionPurposePointHelper.add({
      licenceVersionPurposeId: testLicenceVersionPurpose.id, pointId: testRecord.id
    })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await PointModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(PointModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking through licence version purpose points to licence version purposes', () => {
      it('can successfully run a related query', async () => {
        const query = await PointModel.query()
          .innerJoinRelated('licenceVersionPurposes')

        expect(query).to.exist()
      })

      it('can eager load the licence version purposes', async () => {
        const result = await PointModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurposes')

        expect(result).to.be.instanceOf(PointModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersionPurposes).to.be.an.array()
        expect(result.licenceVersionPurposes).to.have.length(1)
        expect(result.licenceVersionPurposes[0]).to.be.an.instanceOf(LicenceVersionPurposeModel)
        expect(result.licenceVersionPurposes[0]).to.equal(
          testLicenceVersionPurpose, { skip: ['createdAt', 'updatedAt'] }
        )
      })
    })

    describe('when linking through return requirement points to return requirements', () => {
      it('can successfully run a related query', async () => {
        const query = await PointModel.query()
          .innerJoinRelated('returnRequirements')

        expect(query).to.exist()
      })

      it('can eager load the return requirements', async () => {
        const result = await PointModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnRequirements')

        expect(result).to.be.instanceOf(PointModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnRequirements).to.be.an.array()
        expect(result.returnRequirements).to.have.length(1)
        expect(result.returnRequirements[0]).to.be.an.instanceOf(ReturnRequirementModel)
        expect(result.returnRequirements[0]).to.equal(testReturnRequirement, { skip: ['createdAt', 'updatedAt'] })
      })
    })

    describe('when linking to source', () => {
      it('can successfully run a related query', async () => {
        const query = await PointModel.query()
          .innerJoinRelated('source')

        expect(query).to.exist()
      })

      it('can eager load the source', async () => {
        const result = await PointModel.query()
          .findById(testRecord.id)
          .withGraphFetched('source')

        expect(result).to.be.instanceOf(PointModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.source).to.be.an.instanceOf(SourceModel)
        expect(result.source).to.equal(testSource, { skip: ['createdAt', 'updatedAt'] })
      })
    })
  })

  describe('$describe', () => {
    describe('when the instance represents a "point" (1 grid reference)', () => {
      beforeEach(() => {
        testRecord = PointModel.fromJson({ ngr1: 'ST 58212 72697' })
      })

      describe('and it has a supplementary description', () => {
        beforeEach(() => {
          testRecord.description = 'Head office'
        })

        it('returns a "point" description including the supplementary', () => {
          const result = testRecord.$describe()

          expect(result).to.equal('At National Grid Reference ST 58212 72697 (Head office)')
        })
      })

      describe('and it does not have a supplementary description', () => {
        it('returns just the "point" description', () => {
          const result = testRecord.$describe()

          expect(result).to.equal('At National Grid Reference ST 58212 72697')
        })
      })
    })

    describe('when the instance represents a "reach" (2 grid references)', () => {
      beforeEach(() => {
        testRecord = PointModel.fromJson({ ngr1: 'ST 58212 72697', ngr2: 'ST 58151 72683' })
      })

      describe('and it has a supplementary description', () => {
        beforeEach(() => {
          testRecord.description = 'Head office'
        })

        it('returns a "reach" description including the supplementary', () => {
          const result = testRecord.$describe()

          expect(result).to.equal('Between National Grid References ST 58212 72697 and ST 58151 72683 (Head office)')
        })
      })

      describe('and it does not have a supplementary description', () => {
        it('returns just the "reach" description', () => {
          const result = testRecord.$describe()

          expect(result).to.equal('Between National Grid References ST 58212 72697 and ST 58151 72683')
        })
      })
    })

    describe('when the instance represents an "area" (4 grid references)', () => {
      beforeEach(() => {
        testRecord = PointModel.fromJson({
          ngr1: 'ST 58212 72697', ngr2: 'ST 58151 72683', ngr3: 'ST 58145 72727', ngr4: 'ST 58222 72744'
        })
      })

      describe('and it has a supplementary description', () => {
        beforeEach(() => {
          testRecord.description = 'Head office'
        })

        it('returns an "area" description including the supplementary', () => {
          const result = testRecord.$describe()

          expect(result).to.equal('Within the area formed by the straight lines running between National Grid References ST 58212 72697 ST 58151 72683 ST 58145 72727 and ST 58222 72744 (Head office)')
        })
      })

      describe('and it does not have a supplementary description', () => {
        it('returns just the "area" description', () => {
          const result = testRecord.$describe()

          expect(result).to.equal('Within the area formed by the straight lines running between National Grid References ST 58212 72697 ST 58151 72683 ST 58145 72727 and ST 58222 72744')
        })
      })
    })
  })
})
