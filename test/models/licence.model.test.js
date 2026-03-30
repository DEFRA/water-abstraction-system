'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach, after, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillLicenceHelper = require('../support/helpers/bill-licence.helper.js')
const BillLicenceModel = require('../../app/models/bill-licence.model.js')
const ChargeVersionHelper = require('../support/helpers/charge-version.helper.js')
const ChargeVersionModel = require('../../app/models/charge-version.model.js')
const CompanyHelper = require('../support/helpers/company.helper.js')
const { generateUUID } = require('../../app/lib/general.lib.js')
const LicenceAgreementHelper = require('../support/helpers/licence-agreement.helper.js')
const LicenceAgreementModel = require('../../app/models/licence-agreement.model.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceDocumentHelper = require('../support/helpers/licence-document.helper.js')
const LicenceDocumentModel = require('../../app/models/licence-document.model.js')
const LicenceDocumentHeaderHelper = require('../support/helpers/licence-document-header.helper.js')
const LicenceDocumentHeaderModel = require('../../app/models/licence-document-header.model.js')
const LicenceEndDateChangeHelper = require('../support/helpers/licence-end-date-change.helper.js')
const LicenceEndDateChangeModel = require('../../app/models/licence-end-date-change.model.js')
const LicenceEntityHelper = require('../support/helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../support/helpers/licence-entity-role.helper.js')
const LicenceMonitoringStationHelper = require('../support/helpers/licence-monitoring-station.helper.js')
const LicenceMonitoringStationModel = require('../../app/models/licence-monitoring-station.model.js')
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
  let billLicences
  let chargeVersions
  let licenceAgreements
  let licenceDocument
  let licenceDocumentHeader
  let licenceEndDateChanges
  let licenceMonitoringStations
  let licenceSupplementaryYears
  let licenceVersions
  let modLogs
  let region
  let returnLogs
  let returnVersions
  let reviewLicences
  let testRecord
  let workflows

  before(async () => {
    region = RegionHelper.select()

    testRecord = await LicenceHelper.add({ regionId: region.id })

    billLicences = []
    chargeVersions = []
    licenceAgreements = []
    licenceEndDateChanges = []
    licenceMonitoringStations = []
    licenceSupplementaryYears = []
    licenceVersions = []
    modLogs = []
    returnLogs = []
    returnVersions = []
    reviewLicences = []
    workflows = []

    for (let i = 0; i < 2; i++) {
      // Create test bill licences
      const billLicence = await BillLicenceHelper.add({ licenceRef: testRecord.licenceRef, licenceId: testRecord.id })
      billLicences.push(billLicence)

      // Create test charge versions
      const chargeVersion = await ChargeVersionHelper.add({
        licenceRef: testRecord.licenceRef,
        licenceId: testRecord.id
      })
      chargeVersions.push(chargeVersion)

      // Create test licence agreements
      const licenceAgreement = await LicenceAgreementHelper.add({ licenceRef: testRecord.licenceRef })
      licenceAgreements.push(licenceAgreement)

      // Create test licence end date changes
      const dateTypes = ['expired', 'revoked']
      const licenceEndDateChange = await LicenceEndDateChangeHelper.add({
        licenceId: testRecord.id,
        dateType: dateTypes[i]
      })
      licenceEndDateChanges.push(licenceEndDateChange)

      // Create test licence monitoring stations
      const licenceMonitoringStation = await LicenceMonitoringStationHelper.add({ licenceId: testRecord.id })
      licenceMonitoringStations.push(licenceMonitoringStation)

      // Create test licence supplementary years
      const licenceSupplementaryYear = await LicenceSupplementaryYearHelper.add({ licenceId: testRecord.id })
      licenceSupplementaryYears.push(licenceSupplementaryYear)

      // Create test licence versions
      const licenceVersion = await LicenceVersionHelper.add({ licenceId: testRecord.id })
      licenceVersions.push(licenceVersion)

      // Create test mod logs
      const modLog = await ModLogHelper.add({ licenceRef: testRecord.licenceRef, licenceId: testRecord.id })
      modLogs.push(modLog)

      // Create test return logs
      const returnLog = await ReturnLogHelper.add({ licenceRef: testRecord.licenceRef })
      returnLogs.push(returnLog)

      // Create test return versions
      const returnVersion = await ReturnVersionHelper.add({ licenceId: testRecord.id })
      returnVersions.push(returnVersion)

      // Create test review licences
      const reviewLicence = await ReviewLicenceHelper.add({ licenceId: testRecord.id })
      reviewLicences.push(reviewLicence)

      const workflow = await WorkflowHelper.add({ licenceId: testRecord.id })
      workflows.push(workflow)
    }

    licenceDocument = await LicenceDocumentHelper.add({ licenceRef: testRecord.licenceRef })

    licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({ licenceRef: testRecord.licenceRef })
  })

  after(async () => {
    await licenceDocumentHeader.$query().delete()
    await licenceDocument.$query().delete()

    for (const workflow of workflows) {
      await workflow.$query().delete()
    }

    for (const reviewLicence of reviewLicences) {
      await reviewLicence.$query().delete()
    }

    for (const returnVersion of returnVersions) {
      await returnVersion.$query().delete()
    }

    for (const returnLog of returnLogs) {
      await returnLog.$query().delete()
    }

    for (const modLog of modLogs) {
      await modLog.$query().delete()
    }

    for (const licenceVersion of licenceVersions) {
      await licenceVersion.$query().delete()
    }

    for (const licenceSupplementaryYear of licenceSupplementaryYears) {
      await licenceSupplementaryYear.$query().delete()
    }

    for (const licenceMonitoringStation of licenceMonitoringStations) {
      await licenceMonitoringStation.$query().delete()
    }

    for (const licenceEndDateChange of licenceEndDateChanges) {
      await licenceEndDateChange.$query().delete()
    }

    for (const licenceAgreement of licenceAgreements) {
      await licenceAgreement.$query().delete()
    }

    for (const chargeVersion of chargeVersions) {
      await chargeVersion.$query().delete()
    }

    for (const billLicence of billLicences) {
      await billLicence.$query().delete()
    }

    await testRecord.$query().delete()
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
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('billLicences')

        expect(query).to.exist()
      })

      it('can eager load the bill licences', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('billLicences')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billLicences).to.be.an.array()
        expect(result.billLicences[0]).to.be.an.instanceOf(BillLicenceModel)
        expect(result.billLicences).to.include(billLicences[0])
        expect(result.billLicences).to.include(billLicences[1])
      })
    })

    describe('when linking to charge versions', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('chargeVersions')

        expect(query).to.exist()
      })

      it('can eager load the charge versions', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('chargeVersions')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeVersions).to.be.an.array()
        expect(result.chargeVersions[0]).to.be.an.instanceOf(ChargeVersionModel)
        expect(result.chargeVersions).to.include(chargeVersions[0])
        expect(result.chargeVersions).to.include(chargeVersions[1])
      })
    })

    describe('when linking to licence agreements', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('licenceAgreements')

        expect(query).to.exist()
      })

      it('can eager load the licence agreements', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('licenceAgreements')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceAgreements).to.be.an.array()
        expect(result.licenceAgreements[0]).to.be.an.instanceOf(LicenceAgreementModel)
        expect(result.licenceAgreements).to.include(licenceAgreements[0])
        expect(result.licenceAgreements).to.include(licenceAgreements[1])
      })
    })

    describe('when linking to licence document', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('licenceDocument')

        expect(query).to.exist()
      })

      it('can eager load the licence document', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('licenceDocument')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceDocument).to.be.an.instanceOf(LicenceDocumentModel)
        expect(result.licenceDocument).to.equal(licenceDocument)
      })
    })

    describe('when linking to licence document header', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('licenceDocumentHeader')

        expect(query).to.exist()
      })

      it('can eager load the licence document header', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('licenceDocumentHeader')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceDocumentHeader).to.be.an.instanceOf(LicenceDocumentHeaderModel)
        expect(result.licenceDocumentHeader).to.equal(licenceDocumentHeader)
      })
    })

    describe('when linking to licence end date changes', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('licenceEndDateChanges')

        expect(query).to.exist()
      })

      it('can eager load the licence end date changes', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('licenceEndDateChanges')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceEndDateChanges).to.be.an.array()
        expect(result.licenceEndDateChanges[0]).to.be.an.instanceOf(LicenceEndDateChangeModel)
        expect(result.licenceEndDateChanges).to.include(licenceEndDateChanges[0])
        expect(result.licenceEndDateChanges).to.include(licenceEndDateChanges[1])
      })
    })

    describe('when linking to licence monitoring stations', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('licenceMonitoringStations')

        expect(query).to.exist()
      })

      it('can eager load the licence monitoring stations', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('licenceMonitoringStations')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceMonitoringStations).to.be.an.array()
        expect(result.licenceMonitoringStations[0]).to.be.an.instanceOf(LicenceMonitoringStationModel)
        expect(result.licenceMonitoringStations).to.include(licenceMonitoringStations[0])
        expect(result.licenceMonitoringStations).to.include(licenceMonitoringStations[1])
      })
    })

    describe('when linking to licence supplementary years', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('licenceSupplementaryYears')

        expect(query).to.exist()
      })

      it('can eager load the licence supplementary years', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('licenceSupplementaryYears')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceSupplementaryYears).to.be.an.array()
        expect(result.licenceSupplementaryYears[0]).to.be.an.instanceOf(LicenceSupplementaryYearModel)
        expect(result.licenceSupplementaryYears).to.include(licenceSupplementaryYears[0])
        expect(result.licenceSupplementaryYears).to.include(licenceSupplementaryYears[1])
      })
    })

    describe('when linking to licence versions', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('licenceVersions')

        expect(query).to.exist()
      })

      it('can eager load the licence versions', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('licenceVersions')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersions).to.be.an.array()
        expect(result.licenceVersions[0]).to.be.an.instanceOf(LicenceVersionModel)
        expect(result.licenceVersions).to.include(licenceVersions[0])
        expect(result.licenceVersions).to.include(licenceVersions[1])
      })
    })

    describe('when linking to mod logs', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('modLogs')

        expect(query).to.exist()
      })

      it('can eager load the mod logs', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('modLogs')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.modLogs).to.be.an.array()
        expect(result.modLogs[0]).to.be.an.instanceOf(ModLogModel)
        expect(result.modLogs).to.include(modLogs[0])
        expect(result.modLogs).to.include(modLogs[1])
      })
    })

    describe('when linking to region', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('region')

        expect(query).to.exist()
      })

      it('can eager load the region', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('region')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.region).to.be.an.instanceOf(RegionModel)
        expect(result.region).to.equal(region, { skip: ['createdAt', 'updatedAt'] })
      })
    })

    describe('when linking to return logs', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('returnLogs')

        expect(query).to.exist()
      })

      it('can eager load the return logs', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('returnLogs')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnLogs).to.be.an.array()
        expect(result.returnLogs[0]).to.be.an.instanceOf(ReturnLogModel)
        expect(result.returnLogs).to.include(returnLogs[0])
        expect(result.returnLogs).to.include(returnLogs[1])
      })
    })

    describe('when linking to return versions', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('returnVersions')

        expect(query).to.exist()
      })

      it('can eager load the return versions', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('returnVersions')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnVersions).to.be.an.array()
        expect(result.returnVersions[0]).to.be.an.instanceOf(ReturnVersionModel)
        expect(result.returnVersions).to.include(returnVersions[0])
        expect(result.returnVersions).to.include(returnVersions[1])
      })
    })

    describe('when linking to review licences', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('reviewLicences')

        expect(query).to.exist()
      })

      it('can eager load the workflows', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('reviewLicences')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewLicences).to.be.an.array()
        expect(result.reviewLicences[0]).to.be.an.instanceOf(ReviewLicenceModel)
        expect(result.reviewLicences).to.include(reviewLicences[0])
        expect(result.reviewLicences).to.include(reviewLicences[1])
      })
    })

    describe('when linking to workflows', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('workflows')

        expect(query).to.exist()
      })

      it('can eager load the workflows', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('workflows')

        expect(result).to.be.instanceOf(LicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.workflows).to.be.an.array()
        expect(result.workflows[0]).to.be.an.instanceOf(WorkflowModel)
        expect(result.workflows).to.include(workflows[0])
        expect(result.workflows).to.include(workflows[1])
      })
    })
  })

  describe('$currentVersion', () => {
    let currentVersionRecord
    let otherLicence
    let otherLicenceVersions

    beforeEach(async () => {
      otherLicence = await LicenceHelper.add()
    })

    afterEach(async () => {
      for (const licenceVersion of otherLicenceVersions) {
        await licenceVersion.$query().delete()
      }

      await otherLicence.$query().delete()
    })

    describe('when instance does not have licence versions', () => {
      beforeEach(async () => {
        otherLicenceVersions = []

        currentVersionRecord = await LicenceModel.query().findById(otherLicence.id).modify('currentVersion')
      })

      it('returns null', () => {
        const result = currentVersionRecord.$currentVersion()

        expect(result).to.be.null()
      })
    })

    describe('when instance has licence versions', () => {
      describe('and the latest licence version start date is >= today', () => {
        beforeEach(async () => {
          otherLicenceVersions = [
            await LicenceVersionHelper.add({
              endDate: new Date('2999-12-31'),
              increment: 0,
              issue: 1,
              licenceId: otherLicence.id,
              startDate: new Date('2000-01-01'),
              status: 'superseded'
            }),
            await LicenceVersionHelper.add({
              endDate: null,
              increment: 0,
              issue: 2,
              licenceId: otherLicence.id,
              startDate: new Date('3000-01-01'),
              status: 'current'
            })
          ]

          currentVersionRecord = await LicenceModel.query().findById(otherLicence.id).modify('currentVersion')
        })

        it('returns the "current" licence version', () => {
          const result = currentVersionRecord.$currentVersion()

          expect(result).to.equal({
            id: otherLicenceVersions[0].id,
            issueDate: otherLicenceVersions[0].issueDate,
            licenceId: otherLicenceVersions[0].licenceId,
            startDate: otherLicenceVersions[0].startDate,
            status: 'superseded'
          })
        })
      })

      describe('and the latest licence version start date is <= today', () => {
        beforeEach(async () => {
          otherLicenceVersions = [
            await LicenceVersionHelper.add({
              endDate: new Date('2021-12-31'),
              increment: 0,
              issue: 1,
              issueDate: new Date('2001-01-01'),
              licenceId: otherLicence.id,
              startDate: new Date('2001-01-01'),
              status: 'superseded'
            }),
            await LicenceVersionHelper.add({
              endDate: null,
              increment: 0,
              issueDate: new Date('2022-01-01'),
              issue: 2,
              licenceId: otherLicence.id,
              startDate: new Date('2022-01-01'),
              status: 'current'
            })
          ]

          currentVersionRecord = await LicenceModel.query().findById(otherLicence.id).modify('currentVersion')
        })

        it('returns the "current" licence version', () => {
          const result = currentVersionRecord.$currentVersion()

          expect(result).to.equal({
            id: otherLicenceVersions[1].id,
            issueDate: otherLicenceVersions[1].issueDate,
            licenceId: otherLicenceVersions[1].licenceId,
            startDate: otherLicenceVersions[1].startDate,
            status: 'current'
          })
        })
      })

      describe('and there are multiple licence versions with the same start date that is <= today', () => {
        beforeEach(async () => {
          otherLicenceVersions = [
            // earlier licence version - added just for completeness
            await LicenceVersionHelper.add({
              endDate: new Date('2022-03-31'),
              increment: 0,
              issue: 1,
              licenceId: otherLicence.id,
              issueDate: new Date('2021-01-01'),
              startDate: new Date('2021-01-01'),
              status: 'superseded'
            }),
            // Licence version that contains a mistake so was replaced but has the same start date as the current version.
            // As it has a lower increment number it should NOT be returned
            await LicenceVersionHelper.add({
              endDate: new Date('2022-04-01'),
              increment: 0,
              issue: 2,
              licenceId: otherLicence.id,
              issueDate: new Date('2022-04-01'),
              startDate: new Date('2022-04-01'),
              status: 'superseded'
            }),
            // The current licence version that replaced the above. Has the same start date but a higher increment number
            // so should be returned.
            await LicenceVersionHelper.add({
              endDate: null,
              increment: 1,
              issue: 2,
              licenceId: otherLicence.id,
              issueDate: new Date('2022-04-01'),
              startDate: new Date('2022-04-01'),
              status: 'current'
            })
          ]

          currentVersionRecord = await LicenceModel.query().findById(otherLicence.id).modify('currentVersion')
        })

        it('returns the "current" licence version', () => {
          const result = currentVersionRecord.$currentVersion()

          expect(result).to.equal({
            id: otherLicenceVersions[2].id,
            issueDate: otherLicenceVersions[2].issueDate,
            licenceId: otherLicenceVersions[2].licenceId,
            startDate: otherLicenceVersions[2].startDate,
            status: 'current'
          })
        })
      })
    })
  })

  describe('$ends', () => {
    let expiredDate
    let endsRecord
    let lapsedDate
    let revokedDate

    describe('when no end dates are set', () => {
      beforeEach(() => {
        endsRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
      })

      it('returns null', () => {
        const result = endsRecord.$ends()

        expect(result).to.be.null()
      })
    })

    describe('when all the end dates are null', () => {
      beforeEach(() => {
        expiredDate = null
        lapsedDate = null
        revokedDate = null

        endsRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
      })

      it('returns null', () => {
        const result = endsRecord.$ends()

        expect(result).to.be.null()
      })
    })

    describe('when only the expired date is set', () => {
      beforeEach(() => {
        expiredDate = new Date('2023-03-09')
        lapsedDate = null
        revokedDate = null

        endsRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
      })

      it('returns "expired" as the reason and "2023-03-09" as the date', () => {
        const result = endsRecord.$ends()

        expect(result).to.equal({ date: expiredDate, priority: 3, reason: 'expired' })
      })
    })

    describe('when only the lapsed date is set', () => {
      beforeEach(() => {
        expiredDate = null
        lapsedDate = new Date('2023-03-08')
        revokedDate = null

        endsRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
      })

      it('returns "lapsed" as the reason and "2023-03-08" as the date', () => {
        const result = endsRecord.$ends()

        expect(result).to.equal({ date: lapsedDate, priority: 2, reason: 'lapsed' })
      })
    })

    describe('when only the revoked date is set', () => {
      beforeEach(() => {
        expiredDate = null
        lapsedDate = null
        revokedDate = new Date('2023-03-07')

        endsRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
      })

      it('returns "revoked" as the reason and "2023-03-07" as the date', () => {
        const result = endsRecord.$ends()

        expect(result).to.equal({ date: revokedDate, priority: 1, reason: 'revoked' })
      })
    })

    describe('when two dates are set', () => {
      describe('that have different dates', () => {
        beforeEach(() => {
          expiredDate = new Date('2023-03-09')
          lapsedDate = new Date('2023-03-08')
          revokedDate = null

          endsRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
        })

        it('returns the one with the earliest date', () => {
          const result = endsRecord.$ends()

          expect(result).to.equal({ date: lapsedDate, priority: 2, reason: 'lapsed' })
        })
      })

      describe('that have the same date', () => {
        describe('and they are "lapsed" and "expired"', () => {
          beforeEach(() => {
            expiredDate = new Date('2023-03-09')
            lapsedDate = new Date('2023-03-09')
            revokedDate = null

            endsRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
          })

          it('returns "lapsed" as the end date', () => {
            const result = endsRecord.$ends()

            expect(result).to.equal({ date: lapsedDate, priority: 2, reason: 'lapsed' })
          })
        })

        describe('and they are "lapsed" and "revoked"', () => {
          beforeEach(() => {
            expiredDate = null
            lapsedDate = new Date('2023-03-09')
            revokedDate = new Date('2023-03-09')

            endsRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
          })

          it('returns "revoked" as the end date', () => {
            const result = endsRecord.$ends()

            expect(result).to.equal({ date: revokedDate, priority: 1, reason: 'revoked' })
          })
        })

        describe('and they are "expired" and "revoked"', () => {
          beforeEach(() => {
            expiredDate = new Date('2023-03-09')
            lapsedDate = null
            revokedDate = new Date('2023-03-09')

            endsRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
          })

          it('returns "revoked" as the end date', () => {
            const result = endsRecord.$ends()

            expect(result).to.equal({ date: revokedDate, priority: 1, reason: 'revoked' })
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

          endsRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
        })

        it('returns the one with the earliest date', () => {
          const result = endsRecord.$ends()

          expect(result).to.equal({ date: revokedDate, priority: 1, reason: 'revoked' })
        })
      })

      describe('and two have the same earliest date', () => {
        describe('and they are "lapsed" and "expired"', () => {
          beforeEach(() => {
            expiredDate = new Date('2023-03-09')
            lapsedDate = new Date('2023-03-09')
            revokedDate = new Date('2023-03-10')

            endsRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
          })

          it('returns "lapsed" as the end date', () => {
            const result = endsRecord.$ends()

            expect(result).to.equal({ date: lapsedDate, priority: 2, reason: 'lapsed' })
          })
        })

        describe('and they are "lapsed" and "revoked"', () => {
          beforeEach(() => {
            expiredDate = new Date('2023-03-10')
            lapsedDate = new Date('2023-03-09')
            revokedDate = new Date('2023-03-09')

            endsRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
          })

          it('returns "revoked" as the end date', () => {
            const result = endsRecord.$ends()

            expect(result).to.equal({ date: revokedDate, priority: 1, reason: 'revoked' })
          })
        })

        describe('and they are "expired" and "revoked"', () => {
          beforeEach(() => {
            expiredDate = new Date('2023-03-09')
            lapsedDate = new Date('2023-03-10')
            revokedDate = new Date('2023-03-09')

            endsRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
          })

          it('returns "revoked" as the end date', () => {
            const result = endsRecord.$ends()

            expect(result).to.equal({ date: revokedDate, priority: 1, reason: 'revoked' })
          })
        })
      })

      describe('and all have the same date', () => {
        beforeEach(() => {
          expiredDate = new Date('2023-03-09')
          lapsedDate = new Date('2023-03-09')
          revokedDate = new Date('2023-03-09')

          endsRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
        })

        it('returns "revoked" as the end date', () => {
          const result = endsRecord.$ends()

          expect(result).to.equal({ date: revokedDate, priority: 1, reason: 'revoked' })
        })
      })
    })
  })

  describe('$licenceHolder', () => {
    let company
    let licenceHolderRecord
    let oldCompany
    let otherLicence
    let otherLicenceVersions

    beforeEach(async () => {
      otherLicenceVersions = []

      otherLicence = await LicenceHelper.add()
    })

    afterEach(async () => {
      for (const licenceVersion of otherLicenceVersions) {
        await licenceVersion.$query().delete()
      }

      await otherLicence.$query().delete()
    })

    describe('when instance has not been set with the additional properties needed', () => {
      it('returns null', () => {
        const result = otherLicence.$licenceHolder()

        expect(result).to.be.null()
      })
    })

    describe('when the instance has been set with the additional properties needed', () => {
      beforeEach(async () => {
        // Create two licence versions linked to different companies to confirm we get the 'licence holder' (essentially
        // company) linked to the current licence version.
        company = await CompanyHelper.add({ name: 'Current licence holder' })
        oldCompany = await CompanyHelper.add({ name: 'Old licence holder' })

        otherLicenceVersions = [
          await LicenceVersionHelper.add({
            companyId: oldCompany.id,
            endDate: new Date('2021-12-31'),
            increment: 0,
            issue: 1,
            issueDate: new Date('2001-01-01'),
            licenceId: otherLicence.id,
            startDate: new Date('2001-01-01'),
            status: 'superseded'
          }),
          await LicenceVersionHelper.add({
            companyId: company.id,
            endDate: null,
            increment: 0,
            issueDate: new Date('2022-01-01'),
            issue: 2,
            licenceId: otherLicence.id,
            startDate: new Date('2022-01-01'),
            status: 'current'
          })
        ]

        licenceHolderRecord = await LicenceModel.query().findById(otherLicence.id).modify('licenceHolder')
      })

      afterEach(async () => {
        await company.$query().delete()
        await oldCompany.$query().delete()
      })

      it('returns the company name as the licence holder', async () => {
        const result = licenceHolderRecord.$licenceHolder()

        expect(result).to.equal('Current licence holder')
      })
    })
  })

  describe('$licenceName', () => {
    let licenceNameRecord
    let otherLicence
    let otherLicenceDocumentHeader

    beforeEach(async () => {
      otherLicence = await LicenceHelper.add()
    })

    afterEach(async () => {
      if (otherLicenceDocumentHeader) {
        await otherLicenceDocumentHeader.$query().delete()
      }

      await otherLicence.$query().delete()
    })

    describe('when instance has not been set with the additional properties needed', () => {
      it('returns null', () => {
        const result = testRecord.$licenceName()

        expect(result).to.be.null()
      })
    })

    describe('when the instance has been set with the additional properties needed', () => {
      beforeEach(async () => {
        otherLicenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
          licenceRef: otherLicence.licenceRef,
          licenceName: 'My custom licence name'
        })

        licenceNameRecord = await LicenceModel.query().findById(otherLicence.id).modify('licenceName')
      })

      it('returns the licence name', async () => {
        const result = licenceNameRecord.$licenceName()

        expect(result).to.equal('My custom licence name')
      })
    })
  })

  describe('$primaryUser', () => {
    let primaryUserRecord
    let otherLicence
    let otherLicenceDocumentHeader
    let otherLicenceEntity
    let otherLicenceEntityRole
    let user

    beforeEach(async () => {
      otherLicence = await LicenceHelper.add()
    })

    afterEach(async () => {
      if (otherLicenceDocumentHeader) {
        await otherLicenceDocumentHeader.$query().delete()
      }

      if (otherLicenceEntityRole) {
        await otherLicenceEntityRole.$query().delete()
      }

      if (otherLicenceEntity) {
        await otherLicenceEntity.$query().delete()
      }

      await otherLicence.$query().delete()
    })

    describe('when instance has not been set with the additional properties needed', () => {
      it('returns null', () => {
        const result = otherLicence.$primaryUser()

        expect(result).to.be.null()
      })
    })

    describe('when the instance has been set with the additional properties needed', () => {
      beforeEach(async () => {
        const companyEntityId = generateUUID()
        const username = `${generateUUID()}@wrls.gov.uk`

        otherLicenceEntity = await LicenceEntityHelper.add({ name: username })

        user = await UserHelper.add({ application: 'water_vml', licenceEntityId: otherLicenceEntity.id, username })

        otherLicenceEntityRole = await LicenceEntityRoleHelper.add({
          companyEntityId,
          licenceEntityId: otherLicenceEntity.id,
          role: 'primary_user'
        })

        otherLicenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
          companyEntityId,
          licenceRef: otherLicence.licenceRef,
          licenceName: 'My custom licence name'
        })

        primaryUserRecord = await LicenceModel.query().findById(otherLicence.id).modify('primaryUser')
      })

      it('returns the primary user', async () => {
        const result = primaryUserRecord.$primaryUser()

        expect(result).to.be.an.instanceOf(UserModel)
        expect(result).to.equal({ id: user.id, userId: user.userId, username: user.username })
      })
    })
  })
})
