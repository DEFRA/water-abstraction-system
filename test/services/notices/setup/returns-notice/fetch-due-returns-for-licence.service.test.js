// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import LicenceHelper from 'water-abstraction-engine/test/helpers/licence.helper.js'
import PurposeHelper from 'water-abstraction-engine/test/helpers/purpose.helper.js'
import RegionHelper from 'water-abstraction-engine/test/helpers/region.helper.js'
import ReturnLogHelper from 'water-abstraction-engine/test/helpers/return-log.helper.js'
import ReturnRequirementHelper from 'water-abstraction-engine/test/helpers/return-requirement.helper.js'
import ReturnRequirementPurposeHelper from 'water-abstraction-engine/test/helpers/return-requirement-purpose.helper.js'

// Thing under test
import FetchDueReturnsForLicence from '../../../../../src/services/notices/setup/returns-notice/fetch-due-returns-for-licence.service.js'

describe('Notices - Setup - Returns Notice - Fetch Due Returns For Licence service', () => {
  let licence
  let purpose
  let region
  let returnLogs
  let returnRequirement
  let returnRequirementPurpose

  beforeAll(async () => {
    region = RegionHelper.select()

    licence = await LicenceHelper.add({ regionId: region.id })

    returnRequirement = await ReturnRequirementHelper.add()

    purpose = PurposeHelper.select()

    returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
      purposeId: purpose.id,
      returnRequirementId: returnRequirement.id
    })

    returnLogs = []

    const returnLogData = {
      endDate: new Date('2024-03-31'),
      licenceRef: licence.licenceRef,
      metadata: {
        isCurrent: true
      },
      returnRequirementId: returnRequirement.id,
      startDate: new Date('2023-04-01'),
      status: 'due'
    }

    // Add first return log which is flagged as transferred (isCurrent=false).
    let returnLog = await ReturnLogHelper.add({
      ...returnLogData,
      metadata: { ...returnLogData.metadata, isCurrent: false }
    })
    returnLogs.push(returnLog)

    // Add a second return log for the same licence which is not transferred (isCurrent=true).
    returnLog = await ReturnLogHelper.add({
      ...returnLogData,
      endDate: new Date('2025-03-31'),
      startDate: new Date('2024-04-01')
    })
    returnLogs.push(returnLog)

    // Add a return log that is not due
    returnLog = await ReturnLogHelper.add({
      ...returnLogData,
      status: 'void'
    })
    returnLogs.push(returnLog)

    // Add a return log that ends in the future
    returnLog = await ReturnLogHelper.add({
      ...returnLogData,
      endDate: new Date('2125-03-31'),
      startDate: new Date('2124-04-01')
    })
    returnLogs.push(returnLog)
  })

  afterAll(async () => {
    for (const returnLog of returnLogs) {
      await returnLog.$query().delete()
    }

    await returnRequirementPurpose.$query().delete()
    await returnRequirement.$query().delete()
    await licence.$query().delete()
  })

  describe('when called', () => {
    it('returns the "due" returns for the licence', async () => {
      const result = await FetchDueReturnsForLicence(licence.licenceRef)

      expect(result).toEqual([
        {
          dueDate: null,
          endDate: returnLogs[1].endDate,
          naldAreaCode: licence.regions.historicalAreaCode,
          purpose: purpose.description,
          regionCode: region.naldRegionId,
          regionName: region.displayName,
          returnLogId: returnLogs[1].id,
          returnReference: returnRequirement.reference,
          returnsFrequency: 'month',
          siteDescription: returnRequirement.siteDescription,
          startDate: returnLogs[1].startDate,
          twoPartTariff: returnRequirement.twoPartTariff
        },
        {
          dueDate: null,
          endDate: returnLogs[0].endDate,
          naldAreaCode: licence.regions.historicalAreaCode,
          purpose: purpose.description,
          regionCode: region.naldRegionId,
          regionName: region.displayName,
          returnLogId: returnLogs[0].id,
          returnReference: returnRequirement.reference,
          returnsFrequency: 'month',
          siteDescription: returnRequirement.siteDescription,
          startDate: returnLogs[0].startDate,
          twoPartTariff: returnRequirement.twoPartTariff
        }
      ])
    })
  })
})
