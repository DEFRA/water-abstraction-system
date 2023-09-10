'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillLicenceHelper = require('../../support/helpers/water/bill-licence.helper.js')
const BillLicenceModel = require('../../../app/models/water/bill-licence.model.js')
const ChargeVersionHelper = require('../../support/helpers/water/charge-version.helper.js')
const ChargeVersionModel = require('../../../app/models/water/charge-version.model.js')
const ChargeVersionWorkflowHelper = require('../../support/helpers/water/charge-version-workflow.helper.js')
const ChargeVersionWorkflowModel = require('../../../app/models/water/charge-version-workflow.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')
const RegionModel = require('../../../app/models/water/region.model.js')

// Thing under test
const LicenceModel = require('../../../app/models/water/licence.model.js')

describe('Licence model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await LicenceHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceModel.query().findById(testRecord.licenceId)

      expect(result).to.be.an.instanceOf(LicenceModel)
      expect(result.licenceId).to.equal(testRecord.licenceId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge versions', () => {
      let testChargeVersions

      beforeEach(async () => {
        const { licenceId, licenceRef } = testRecord

        testChargeVersions = []
        for (let i = 0; i < 2; i++) {
          const chargeVersion = await ChargeVersionHelper.add({ licenceRef, licenceId })
          testChargeVersions.push(chargeVersion)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('chargeVersions')

        expect(query).to.exist()
      })

      it('can eager load the charge versions', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.licenceId)
          .withGraphFetched('chargeVersions')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.licenceId).to.equal(testRecord.licenceId)

        expect(result.chargeVersions).to.be.an.array()
        expect(result.chargeVersions[0]).to.be.an.instanceOf(ChargeVersionModel)
        expect(result.chargeVersions).to.include(testChargeVersions[0])
        expect(result.chargeVersions).to.include(testChargeVersions[1])
      })
    })

    describe('when linking to region', () => {
      let testRegion

      beforeEach(async () => {
        testRegion = await RegionHelper.add()

        const { regionId } = testRegion
        testRecord = await LicenceHelper.add({ regionId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('region')

        expect(query).to.exist()
      })

      it('can eager load the region', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.licenceId)
          .withGraphFetched('region')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.licenceId).to.equal(testRecord.licenceId)

        expect(result.region).to.be.an.instanceOf(RegionModel)
        expect(result.region).to.equal(testRegion)
      })
    })

    describe('when linking to bill licences', () => {
      let testBillLicences

      beforeEach(async () => {
        const { licenceId, licenceRef } = testRecord

        testBillLicences = []
        for (let i = 0; i < 2; i++) {
          const billLicence = await BillLicenceHelper.add({ licenceRef, licenceId })
          testBillLicences.push(billLicence)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('billLicences')

        expect(query).to.exist()
      })

      it('can eager load the bill licences', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.licenceId)
          .withGraphFetched('billLicences')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.licenceId).to.equal(testRecord.licenceId)

        expect(result.billLicences).to.be.an.array()
        expect(result.billLicences[0]).to.be.an.instanceOf(BillLicenceModel)
        expect(result.billLicences).to.include(testBillLicences[0])
        expect(result.billLicences).to.include(testBillLicences[1])
      })
    })

    describe('when linking to charge version workflows', () => {
      let testChargeVersionWorkflows

      beforeEach(async () => {
        const { licenceId } = testRecord

        testChargeVersionWorkflows = []
        for (let i = 0; i < 2; i++) {
          const chargeVersionWorkflow = await ChargeVersionWorkflowHelper.add({ licenceId })
          testChargeVersionWorkflows.push(chargeVersionWorkflow)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('chargeVersionWorkflows')

        expect(query).to.exist()
      })

      it('can eager load the charge version workflows', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.licenceId)
          .withGraphFetched('chargeVersionWorkflows')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.licenceId).to.equal(testRecord.licenceId)

        expect(result.chargeVersionWorkflows).to.be.an.array()
        expect(result.chargeVersionWorkflows[0]).to.be.an.instanceOf(ChargeVersionWorkflowModel)
        expect(result.chargeVersionWorkflows).to.include(testChargeVersionWorkflows[0])
        expect(result.chargeVersionWorkflows).to.include(testChargeVersionWorkflows[1])
      })
    })
  })
})
