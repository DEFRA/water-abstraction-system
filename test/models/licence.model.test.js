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
const { generateUUID } = require('../../app/lib/general.lib.js')
const LicenceAgreementHelper = require('../support/helpers/licence-agreement.helper.js')
const LicenceAgreementModel = require('../../app/models/licence-agreement.model.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceDocumentHelper = require('../support/helpers/licence-document.helper.js')
const LicenceDocumentModel = require('../../app/models/licence-document.model.js')
const LicenceDocumentHeaderHelper = require('../support/helpers/licence-document-header.helper.js')
const LicenceDocumentHeaderModel = require('../../app/models/licence-document-header.model.js')
const LicenceDocumentRoleHelper = require('../support/helpers/licence-document-role.helper.js')
const LicenceEntityHelper = require('../support/helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../support/helpers/licence-entity-role.helper.js')
const LicenceGaugingStationHelper = require('../support/helpers/licence-gauging-station.helper.js')
const LicenceGaugingStationModel = require('../../app/models/licence-gauging-station.model.js')
const LicenceRoleHelper = require('../support/helpers/licence-role.helper.js')
const LicenceSupplementaryYearHelper = require('../support/helpers/licence-supplementary-year.helper.js')
const LicenceSupplementaryYearModel = require('../../app/models/licence-supplementary-year.model.js')
const LicenceVersionHelper = require('../support/helpers/licence-version.helper.js')
const LicenceVersionModel = require('../../app/models/licence-version.model.js')
const ModLogHelper = require('../support/helpers/mod-log.helper.js')
const ModLogModel = require('../../app/models/mod-log.model.js')
const RegionHelper = require('../support/helpers/region.helper.js')
const RegionModel = require('../../app/models/region.model.js')
const ReturnLogHelper = require('../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../app/models/return-log.model.js')
const ReturnVersionHelper = require('../support/helpers/return-version.helper.js')
const ReturnVersionModel = require('../../app/models/return-version.model.js')
const ReviewLicenceHelper = require('../support/helpers/review-licence.helper.js')
const ReviewLicenceModel = require('../../app/models/review-licence.model.js')
const UserHelper = require('../support/helpers/user.helper.js')
const UserModel = require('../../app/models/user.model.js')
const WorkflowHelper = require('../support/helpers/workflow.helper.js')
const WorkflowModel = require('../../app/models/workflow.model.js')

// Thing under test
const LicenceModel = require('../../app/models/licence.model.js')

describe('Licence model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await LicenceHelper.add()
    })

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
        testRecord = await LicenceHelper.add()

        testBillLicences = []
        for (let i = 0; i < 2; i++) {
          const billLicence = await BillLicenceHelper.add({
            licenceRef: testRecord.licenceRef, licenceId: testRecord.id
          })

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
        testRecord = await LicenceHelper.add()

        testChargeVersions = []
        for (let i = 0; i < 2; i++) {
          const chargeVersion = await ChargeVersionHelper.add({
            licenceRef: testRecord.licenceRef, licenceId: testRecord.id
          })

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

    describe('when linking to licence agreements', () => {
      let testLicenceAgreements

      beforeEach(async () => {
        testRecord = await LicenceHelper.add()

        testLicenceAgreements = []
        for (let i = 0; i < 2; i++) {
          const licenceAgreement = await LicenceAgreementHelper.add({ licenceRef: testRecord.licenceRef })

          testLicenceAgreements.push(licenceAgreement)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('licenceAgreements')

        expect(query).to.exist()
      })

      it('can eager load the licence agreements', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceAgreements')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceAgreements).to.be.an.array()
        expect(result.licenceAgreements[0]).to.be.an.instanceOf(LicenceAgreementModel)
        expect(result.licenceAgreements).to.include(testLicenceAgreements[0])
        expect(result.licenceAgreements).to.include(testLicenceAgreements[1])
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

    describe('when linking to licence gauging stations', () => {
      let testLicenceGaugingStations

      beforeEach(async () => {
        testRecord = await LicenceHelper.add()

        testLicenceGaugingStations = []
        for (let i = 0; i < 2; i++) {
          const licenceGaugingStation = await LicenceGaugingStationHelper.add({ licenceId: testRecord.id })

          testLicenceGaugingStations.push(licenceGaugingStation)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('licenceGaugingStations')

        expect(query).to.exist()
      })

      it('can eager load the licence gauging stations', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceGaugingStations')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceGaugingStations).to.be.an.array()
        expect(result.licenceGaugingStations[0]).to.be.an.instanceOf(LicenceGaugingStationModel)
        expect(result.licenceGaugingStations).to.include(testLicenceGaugingStations[0])
        expect(result.licenceGaugingStations).to.include(testLicenceGaugingStations[1])
      })
    })

    describe('when linking to licence supplementary years', () => {
      let testLicenceSupplementaryYears

      beforeEach(async () => {
        testRecord = await LicenceHelper.add()

        testLicenceSupplementaryYears = []
        for (let i = 0; i < 2; i++) {
          const licenceSupplementaryYear = await LicenceSupplementaryYearHelper.add({ licenceId: testRecord.id })

          testLicenceSupplementaryYears.push(licenceSupplementaryYear)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('licenceSupplementaryYears')

        expect(query).to.exist()
      })

      it('can eager load the licence supplementary years', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceSupplementaryYears')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceSupplementaryYears).to.be.an.array()
        expect(result.licenceSupplementaryYears[0]).to.be.an.instanceOf(LicenceSupplementaryYearModel)
        expect(result.licenceSupplementaryYears).to.include(testLicenceSupplementaryYears[0])
        expect(result.licenceSupplementaryYears).to.include(testLicenceSupplementaryYears[1])
      })
    })

    describe('when linking to licence versions', () => {
      let testLicenceVersions

      beforeEach(async () => {
        testRecord = await LicenceHelper.add()

        testLicenceVersions = []
        for (let i = 0; i < 2; i++) {
          const licenceVersion = await LicenceVersionHelper.add({ licenceId: testRecord.id })

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

    describe('when linking to mod logs', () => {
      let testModLogs

      beforeEach(async () => {
        testRecord = await LicenceHelper.add()

        testModLogs = []
        for (let i = 0; i < 2; i++) {
          const modLog = await ModLogHelper.add({
            licenceRef: testRecord.licenceRef, licenceId: testRecord.id
          })

          testModLogs.push(modLog)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('modLogs')

        expect(query).to.exist()
      })

      it('can eager load the mod logs', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('modLogs')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.modLogs).to.be.an.array()
        expect(result.modLogs[0]).to.be.an.instanceOf(ModLogModel)
        expect(result.modLogs).to.include(testModLogs[0])
        expect(result.modLogs).to.include(testModLogs[1])
      })
    })

    describe('when linking to region', () => {
      let testRegion

      beforeEach(async () => {
        testRegion = RegionHelper.select()

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
        expect(result.region).to.equal(testRegion, { skip: ['createdAt', 'updatedAt'] })
      })
    })

    describe('when linking to return logs', () => {
      let testReturnLogs

      beforeEach(async () => {
        testRecord = await LicenceHelper.add()

        testReturnLogs = []
        for (let i = 0; i < 2; i++) {
          const returnLog = await ReturnLogHelper.add({ licenceRef: testRecord.licenceRef })

          testReturnLogs.push(returnLog)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('returnLogs')

        expect(query).to.exist()
      })

      it('can eager load the return logs', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnLogs')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnLogs).to.be.an.array()
        expect(result.returnLogs[0]).to.be.an.instanceOf(ReturnLogModel)
        expect(result.returnLogs).to.include(testReturnLogs[0])
        expect(result.returnLogs).to.include(testReturnLogs[1])
      })
    })

    describe('when linking to return versions', () => {
      let testReturnVersions

      beforeEach(async () => {
        testRecord = await LicenceHelper.add()

        testReturnVersions = []
        for (let i = 0; i < 2; i++) {
          const returnVersion = await ReturnVersionHelper.add({ licenceId: testRecord.id })

          testReturnVersions.push(returnVersion)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('returnVersions')

        expect(query).to.exist()
      })

      it('can eager load the return versions', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnVersions')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnVersions).to.be.an.array()
        expect(result.returnVersions[0]).to.be.an.instanceOf(ReturnVersionModel)
        expect(result.returnVersions).to.include(testReturnVersions[0])
        expect(result.returnVersions).to.include(testReturnVersions[1])
      })
    })

    describe('when linking to review licences', () => {
      let testReviewLicences

      beforeEach(async () => {
        testRecord = await LicenceHelper.add()

        testReviewLicences = []
        for (let i = 0; i < 2; i++) {
          const reviewLicence = await ReviewLicenceHelper.add({ licenceId: testRecord.id })

          testReviewLicences.push(reviewLicence)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query()
          .innerJoinRelated('reviewLicences')

        expect(query).to.exist()
      })

      it('can eager load the workflows', async () => {
        const result = await LicenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewLicences')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewLicences).to.be.an.array()
        expect(result.reviewLicences[0]).to.be.an.instanceOf(ReviewLicenceModel)
        expect(result.reviewLicences).to.include(testReviewLicences[0])
        expect(result.reviewLicences).to.include(testReviewLicences[1])
      })
    })

    describe('when linking to workflows', () => {
      let testWorkflows

      beforeEach(async () => {
        testRecord = await LicenceHelper.add()

        testWorkflows = []
        for (let i = 0; i < 2; i++) {
          const workflow = await WorkflowHelper.add({ licenceId: testRecord.id })

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

  describe('$currentVersion', () => {
    let currentLicenceVersion

    beforeEach(async () => {
      testRecord = await LicenceHelper.add()

      currentLicenceVersion = await LicenceVersionHelper.add({ licenceId: testRecord.id, status: 'current' })

      // Add a second that isn't current
      await LicenceVersionHelper.add({ licenceId: testRecord.id, status: 'superseded' })
    })

    describe('when instance does not have licence versions', () => {
      it('returns null', () => {
        const result = testRecord.$currentVersion()

        expect(result).to.be.null()
      })
    })

    describe('when instance has licence versions', () => {
      beforeEach(async () => {
        testRecord = await LicenceHelper.add()

        currentLicenceVersion = await LicenceVersionHelper.add({ licenceId: testRecord.id, status: 'current' })

        // Add a second that isn't current
        await LicenceVersionHelper.add({ licenceId: testRecord.id, status: 'superseded' })

        testRecord = await LicenceModel.query().findById(testRecord.id).modify('currentVersion')
      })

      it('returns the "current" licence version', () => {
        const result = testRecord.$currentVersion()

        expect(result).to.equal({
          id: currentLicenceVersion.id,
          startDate: currentLicenceVersion.startDate,
          status: currentLicenceVersion.status
        })
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

      it('returns "revoked" as the reason and "2023-03-07" as the date', () => {
        const result = LicenceModel.fromJson({ revokedDate }).$ends()

        expect(result).to.equal({ date: new Date('2023-03-07'), priority: 1, reason: 'revoked' })
      })
    })

    describe('when only the lapsed date is set', () => {
      beforeEach(() => {
        lapsedDate = new Date('2023-03-08')
      })

      it('returns "lapsed" as the reason and "2023-03-08" as the date', () => {
        const result = LicenceModel.fromJson({ lapsedDate }).$ends()

        expect(result).to.equal({ date: new Date('2023-03-08'), priority: 2, reason: 'lapsed' })
      })
    })

    describe('when only the expired date is set', () => {
      beforeEach(() => {
        expiredDate = new Date('2023-03-09')
      })

      it('returns "lapsed" as the reason and "2023-03-09" as the date', () => {
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

        describe('and they are "lapsed" and "expired"', () => {
          it('returns "lapsed" as the end date', () => {
            const result = LicenceModel.fromJson({ expiredDate, lapsedDate }).$ends()

            expect(result).to.equal({ date: new Date('2023-03-09'), priority: 2, reason: 'lapsed' })
          })
        })

        describe('and they are "lapsed" and "revoked"', () => {
          it('returns "revoked" as the end date', () => {
            const result = LicenceModel.fromJson({ lapsedDate, revokedDate }).$ends()

            expect(result).to.equal({ date: new Date('2023-03-09'), priority: 1, reason: 'revoked' })
          })
        })

        describe('and they are "expired" and "revoked"', () => {
          it('returns "revoked" as the end date', () => {
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
        describe('and they are "lapsed" and "expired"', () => {
          beforeEach(() => {
            expiredDate = new Date('2023-03-09')
            lapsedDate = new Date('2023-03-09')
            revokedDate = new Date('2023-03-10')
          })

          it('returns "lapsed" as the end date', () => {
            const result = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate }).$ends()

            expect(result).to.equal({ date: new Date('2023-03-09'), priority: 2, reason: 'lapsed' })
          })
        })

        describe('and they are "lapsed" and "revoked"', () => {
          beforeEach(() => {
            expiredDate = new Date('2023-03-10')
            lapsedDate = new Date('2023-03-09')
            revokedDate = new Date('2023-03-09')
          })

          it('returns "revoked" as the end date', () => {
            const result = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate }).$ends()

            expect(result).to.equal({ date: new Date('2023-03-09'), priority: 1, reason: 'revoked' })
          })
        })

        describe('and they are "expired" and "revoked"', () => {
          beforeEach(() => {
            expiredDate = new Date('2023-03-09')
            lapsedDate = new Date('2023-03-10')
            revokedDate = new Date('2023-03-09')
          })

          it('returns "revoked" as the end date', () => {
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

        it('returns "revoked" as the end date', () => {
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

        await LicenceDocumentHeaderHelper.add({
          licenceRef: licence.licenceRef, licenceName: 'My custom licence name'
        })

        testRecord = await LicenceModel.query().findById(licence.id).modify('licenceName')
      })

      it('returns the licence name', async () => {
        const result = testRecord.$licenceName()

        expect(result).to.equal('My custom licence name')
      })
    })
  })

  describe('$primaryUser', () => {
    describe('when instance has not been set with the additional properties needed', () => {
      it('returns null', () => {
        const result = testRecord.$primaryUser()

        expect(result).to.be.null()
      })
    })

    describe('when the instance has been set with the additional properties needed', () => {
      let primaryUser

      beforeEach(async () => {
        const licence = await LicenceHelper.add()

        const companyEntityId = generateUUID()
        const username = `${generateUUID()}@wrls.gov.uk`

        const licenceEntity = await LicenceEntityHelper.add({ name: username })

        primaryUser = await UserHelper.add({ application: 'water_vml', licenceEntityId: licenceEntity.id, username })

        await LicenceEntityRoleHelper.add({
          companyEntityId, licenceEntityId: licenceEntity.id, role: 'primary_user'
        })

        await LicenceDocumentHeaderHelper.add({
          companyEntityId, licenceRef: licence.licenceRef, licenceName: 'My custom licence name'
        })

        testRecord = await LicenceModel.query().findById(licence.id).modify('primaryUser')
      })

      it('returns the primary user', async () => {
        const result = testRecord.$primaryUser()

        expect(result).to.be.an.instanceOf(UserModel)
        expect(result).to.equal({ id: primaryUser.id, username: primaryUser.username })
      })
    })
  })
})
