'use strict'

// Test helpers
const BillLicenceHelper = require('../../support/helpers/water/bill-licence.helper.js')
const BillLicenceModel = require('../../../app/models/water/bill-licence.model.js')
const ChargeVersionHelper = require('../../support/helpers/water/charge-version.helper.js')
const ChargeVersionModel = require('../../../app/models/water/charge-version.model.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/water/licence-version.helper.js')
const LicenceVersionModel = require('../../../app/models/water/licence-version.model.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')
const RegionModel = require('../../../app/models/water/region.model.js')
const WorkflowHelper = require('../../support/helpers/water/workflow.helper.js')
const WorkflowModel = require('../../../app/models/water/workflow.model.js')

// Thing under test
const LicenceModel = require('../../../app/models/water/licence.model.js')

describe('Licence model', () => {
  let testBillLicences
  let testChargeVersions
  let testRecord
  let testRegion
  let testWorkflows

  beforeEach(async () => {
    testRegion = await RegionHelper.add()
    testBillLicences = []
    testChargeVersions = []
    testWorkflows = []

    const { regionId } = testRegion
    testRecord = await LicenceHelper.add({ regionId })

    const { licenceId, licenceRef } = testRecord

    for (let i = 0; i < 2; i++) {
      const billLicence = await BillLicenceHelper.add({ licenceRef, licenceId })
      testBillLicences.push(billLicence)

      const chargeVersion = await ChargeVersionHelper.add({ licenceRef, licenceId })
      testChargeVersions.push(chargeVersion)

      const workflow = await WorkflowHelper.add({ licenceId })
      testWorkflows.push(workflow)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceModel.query().findById(testRecord.licenceId)

      expect(result).toBeInstanceOf(LicenceModel)
      expect(result.licenceId).toBe(testRecord.licenceId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge versions', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('chargeVersions')

        expect(query).toBeTruthy()
      })

      it('can eager load the charge versions', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.licenceId)
          .withGraphFetched('chargeVersions')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.licenceId).toBe(testRecord.licenceId)

        expect(result.chargeVersions).toBeInstanceOf(Array)
        expect(result.chargeVersions[0]).toBeInstanceOf(ChargeVersionModel)
        expect(result.chargeVersions).toContainEqual(testChargeVersions[0])
        expect(result.chargeVersions).toContainEqual(testChargeVersions[1])
      })
    })

    describe('when linking to region', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('region')

        expect(query).toBeTruthy()
      })

      it('can eager load the region', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.licenceId)
          .withGraphFetched('region')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.licenceId).toBe(testRecord.licenceId)

        expect(result.region).toBeInstanceOf(RegionModel)
        expect(result.region).toEqual(testRegion)
      })
    })

    describe('when linking to bill licences', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('billLicences')

        expect(query).toBeTruthy()
      })

      it('can eager load the bill licences', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.licenceId)
          .withGraphFetched('billLicences')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.licenceId).toBe(testRecord.licenceId)

        expect(result.billLicences).toBeInstanceOf(Array)
        expect(result.billLicences[0]).toBeInstanceOf(BillLicenceModel)
        expect(result.billLicences).toContainEqual(testBillLicences[0])
        expect(result.billLicences).toContainEqual(testBillLicences[1])
      })
    })

    describe('when linking to workflows', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('workflows')

        expect(query).toBeTruthy()
      })

      it('can eager load the workflows', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.licenceId)
          .withGraphFetched('workflows')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.licenceId).toBe(testRecord.licenceId)

        expect(result.workflows).toBeInstanceOf(Array)
        expect(result.workflows[0]).toBeInstanceOf(WorkflowModel)
        expect(result.workflows).toContainEqual(testWorkflows[0])
        expect(result.workflows).toContainEqual(testWorkflows[1])
      })
    })

    describe('when linking to licence versions', () => {
      let testLicenceVersions

      beforeEach(async () => {
        const { licenceId } = testRecord

        testLicenceVersions = []
        for (let i = 0; i < 2; i++) {
          const licenceVersion = await LicenceVersionHelper.add({ licenceId })
          testLicenceVersions.push(licenceVersion)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('licenceVersions')

        expect(query).to.exist()
      })

      it('can eager load the licence versions', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.licenceId)
          .withGraphFetched('licenceVersions')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.licenceId).to.equal(testRecord.licenceId)

        expect(result.licenceVersions).to.be.an.array()
        expect(result.licenceVersions[0]).to.be.an.instanceOf(LicenceVersionModel)
        expect(result.licenceVersions).to.include(testLicenceVersions[0])
        expect(result.licenceVersions).to.include(testLicenceVersions[1])
      })
    })
  })
})
