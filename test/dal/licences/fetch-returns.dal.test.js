// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import LicenceHelper from 'water-abstraction-engine/test/helpers/licence.helper.js'
import PurposeHelper from 'water-abstraction-engine/test/helpers/purpose.helper.js'
import ReturnLogHelper from 'water-abstraction-engine/test/helpers/return-log.helper.js'
import ReturnRequirementHelper from 'water-abstraction-engine/test/helpers/return-requirement.helper.js'
import ReturnRequirementPurposeHelper from 'water-abstraction-engine/test/helpers/return-requirement-purpose.helper.js'

// Thing under test
import FetchReturnsDal from '../../../src/dal/licences/fetch-returns.dal.js'

describe('Licences - Fetch Returns dal', () => {
  let firstAddedPurpose
  let licence
  let returnLogs
  let returnRequirement
  let returnRequirementPurposes
  let secondAddedPurpose

  beforeAll(async () => {
    returnLogs = []
    returnRequirementPurposes = []

    licence = await LicenceHelper.add()

    returnRequirement = await ReturnRequirementHelper.add({ siteDescription: 'BOREHOLE AT AVALON' })

    // NOTE: We deliberately add 'Conveying Materials' before 'Boiler Feed' so the results demonstrate the purposes are
    // returned in alphabetical order rather than the order they were added
    firstAddedPurpose = PurposeHelper.select(2)
    secondAddedPurpose = PurposeHelper.select(1)

    for (const purpose of [firstAddedPurpose, secondAddedPurpose]) {
      const returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        purposeId: purpose.id,
        returnRequirementId: returnRequirement.id
      })

      returnRequirementPurposes.push(returnRequirementPurpose)
    }

    let returnLog = await ReturnLogHelper.add({
      dueDate: new Date('2020-06-28'),
      endDate: new Date('2020-07-01'),
      licenceRef: licence.licenceRef,
      returnReference: '9999990',
      returnRequirementId: returnRequirement.id,
      startDate: new Date('2020-02-01'),
      status: 'due'
    })
    returnLogs.push(returnLog)

    returnLog = await ReturnLogHelper.add({
      dueDate: new Date('2020-06-28'),
      endDate: new Date('2020-06-01'),
      licenceRef: licence.licenceRef,
      returnReference: '9999990',
      returnRequirementId: returnRequirement.id,
      startDate: new Date('2020-02-01'),
      status: 'due'
    })
    returnLogs.push(returnLog)

    returnLog = await ReturnLogHelper.add({
      dueDate: new Date('2020-06-28'),
      endDate: new Date('2020-06-01'),
      licenceRef: licence.licenceRef,
      returnReference: '10334004',
      returnRequirementId: returnRequirement.id,
      startDate: new Date('2020-02-01'),
      status: 'due'
    })
    returnLogs.push(returnLog)

    returnLog = await ReturnLogHelper.add({
      dueDate: null,
      endDate: new Date('2020-06-01'),
      licenceRef: licence.licenceRef,
      returnReference: '123',
      returnRequirementId: returnRequirement.id,
      startDate: new Date('2020-05-01'),
      status: 'due'
    })
    returnLogs.push(returnLog)
  })

  afterAll(async () => {
    await licence.$query().delete()

    for (const returnLog of returnLogs) {
      await returnLog.$query().delete()
    }

    for (const returnRequirementPurpose of returnRequirementPurposes) {
      await returnRequirementPurpose.$query().delete()
    }

    await returnRequirement.$query().delete()
  })

  describe('when the licence has return logs', () => {
    it('returns results', async () => {
      const result = await FetchReturnsDal(licence.id)

      const expectedPurposes = [secondAddedPurpose.description, firstAddedPurpose.description]

      expect(result).toEqual({
        //  This should be ordered first by start date, then by return reference, then by end date
        //
        // - 2020-05-01 - 123      - 2020-06-01
        // - 2020-02-01 - 10334004 - 2020-06-01
        // - 2020-02-01 - 9999990  - 2020-06-01
        // - 2020-02-01 - 9999990  - 2020-07-01
        //
        returns: [
          {
            dueDate: returnLogs[3].dueDate,
            endDate: returnLogs[3].endDate,
            id: returnLogs[3].id,
            purposes: expectedPurposes,
            returnId: returnLogs[3].returnId,
            returnReference: returnLogs[3].returnReference,
            siteDescription: returnRequirement.siteDescription,
            startDate: returnLogs[3].startDate,
            status: returnLogs[3].status
          },
          {
            dueDate: returnLogs[2].dueDate,
            endDate: returnLogs[2].endDate,
            id: returnLogs[2].id,
            purposes: expectedPurposes,
            returnId: returnLogs[2].returnId,
            returnReference: returnLogs[2].returnReference,
            siteDescription: returnRequirement.siteDescription,
            startDate: returnLogs[2].startDate,
            status: returnLogs[2].status
          },
          {
            dueDate: returnLogs[0].dueDate,
            endDate: returnLogs[0].endDate,
            id: returnLogs[0].id,
            purposes: expectedPurposes,
            returnId: returnLogs[0].returnId,
            returnReference: returnLogs[0].returnReference,
            siteDescription: returnRequirement.siteDescription,
            startDate: returnLogs[0].startDate,
            status: returnLogs[0].status
          },
          {
            dueDate: returnLogs[1].dueDate,
            endDate: returnLogs[1].endDate,
            id: returnLogs[1].id,
            purposes: expectedPurposes,
            returnId: returnLogs[1].returnId,
            returnReference: returnLogs[1].returnReference,
            siteDescription: returnRequirement.siteDescription,
            startDate: returnLogs[1].startDate,
            status: returnLogs[1].status
          }
        ],
        totalNumber: 4
      })
    })
  })

  describe('when the return requirement has no purposes', () => {
    let purposelessLicence
    let purposelessReturnLog
    let purposelessReturnRequirement

    beforeAll(async () => {
      purposelessLicence = await LicenceHelper.add()

      purposelessReturnRequirement = await ReturnRequirementHelper.add({ siteDescription: 'WELL AT LYONESSE' })

      purposelessReturnLog = await ReturnLogHelper.add({
        licenceRef: purposelessLicence.licenceRef,
        returnRequirementId: purposelessReturnRequirement.id
      })
    })

    afterAll(async () => {
      await purposelessLicence.$query().delete()
      await purposelessReturnLog.$query().delete()
      await purposelessReturnRequirement.$query().delete()
    })

    it('returns the return log with an empty array of purposes', async () => {
      const result = await FetchReturnsDal(purposelessLicence.id)

      expect(result).toEqual({
        returns: [
          {
            dueDate: purposelessReturnLog.dueDate,
            endDate: purposelessReturnLog.endDate,
            id: purposelessReturnLog.id,
            purposes: [],
            returnId: purposelessReturnLog.returnId,
            returnReference: purposelessReturnLog.returnReference,
            siteDescription: purposelessReturnRequirement.siteDescription,
            startDate: purposelessReturnLog.startDate,
            status: purposelessReturnLog.status
          }
        ],
        totalNumber: 1
      })
    })
  })

  describe('when a return log has no return requirement', () => {
    let voidLicence
    let voidReturnLog

    beforeAll(async () => {
      voidLicence = await LicenceHelper.add()

      voidReturnLog = await ReturnLogHelper.add({
        licenceRef: voidLicence.licenceRef,
        returnRequirementId: null,
        status: 'void'
      })
    })

    afterAll(async () => {
      await voidLicence.$query().delete()
      await voidReturnLog.$query().delete()
    })

    it('returns the return log with no site description and an empty array of purposes', async () => {
      const result = await FetchReturnsDal(voidLicence.id)

      expect(result).toEqual({
        returns: [
          {
            dueDate: voidReturnLog.dueDate,
            endDate: voidReturnLog.endDate,
            id: voidReturnLog.id,
            purposes: [],
            returnId: voidReturnLog.returnId,
            returnReference: voidReturnLog.returnReference,
            siteDescription: null,
            startDate: voidReturnLog.startDate,
            status: voidReturnLog.status
          }
        ],
        totalNumber: 1
      })
    })
  })
})
