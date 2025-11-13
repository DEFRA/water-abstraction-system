'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Thing under test
const FetchReturnsDueByLicenceRefService = require('../../../../app/services/notices/setup/fetch-returns-due-by-licence-ref.service.js')

describe('Notices - Setup - Fetch Returns Due By Licence Ref service', () => {
  let licenceRef
  let returnLogs
  let region

  before(async () => {
    licenceRef = generateLicenceRef()

    region = RegionHelper.select()

    returnLogs = []

    const returnLogData = {
      endDate: new Date('2024-03-31'),
      licenceRef,
      metadata: {
        description: 'Water park',
        isCurrent: true,
        nald: {
          areaCode: 'SE',
          regionCode: `${region.naldRegionId}`
        },
        purposes: [
          {
            tertiary: { description: 'Potable Water Supply - Direct' }
          }
        ]
      },
      startDate: new Date('2023-04-01'),
      status: 'due'
    }

    // Add first return log which is flagged as transferred (isCurrent=false)
    let returnLog = await ReturnLogHelper.add({
      ...returnLogData,
      metadata: { ...returnLogData.metadata, isCurrent: false }
    })
    returnLogs.push(returnLog)

    // Add a second return log for the same licence which is not transferred (isCurrent=true)
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

  after(async () => {
    for (const returnLog of returnLogs) {
      await returnLog.$query().delete()
    }
  })

  describe('when called', () => {
    it('returns the "due" returns for the licence', async () => {
      const result = await FetchReturnsDueByLicenceRefService.go(licenceRef)

      expect(result).to.equal([
        {
          dueDate: null,
          endDate: returnLogs[1].endDate,
          naldAreaCode: 'SE',
          purpose: 'Potable Water Supply - Direct',
          regionCode: region.naldRegionId,
          regionName: region.displayName,
          returnId: returnLogs[1].returnId,
          returnLogId: returnLogs[1].id,
          returnReference: returnLogs[1].returnReference,
          returnsFrequency: 'month',
          siteDescription: 'Water park',
          startDate: returnLogs[1].startDate,
          twoPartTariff: null
        },
        {
          dueDate: null,
          endDate: returnLogs[0].endDate,
          naldAreaCode: 'SE',
          purpose: 'Potable Water Supply - Direct',
          regionCode: region.naldRegionId,
          regionName: region.displayName,
          returnId: returnLogs[0].returnId,
          returnLogId: returnLogs[0].id,
          returnReference: returnLogs[0].returnReference,
          returnsFrequency: 'month',
          siteDescription: 'Water park',
          startDate: returnLogs[0].startDate,
          twoPartTariff: null
        }
      ])
    })
  })
})
