// Test helpers
import BillLicenceHelper from '../support/helpers/bill-licence.helper.js'
import BillLicenceModel from '../../app/models/bill-licence.model.js'
import ChargeVersionHelper from '../support/helpers/charge-version.helper.js'
import ChargeVersionModel from '../../app/models/charge-version.model.js'
import CompanyHelper from '../support/helpers/company.helper.js'
import LicenceAgreementHelper from '../support/helpers/licence-agreement.helper.js'
import LicenceAgreementModel from '../../app/models/licence-agreement.model.js'
import LicenceDocumentHeaderHelper from '../support/helpers/licence-document-header.helper.js'
import LicenceDocumentHeaderModel from '../../app/models/licence-document-header.model.js'
import LicenceDocumentHelper from '../support/helpers/licence-document.helper.js'
import LicenceDocumentModel from '../../app/models/licence-document.model.js'
import LicenceEndDateChangeHelper from '../support/helpers/licence-end-date-change.helper.js'
import LicenceEndDateChangeModel from '../../app/models/licence-end-date-change.model.js'
import LicenceEntityHelper from '../support/helpers/licence-entity.helper.js'
import LicenceEntityRoleHelper from '../support/helpers/licence-entity-role.helper.js'
import LicenceHelper from '../support/helpers/licence.helper.js'
import LicenceMonitoringStationHelper from '../support/helpers/licence-monitoring-station.helper.js'
import LicenceMonitoringStationModel from '../../app/models/licence-monitoring-station.model.js'
import LicenceSupplementaryYearHelper from '../support/helpers/licence-supplementary-year.helper.js'
import LicenceSupplementaryYearModel from '../../app/models/licence-supplementary-year.model.js'
import LicenceUnregistrationHelper from '../support/helpers/licence-unregistration.helper.js'
import LicenceUnregistrationModel from '../../app/models/licence-unregistration.model.js'
import LicenceVersionHelper from '../support/helpers/licence-version.helper.js'
import LicenceVersionModel from '../../app/models/licence-version.model.js'
import ModLogHelper from '../support/helpers/mod-log.helper.js'
import ModLogModel from '../../app/models/mod-log.model.js'
import RegionHelper from '../support/helpers/region.helper.js'
import RegionModel from '../../app/models/region.model.js'
import ReturnLogHelper from '../support/helpers/return-log.helper.js'
import ReturnLogModel from '../../app/models/return-log.model.js'
import ReturnVersionHelper from '../support/helpers/return-version.helper.js'
import ReturnVersionModel from '../../app/models/return-version.model.js'
import ReviewLicenceHelper from '../support/helpers/review-licence.helper.js'
import ReviewLicenceModel from '../../app/models/review-licence.model.js'
import UserHelper from '../support/helpers/user.helper.js'
import UserModel from '../../app/models/user.model.js'
import WorkflowHelper from '../support/helpers/workflow.helper.js'
import WorkflowModel from '../../app/models/workflow.model.js'
import { generateUUID, today } from '../../app/lib/general.lib.js'
import { tomorrow, yesterday } from '../support/general.js'

// Thing under test
import LicenceModel from '../../app/models/licence.model.js'

