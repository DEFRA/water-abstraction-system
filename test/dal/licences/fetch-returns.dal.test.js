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
  let returnRequirementPurposes
  let returnRequirements
  let secondAddedPurpose

  beforeAll(async () => {
    returnLogs = []
    returnRequirementPurposes = []
    returnRequirements = []

    licence = await LicenceHelper.add()

    // NOTE: We deliberately add 'Conveying Materials' before 'Boiler Feed' so the results demonstrate the purposes are
    // returned in alphabetical order rather than the order they were added
    firstAddedPurpose = PurposeHelper.select(2)
    secondAddedPurpose = PurposeHelper.select(1)

    // NOTE: '10334004' sorts before '9999990' as text but after it as a number, so these references demonstrate the
    // results are ordered numerically
    for (const reference of [9999990, 10334004, 123]) {
      const returnRequirement = await ReturnRequirementHelper.add({ reference, siteDescription: 'BOREHOLE AT AVALON' })

      returnRequirements.push(returnRequirement)

      for (const purpose of [firstAddedPurpose, secondAddedPurpose]) {
        const returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
          purposeId: purpose.id,
          returnRequirementId: returnRequirement.id
        })

        returnRequirementPurposes.push(returnRequirementPurpose)
      }
    }

    let returnLog = await ReturnLogHelper.add({
      dueDate: new Date('2020-06-28'),
      endDate: new Date('2020-07-01'),
      licenceRef: licence.licenceRef,
      returnRequirementId: returnRequirements[0].id,
      startDate: new Date('2020-02-01'),
      status: 'due'
    })
    returnLogs.push(returnLog)

    returnLog = await ReturnLogHelper.add({
      dueDate: new Date('2020-06-28'),
      endDate: new Date('2020-06-01'),
      licenceRef: licence.licenceRef,
      returnRequirementId: returnRequirements[0].id,
      startDate: new Date('2020-02-01'),
      status: 'due'
    })
    returnLogs.push(returnLog)

    returnLog = await ReturnLogHelper.add({
      dueDate: new Date('2020-06-28'),
      endDate: new Date('2020-06-01'),
      licenceRef: licence.licenceRef,
      returnRequirementId: returnRequirements[1].id,
      startDate: new Date('2020-02-01'),
      status: 'due'
    })
    returnLogs.push(returnLog)

    returnLog = await ReturnLogHelper.add({
      dueDate: null,
      endDate: new Date('2020-06-01'),
      licenceRef: licence.licenceRef,
      returnRequirementId: returnRequirements[2].id,
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

    for (const returnRequirement of returnRequirements) {
      await returnRequirement.$query().delete()
    }
  })

  describe('when the licence has return logs', () => {
    it('returns results', async () => {
      const result = await FetchReturnsDal(licence.id)

      const expectedPurposes = [secondAddedPurpose.description, firstAddedPurpose.description]

      expect(result).toEqual({
        //  This should be ordered by start date descending, then return reference descending, then end date descending
        //
        // - 2020-05-01 - 123      - 2020-06-01
        // - 2020-02-01 - 10334004 - 2020-06-01
        // - 2020-02-01 - 9999990  - 2020-07-01
        // - 2020-02-01 - 9999990  - 2020-06-01
        //
        returns: [
          {
            dueDate: null,
            endDate: new Date('2020-06-01'),
            id: returnLogs[3].id,
            purposes: expectedPurposes,
            returnId: returnLogs[3].returnId,
            returnReference: 123,
            siteDescription: 'BOREHOLE AT AVALON',
            startDate: new Date('2020-05-01'),
            status: 'due'
          },
          {
            dueDate: new Date('2020-06-28'),
            endDate: new Date('2020-06-01'),
            id: returnLogs[2].id,
            purposes: expectedPurposes,
            returnId: returnLogs[2].returnId,
            returnReference: 10334004,
            siteDescription: 'BOREHOLE AT AVALON',
            startDate: new Date('2020-02-01'),
            status: 'due'
          },
          {
            dueDate: new Date('2020-06-28'),
            endDate: new Date('2020-07-01'),
            id: returnLogs[0].id,
            purposes: expectedPurposes,
            returnId: returnLogs[0].returnId,
            returnReference: 9999990,
            siteDescription: 'BOREHOLE AT AVALON',
            startDate: new Date('2020-02-01'),
            status: 'due'
          },
          {
            dueDate: new Date('2020-06-28'),
            endDate: new Date('2020-06-01'),
            id: returnLogs[1].id,
            purposes: expectedPurposes,
            returnId: returnLogs[1].returnId,
            returnReference: 9999990,
            siteDescription: 'BOREHOLE AT AVALON',
            startDate: new Date('2020-02-01'),
            status: 'due'
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

      purposelessReturnRequirement = await ReturnRequirementHelper.add({
        reference: 9999991,
        siteDescription: 'WELL AT LYONESSE'
      })

      purposelessReturnLog = await ReturnLogHelper.add({
        dueDate: new Date('2023-04-28'),
        endDate: new Date('2023-03-31'),
        licenceRef: purposelessLicence.licenceRef,
        returnRequirementId: purposelessReturnRequirement.id,
        startDate: new Date('2022-04-01'),
        status: 'due'
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
            dueDate: new Date('2023-04-28'),
            endDate: new Date('2023-03-31'),
            id: purposelessReturnLog.id,
            purposes: [],
            returnId: purposelessReturnLog.returnId,
            returnReference: 9999991,
            siteDescription: 'WELL AT LYONESSE',
            startDate: new Date('2022-04-01'),
            status: 'due'
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
        dueDate: new Date('2023-04-28'),
        endDate: new Date('2023-03-31'),
        licenceRef: voidLicence.licenceRef,
        returnReference: '65109211',
        returnRequirementId: null,
        startDate: new Date('2022-04-01'),
        status: 'void'
      })
    })

    afterAll(async () => {
      await voidLicence.$query().delete()
      await voidReturnLog.$query().delete()
    })

    it('returns the return log with no site description, an empty array of purposes and the return logs returnReference', async () => {
      const result = await FetchReturnsDal(voidLicence.id)

      expect(result).toEqual({
        returns: [
          {
            dueDate: new Date('2023-04-28'),
            endDate: new Date('2023-03-31'),
            id: voidReturnLog.id,
            purposes: [],
            returnId: voidReturnLog.returnId,
            returnReference: 65109211,
            siteDescription: null,
            startDate: new Date('2022-04-01'),
            status: 'void'
          }
        ],
        totalNumber: 1
      })
    })
  })
})
