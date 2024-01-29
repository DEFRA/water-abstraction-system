'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillLicenceHelper = require('../support/helpers/bill-licence.helper.js')
const BillLicenceModel = require('../../app/models/bill-licence.model.js')
const ChargeVersionHelper = require('../support/helpers/charge-version.helper.js')
const ChargeVersionModel = require('../../app/models/charge-version.model.js')
const CompanyHelper = require('../support/helpers/company.helper.js')
const ContactHelper = require('../support/helpers/contact.helper.js')
const DatabaseHelper = require('../support/helpers/database.helper.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceDocumentHelper = require('../support/helpers/licence-document.helper.js')
const LicenceDocumentModel = require('../../app/models/licence-document.model.js')
const LicenceDocumentHeaderHelper = require('../support/helpers/licence-document-header.helper.js')
const LicenceDocumentHeaderModel = require('../../app/models/licence-document-header.model.js')
const LicenceDocumentRoleHelper = require('../support/helpers/licence-document-role.helper.js')
const LicenceRoleHelper = require('../support/helpers/licence-role.helper.js')
const LicenceVersionHelper = require('../support/helpers/licence-version.helper.js')
const LicenceVersionModel = require('../../app/models/licence-version.model.js')
const RegionHelper = require('../support/helpers/region.helper.js')
const RegionModel = require('../../app/models/region.model.js')
const RegisteredToAndLicenceNameSeeder = require('../support/seeders/registered-to-and-licence-name.seeder.js')
const WorkflowHelper = require('../support/helpers/workflow.helper.js')
const WorkflowModel = require('../../app/models/workflow.model.js')

// Thing under test
const LicenceModel = require('../../app/models/licence.model.js')

describe('Licence model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await LicenceHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill licences', () => {
      let testBillLicences

      beforeEach(async () => {
        const { id, licenceRef } = testRecord

        testBillLicences = []
        for (let i = 0; i < 2; i++) {
          const billLicence = await BillLicenceHelper.add({ licenceRef, licenceId: id })
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
          .findById(testRecord.id)
          .withGraphFetched('billLicences')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billLicences).to.be.an.array()
        expect(result.billLicences[0]).to.be.an.instanceOf(BillLicenceModel)
        expect(result.billLicences).to.include(testBillLicences[0])
        expect(result.billLicences).to.include(testBillLicences[1])
      })
    })

    describe('when linking to charge versions', () => {
      let testChargeVersions

      beforeEach(async () => {
        const { id, licenceRef } = testRecord

        testChargeVersions = []
        for (let i = 0; i < 2; i++) {
          const chargeVersion = await ChargeVersionHelper.add({ licenceRef, licenceId: id })
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
          .findById(testRecord.id)
          .withGraphFetched('chargeVersions')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeVersions).to.be.an.array()
        expect(result.chargeVersions[0]).to.be.an.instanceOf(ChargeVersionModel)
        expect(result.chargeVersions).to.include(testChargeVersions[0])
        expect(result.chargeVersions).to.include(testChargeVersions[1])
      })
    })

    describe('when linking to licence document', () => {
      let testLicenceDocument

      beforeEach(async () => {
        testLicenceDocument = await LicenceDocumentHelper.add()

        const { licenceRef } = testLicenceDocument
        testRecord = await LicenceHelper.add({ licenceRef })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('licenceDocument')

        expect(query).to.exist()
      })

      it('can eager load the licence document', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceDocument')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceDocument).to.be.an.instanceOf(LicenceDocumentModel)
        expect(result.licenceDocument).to.equal(testLicenceDocument)
      })
    })

    describe('when linking to licence document header', () => {
      let testLicenceDocumentHeader

      beforeEach(async () => {
        testLicenceDocumentHeader = await LicenceDocumentHeaderHelper.add()

        const { licenceRef } = testLicenceDocumentHeader
        testRecord = await LicenceHelper.add({ licenceRef })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('licenceDocumentHeader')

        expect(query).to.exist()
      })

      it('can eager load the licence document header', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceDocumentHeader')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceDocumentHeader).to.be.an.instanceOf(LicenceDocumentHeaderModel)
        expect(result.licenceDocumentHeader).to.equal(testLicenceDocumentHeader)
      })
    })

    describe('when linking to licence versions', () => {
      let testLicenceVersions

      beforeEach(async () => {
        const { id } = testRecord

        testLicenceVersions = []
        for (let i = 0; i < 2; i++) {
          const licenceVersion = await LicenceVersionHelper.add({ licenceId: id })
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
          .findById(testRecord.id)
          .withGraphFetched('licenceVersions')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersions).to.be.an.array()
        expect(result.licenceVersions[0]).to.be.an.instanceOf(LicenceVersionModel)
        expect(result.licenceVersions).to.include(testLicenceVersions[0])
        expect(result.licenceVersions).to.include(testLicenceVersions[1])
      })
    })

    describe('when linking to region', () => {
      let testRegion

      beforeEach(async () => {
        testRegion = await RegionHelper.add()

        const { id: regionId } = testRegion
        testRecord = await LicenceHelper.add({ regionId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('region')

        expect(query).to.exist()
      })

      it('can eager load the region', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('region')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.region).to.be.an.instanceOf(RegionModel)
        expect(result.region).to.equal(testRegion)
      })
    })

    describe('when linking to workflows', () => {
      let testWorkflows

      beforeEach(async () => {
        const { id } = testRecord

        testWorkflows = []
        for (let i = 0; i < 2; i++) {
          const workflow = await WorkflowHelper.add({ licenceId: id })
          testWorkflows.push(workflow)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('workflows')

        expect(query).to.exist()
      })

      it('can eager load the workflows', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('workflows')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.workflows).to.be.an.array()
        expect(result.workflows[0]).to.be.an.instanceOf(WorkflowModel)
        expect(result.workflows).to.include(testWorkflows[0])
        expect(result.workflows).to.include(testWorkflows[1])
      })
    })
  })

  describe('$ends', () => {
    let expiredDate
    let lapsedDate
    let revokedDate

    describe('when no end dates are set', () => {
      it('returns null', () => {
        testRecord = LicenceModel.fromJson({})

        expect(testRecord.$ends()).to.be.null()
      })
    })

    describe('when all the end dates are null', () => {
      beforeEach(() => {
        expiredDate = null
        lapsedDate = null
        revokedDate = null
      })

      it('returns null', () => {
        testRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })

        expect(testRecord.$ends()).to.be.null()
      })
    })

    describe('when only the revoked date is set', () => {
      beforeEach(() => {
        revokedDate = new Date('2023-03-07')
      })

      it("returns 'revoked' as the reason and '2023-03-07' as the date", () => {
        const result = LicenceModel.fromJson({ revokedDate }).$ends()

        expect(result).to.equal({ date: new Date('2023-03-07'), priority: 1, reason: 'revoked' })
      })
    })

    describe('when only the lapsed date is set', () => {
      beforeEach(() => {
        lapsedDate = new Date('2023-03-08')
      })

      it("returns 'lapsed' as the reason and '2023-03-08' as the date", () => {
        const result = LicenceModel.fromJson({ lapsedDate }).$ends()

        expect(result).to.equal({ date: new Date('2023-03-08'), priority: 2, reason: 'lapsed' })
      })
    })

    describe('when only the expired date is set', () => {
      beforeEach(() => {
        expiredDate = new Date('2023-03-09')
      })

      it("returns 'lapsed' as the reason and '2023-03-09' as the date", () => {
        const result = LicenceModel.fromJson({ expiredDate }).$ends()

        expect(result).to.equal({ date: new Date('2023-03-09'), priority: 3, reason: 'expired' })
      })
    })

    describe('when two dates are set', () => {
      describe('that have different dates', () => {
        beforeEach(() => {
          expiredDate = new Date('2023-03-09')
          lapsedDate = new Date('2023-03-08')
        })

        it('returns the one with the earliest date', () => {
          const result = LicenceModel.fromJson({ expiredDate, lapsedDate }).$ends()

          expect(result).to.equal({ date: new Date('2023-03-08'), priority: 2, reason: 'lapsed' })
        })
      })

      describe('that have the same date', () => {
        beforeEach(() => {
          expiredDate = new Date('2023-03-09')
          lapsedDate = new Date('2023-03-09')
          revokedDate = new Date('2023-03-09')
        })

        describe("and they are 'lapsed' and 'expired'", () => {
          it("returns 'lapsed' as the end date", () => {
            const result = LicenceModel.fromJson({ expiredDate, lapsedDate }).$ends()

            expect(result).to.equal({ date: new Date('2023-03-09'), priority: 2, reason: 'lapsed' })
          })
        })

        describe("and they are 'lapsed' and 'revoked'", () => {
          it("returns 'revoked' as the end date", () => {
            const result = LicenceModel.fromJson({ lapsedDate, revokedDate }).$ends()

            expect(result).to.equal({ date: new Date('2023-03-09'), priority: 1, reason: 'revoked' })
          })
        })

        describe("and they are 'expired' and 'revoked'", () => {
          it("returns 'revoked' as the end date", () => {
            const result = LicenceModel.fromJson({ expiredDate, revokedDate }).$ends()

            expect(result).to.equal({ date: new Date('2023-03-09'), priority: 1, reason: 'revoked' })
          })
        })
      })
    })

    describe('when all dates are set', () => {
      describe('and all have different dates', () => {
        beforeEach(() => {
          expiredDate = new Date('2023-03-09')
          lapsedDate = new Date('2023-03-08')
          revokedDate = new Date('2023-03-07')
        })

        it('returns the one with the earliest date', () => {
          const result = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate }).$ends()

          expect(result).to.equal({ date: new Date('2023-03-07'), priority: 1, reason: 'revoked' })
        })
      })

      describe('and two have the same earliest date', () => {
        describe("and they are 'lapsed' and 'expired'", () => {
          beforeEach(() => {
            expiredDate = new Date('2023-03-09')
            lapsedDate = new Date('2023-03-09')
            revokedDate = new Date('2023-03-10')
          })

          it("returns 'lapsed' as the end date", () => {
            const result = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate }).$ends()

            expect(result).to.equal({ date: new Date('2023-03-09'), priority: 2, reason: 'lapsed' })
          })
        })

        describe("and they are 'lapsed' and 'revoked'", () => {
          beforeEach(() => {
            expiredDate = new Date('2023-03-10')
            lapsedDate = new Date('2023-03-09')
            revokedDate = new Date('2023-03-09')
          })

          it("returns 'revoked' as the end date", () => {
            const result = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate }).$ends()

            expect(result).to.equal({ date: new Date('2023-03-09'), priority: 1, reason: 'revoked' })
          })
        })

        describe("and they are 'expired' and 'revoked'", () => {
          beforeEach(() => {
            expiredDate = new Date('2023-03-09')
            lapsedDate = new Date('2023-03-10')
            revokedDate = new Date('2023-03-09')
          })

          it("returns 'revoked' as the end date", () => {
            const result = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate }).$ends()

            expect(result).to.equal({ date: new Date('2023-03-09'), priority: 1, reason: 'revoked' })
          })
        })
      })

      describe('and all have the same date', () => {
        beforeEach(() => {
          expiredDate = new Date('2023-03-09')
          lapsedDate = new Date('2023-03-09')
          revokedDate = new Date('2023-03-09')
        })

        it("returns 'revoked' as the end date", () => {
          const result = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate }).$ends()

          expect(result).to.equal({ date: new Date('2023-03-09'), priority: 1, reason: 'revoked' })
        })
      })
    })
  })

  describe('$licenceHolder', () => {
    describe('when instance has not been set with the additional properties needed', () => {
      it('returns null', () => {
        const result = testRecord.$licenceHolder()

        expect(result).to.be.null()
      })
    })

    describe('when the instance has been set with the additional properties needed', () => {
      const licenceRoles = {}

      let licence
      let company
      let contact
      let licenceDocument

      beforeEach(async () => {
        licence = await LicenceHelper.add()

        // Create 2 licence roles so we can test the service only gets the licence document role record that is for
        // 'licence holder'
        licenceRoles.billing = await LicenceRoleHelper.add({ name: 'billing', label: 'Billing' })
        licenceRoles.holder = await LicenceRoleHelper.add()

        // Create company and contact records. We create an additional company so we can create 2 licence document role
        // records for our licence to test the one with the latest start date is used.
        company = await CompanyHelper.add({ name: 'Licence Holder Ltd' })
        contact = await ContactHelper.add({ firstName: 'Luce', lastName: 'Holder' })
        const oldCompany = await CompanyHelper.add({ name: 'Old Licence Holder Ltd' })

        // We have to create a licence document to link our licence record to (eventually!) the company or contact
        // record that is the 'licence holder'
        licenceDocument = await LicenceDocumentHelper.add({ licenceRef: licence.licenceRef })

        // Create two licence document role records. This one is linked to the billing role so should be ignored by the
        // service
        await LicenceDocumentRoleHelper.add({
          licenceDocumentId: licenceDocument.id,
          licenceRoleId: licenceRoles.billing.id
        })

        // This one is linked to the old company record so should not be used to provide the licence holder name
        await LicenceDocumentRoleHelper.add({
          licenceDocumentId: licenceDocument.id,
          licenceRoleId: licenceRoles.holder.id,
          company: oldCompany.id,
          startDate: new Date('2022-01-01')
        })
      })

      describe('and the licence holder is a company', () => {
        beforeEach(async () => {
          // Create the licence document role record that _is_ linked to the correct licence holder record
          await LicenceDocumentRoleHelper.add({
            licenceDocumentId: licenceDocument.id,
            licenceRoleId: licenceRoles.holder.id,
            companyId: company.id,
            startDate: new Date('2022-08-01')
          })

          testRecord = await LicenceModel.query().findById(licence.id).modify('licenceHolder')
        })

        it('returns the company name as the licence holder', async () => {
          const result = testRecord.$licenceHolder()

          expect(result).to.equal('Licence Holder Ltd')
        })
      })

      describe('and the licence holder is a contact', () => {
        beforeEach(async () => {
          // Create the licence document role record that _is_ linked to the correct licence holder record.
          // NOTE: We create this against both the company and contact to also confirm that the contact name has
          // precedence over the company name
          await LicenceDocumentRoleHelper.add({
            licenceDocumentId: licenceDocument.id,
            licenceRoleId: licenceRoles.holder.id,
            companyId: company.id,
            contactId: contact.id,
            startDate: new Date('2022-08-01')
          })

          testRecord = await LicenceModel.query().findById(licence.id).modify('licenceHolder')
        })

        it('returns the contact name as the licence holder', async () => {
          const result = testRecord.$licenceHolder()

          expect(result).to.equal('Luce Holder')
        })
      })
    })
  })

  describe('$licenceName', () => {
    describe('when instance has not been set with the additional properties needed', () => {
      it('returns null', () => {
        const result = testRecord.$licenceName()

        expect(result).to.be.null()
      })
    })

    describe('when the instance has been set with the additional properties needed', () => {
      beforeEach(async () => {
        const licence = await LicenceHelper.add()

        await RegisteredToAndLicenceNameSeeder.seed(licence)

        testRecord = await LicenceModel.query().findById(licence.id).modify('registeredToAndLicenceName')
      })

      it('returns the licence name', async () => {
        const result = testRecord.$licenceName()

        expect(result).to.equal('My custom licence name')
      })
    })
  })

  describe('$registeredTo', () => {
    describe('when instance has not been set with the additional properties needed', () => {
      it('returns null', () => {
        const result = testRecord.$registeredTo()

        expect(result).to.be.null()
      })
    })

    describe('when the instance has been set with the additional properties needed', () => {
      beforeEach(async () => {
        const licence = await LicenceHelper.add()

        await RegisteredToAndLicenceNameSeeder.seed(licence)

        testRecord = await LicenceModel.query().findById(licence.id).modify('registeredToAndLicenceName')
      })

      it('returns who the licence is registered to', async () => {
        const result = testRecord.$registeredTo()

        expect(result).to.equal('grace.hopper@example.com')
      })
    })
  })
})