describe('Licence model', () => {
  let billLicences
  let chargeVersions
  let licenceAgreements
  let licenceDocument
  let licenceDocumentHeader
  let licenceEndDateChanges
  let licenceMonitoringStations
  let licenceSupplementaryYears
  let licenceUnregistrations
  let licenceVersions
  let modLogs
  let region
  let returnLogs
  let returnVersions
  let reviewLicences
  let testRecord
  let workflows

  beforeAll(async () => {
    region = RegionHelper.select()

    testRecord = await LicenceHelper.add({ regionId: region.id })

    billLicences = []
    chargeVersions = []
    licenceAgreements = []
    licenceEndDateChanges = []
    licenceMonitoringStations = []
    licenceSupplementaryYears = []
    licenceUnregistrations = []
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

      // Create test licence unregistrations
      const licenceUnregistration = await LicenceUnregistrationHelper.add({ licenceId: testRecord.id })
      licenceUnregistrations.push(licenceUnregistration)

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

  afterAll(async () => {
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

    for (const licenceUnregistration of licenceUnregistrations) {
      await licenceUnregistration.$query().delete()
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

      expect(result).toBeInstanceOf(LicenceModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill licences', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('billLicences')

        expect(query).toBeDefined()
      })

      it('can eager load the bill licences', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('billLicences')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billLicences).toBeInstanceOf(Array)
        expect(result.billLicences[0]).toBeInstanceOf(BillLicenceModel)
        expect(result.billLicences).toContainEqual(billLicences[0])
        expect(result.billLicences).toContainEqual(billLicences[1])
      })
    })

    describe('when linking to charge versions', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('chargeVersions')

        expect(query).toBeDefined()
      })

      it('can eager load the charge versions', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('chargeVersions')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeVersions).toBeInstanceOf(Array)
        expect(result.chargeVersions[0]).toBeInstanceOf(ChargeVersionModel)
        expect(result.chargeVersions).toContainEqual(chargeVersions[0])
        expect(result.chargeVersions).toContainEqual(chargeVersions[1])
      })
    })

    describe('when linking to licence agreements', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('licenceAgreements')

        expect(query).toBeDefined()
      })

      it('can eager load the licence agreements', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('licenceAgreements')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceAgreements).toBeInstanceOf(Array)
        expect(result.licenceAgreements[0]).toBeInstanceOf(LicenceAgreementModel)
        expect(result.licenceAgreements).toContainEqual(licenceAgreements[0])
        expect(result.licenceAgreements).toContainEqual(licenceAgreements[1])
      })
    })

    describe('when linking to licence document', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('licenceDocument')

        expect(query).toBeDefined()
      })

      it('can eager load the licence document', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('licenceDocument')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceDocument).toBeInstanceOf(LicenceDocumentModel)
        expect(result.licenceDocument).toEqual(licenceDocument)
      })
    })

    describe('when linking to licence document header', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('licenceDocumentHeader')

        expect(query).toBeDefined()
      })

      it('can eager load the licence document header', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('licenceDocumentHeader')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceDocumentHeader).toBeInstanceOf(LicenceDocumentHeaderModel)
        expect(result.licenceDocumentHeader).toEqual(licenceDocumentHeader)
      })
    })

    describe('when linking to licence end date changes', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('licenceEndDateChanges')

        expect(query).toBeDefined()
      })

      it('can eager load the licence end date changes', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('licenceEndDateChanges')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceEndDateChanges).toBeInstanceOf(Array)
        expect(result.licenceEndDateChanges[0]).toBeInstanceOf(LicenceEndDateChangeModel)
        expect(result.licenceEndDateChanges).toContainEqual(licenceEndDateChanges[0])
        expect(result.licenceEndDateChanges).toContainEqual(licenceEndDateChanges[1])
      })
    })

    describe('when linking to licence monitoring stations', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('licenceMonitoringStations')

        expect(query).toBeDefined()
      })

      it('can eager load the licence monitoring stations', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('licenceMonitoringStations')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceMonitoringStations).toBeInstanceOf(Array)
        expect(result.licenceMonitoringStations[0]).toBeInstanceOf(LicenceMonitoringStationModel)
        expect(result.licenceMonitoringStations).toContainEqual(licenceMonitoringStations[0])
        expect(result.licenceMonitoringStations).toContainEqual(licenceMonitoringStations[1])
      })
    })

    describe('when linking to licence supplementary years', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('licenceSupplementaryYears')

        expect(query).toBeDefined()
      })

      it('can eager load the licence supplementary years', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('licenceSupplementaryYears')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceSupplementaryYears).toBeInstanceOf(Array)
        expect(result.licenceSupplementaryYears[0]).toBeInstanceOf(LicenceSupplementaryYearModel)
        expect(result.licenceSupplementaryYears).toContainEqual(licenceSupplementaryYears[0])
        expect(result.licenceSupplementaryYears).toContainEqual(licenceSupplementaryYears[1])
      })
    })

    describe('when linking to licence unregistrations', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('licenceUnregistrations')

        expect(query).toBeDefined()
      })

      it('can eager load the licence unregistrations', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('licenceUnregistrations')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceUnregistrations).toBeInstanceOf(Array)
        expect(result.licenceUnregistrations[0]).toBeInstanceOf(LicenceUnregistrationModel)
        expect(result.licenceUnregistrations).toContainEqual(licenceUnregistrations[0])
        expect(result.licenceUnregistrations).toContainEqual(licenceUnregistrations[1])
      })
    })

    describe('when linking to licence versions', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('licenceVersions')

        expect(query).toBeDefined()
      })

      it('can eager load the licence versions', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('licenceVersions')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceVersions).toBeInstanceOf(Array)
        expect(result.licenceVersions[0]).toBeInstanceOf(LicenceVersionModel)
        expect(result.licenceVersions).toContainEqual(licenceVersions[0])
        expect(result.licenceVersions).toContainEqual(licenceVersions[1])
      })
    })

    describe('when linking to mod logs', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('modLogs')

        expect(query).toBeDefined()
      })

      it('can eager load the mod logs', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('modLogs')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.modLogs).toBeInstanceOf(Array)
        expect(result.modLogs[0]).toBeInstanceOf(ModLogModel)
        expect(result.modLogs).toContainEqual(modLogs[0])
        expect(result.modLogs).toContainEqual(modLogs[1])
      })
    })

    describe('when linking to region', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('region')

        expect(query).toBeDefined()
      })

      it('can eager load the region', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('region')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.region).toBeInstanceOf(RegionModel)
        expect(result.region).toMatchObject(region)
      })
    })

    describe('when linking to return logs', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('returnLogs')

        expect(query).toBeDefined()
      })

      it('can eager load the return logs', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('returnLogs')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.returnLogs).toBeInstanceOf(Array)
        expect(result.returnLogs[0]).toBeInstanceOf(ReturnLogModel)
        expect(result.returnLogs).toContainEqual(returnLogs[0])
        expect(result.returnLogs).toContainEqual(returnLogs[1])
      })
    })

    describe('when linking to return versions', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('returnVersions')

        expect(query).toBeDefined()
      })

      it('can eager load the return versions', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('returnVersions')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.returnVersions).toBeInstanceOf(Array)
        expect(result.returnVersions[0]).toBeInstanceOf(ReturnVersionModel)
        expect(result.returnVersions).toContainEqual(returnVersions[0])
        expect(result.returnVersions).toContainEqual(returnVersions[1])
      })
    })

    describe('when linking to review licences', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('reviewLicences')

        expect(query).toBeDefined()
      })

      it('can eager load the workflows', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('reviewLicences')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewLicences).toBeInstanceOf(Array)
        expect(result.reviewLicences[0]).toBeInstanceOf(ReviewLicenceModel)
        expect(result.reviewLicences).toContainEqual(reviewLicences[0])
        expect(result.reviewLicences).toContainEqual(reviewLicences[1])
      })
    })

    describe('when linking to workflows', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceModel.query().innerJoinRelated('workflows')

        expect(query).toBeDefined()
      })

      it('can eager load the workflows', async () => {
        const result = await LicenceModel.query().findById(testRecord.id).withGraphFetched('workflows')

        expect(result).toBeInstanceOf(LicenceModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.workflows).toBeInstanceOf(Array)
        expect(result.workflows[0]).toBeInstanceOf(WorkflowModel)
        expect(result.workflows).toContainEqual(workflows[0])
        expect(result.workflows).toContainEqual(workflows[1])
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

        expect(result).toBeNull()
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

          expect(result).toEqual({
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

          expect(result).toEqual({
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

          expect(result).toEqual({
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

  describe('$ended', () => {
    let endedRecord
    let expiredDate
    let lapsedDate
    let revokedDate

    beforeEach(() => {
      expiredDate = null
      lapsedDate = null
      revokedDate = null
    })

    describe('when the "ended" modifier has been used', () => {
      it('returns the dates', async () => {
        const result = await LicenceModel.query().select(['id']).findById(testRecord.id).modify('ended')

        expect(result).toEqual({
          id: testRecord.id,
          expiredDate: null,
          lapsedDate: null,
          revokedDate: null
        })
      })
    })

    describe('when a licence has ended', () => {
      describe('because is has expired', () => {
        beforeEach(() => {
          expiredDate = yesterday()

          endedRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
        })

        it('returns true', () => {
          const result = endedRecord.$ended()

          expect(result).toBe(true)
        })
      })

      describe('because is has lapsed', () => {
        beforeEach(() => {
          lapsedDate = yesterday()

          endedRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
        })

        it('returns true', () => {
          const result = endedRecord.$ended()

          expect(result).toBe(true)
        })
      })

      describe('because is has been revoked', () => {
        beforeEach(() => {
          revokedDate = yesterday()

          endedRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
        })

        it('returns true', () => {
          const result = endedRecord.$ended()

          expect(result).toBe(true)
        })
      })

      describe('because an end date is today', () => {
        beforeEach(() => {
          revokedDate = today()

          endedRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
        })

        it('returns true', () => {
          const result = endedRecord.$ended()

          expect(result).toBe(true)
        })
      })
    })

    describe('when a licence has not ended', () => {
      describe('because an end date is in the future', () => {
        beforeEach(() => {
          expiredDate = tomorrow()

          endedRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
        })

        it('returns false', () => {
          const result = endedRecord.$ended()

          expect(result).toBe(false)
        })
      })

      describe('because all end dates are in the future', () => {
        beforeEach(() => {
          expiredDate = tomorrow()
          lapsedDate = tomorrow()
          revokedDate = tomorrow()

          endedRecord = LicenceModel.fromJson({ expiredDate, lapsedDate, revokedDate })
        })

        it('returns false', () => {
          const result = endedRecord.$ended()

          expect(result).toBe(false)
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

        expect(result).toBeNull()
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

        expect(result).toBeNull()
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

        expect(result).toEqual({ date: expiredDate, priority: 3, reason: 'expired' })
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

        expect(result).toEqual({ date: lapsedDate, priority: 2, reason: 'lapsed' })
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

        expect(result).toEqual({ date: revokedDate, priority: 1, reason: 'revoked' })
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

          expect(result).toEqual({ date: lapsedDate, priority: 2, reason: 'lapsed' })
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

            expect(result).toEqual({ date: lapsedDate, priority: 2, reason: 'lapsed' })
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

            expect(result).toEqual({ date: revokedDate, priority: 1, reason: 'revoked' })
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

            expect(result).toEqual({ date: revokedDate, priority: 1, reason: 'revoked' })
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

          expect(result).toEqual({ date: revokedDate, priority: 1, reason: 'revoked' })
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

            expect(result).toEqual({ date: lapsedDate, priority: 2, reason: 'lapsed' })
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

            expect(result).toEqual({ date: revokedDate, priority: 1, reason: 'revoked' })
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

            expect(result).toEqual({ date: revokedDate, priority: 1, reason: 'revoked' })
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

          expect(result).toEqual({ date: revokedDate, priority: 1, reason: 'revoked' })
        })
      })
    })
  })

  describe('$licenceHolder', () => {
    let company
    let futureCompany
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

      if (company) {
        await company.$query().delete()
      }

      if (oldCompany) {
        await oldCompany.$query().delete()
      }

      if (futureCompany) {
        await futureCompany.$query().delete()
      }
    })

    describe('when instance has not been set with the additional properties needed', () => {
      it('returns null', () => {
        const result = otherLicence.$licenceHolder()

        expect(result).toBeNull()
      })
    })

    describe('when the instance has been set with the additional properties needed', () => {
      beforeEach(async () => {
        company = await CompanyHelper.add({ name: 'Current licence holder' })
        futureCompany = await CompanyHelper.add({ name: 'Future licence holder' })
        oldCompany = await CompanyHelper.add({ name: 'Old licence holder' })

        // Create the first, older licence version that has been superseded by a later one. None of the tests should
        // return the company linked to this one.
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
          })
        ]
      })

      describe('and the latest licence version starts in the past', () => {
        beforeEach(async () => {
          // Create the current licence version linked to a different company to confirm we get the 'current' licence
          // holder (essentially company)
          otherLicenceVersions.push(
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
          )

          licenceHolderRecord = await LicenceModel.query().findById(otherLicence.id).modify('licenceHolder')
        })

        it('returns the company name as the licence holder', async () => {
          const result = licenceHolderRecord.$licenceHolder()

          expect(result).toEqual(company.name)
        })
      })

      describe('and the latest licence version starts in the future', () => {
        beforeEach(async () => {
          // Create the latest licence version linked to a different company to confirm we get the 'current' licence
          // holder (essentially company)
          otherLicenceVersions.push(
            await LicenceVersionHelper.add({
              companyId: futureCompany.id,
              endDate: null,
              increment: 0,
              issueDate: today(),
              issue: 2,
              licenceId: otherLicence.id,
              startDate: tomorrow(),
              status: 'current'
            })
          )

          licenceHolderRecord = await LicenceModel.query().findById(otherLicence.id).modify('licenceHolder')
        })

        it('returns the company name as the licence holder', async () => {
          const result = licenceHolderRecord.$licenceHolder()

          expect(result).toEqual(oldCompany.name)
        })
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

        expect(result).toBeNull()
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

        expect(result).toEqual('My custom licence name')
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

        expect(result).toBeNull()
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

        expect(result).toBeInstanceOf(UserModel)
        expect(result).toEqual({ id: user.id, userId: user.userId, username: user.username })
      })
    })
  })
})
