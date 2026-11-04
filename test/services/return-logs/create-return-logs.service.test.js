// Test framework
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import ReturnCyclesFixture from 'water-abstraction-engine/test/fixtures/return-cycles.fixture.js'
import ReturnLogHelper from 'water-abstraction-engine/test/helpers/return-log.helper.js'
import ReturnLogModel from 'water-abstraction-engine/models/return-log.model.js'
import ReturnRequirementsFixture from 'water-abstraction-engine/test/fixtures/return-requirements.fixture.js'
import { formatDateObjectToISO } from 'water-abstraction-engine/lib/dates.lib.js'

// Thing under test
import CreateReturnLogsService from '../../../src/services/return-logs/create-return-logs.service.js'

describe('Return Logs - Create Return Logs service', () => {
  let formattedEndDate
  let formattedStartDate
  let results
  let returnCycle
  let returnRequirement

  beforeEach(() => {
    returnCycle = ReturnCyclesFixture.winterCycle()
    returnRequirement = ReturnRequirementsFixture.winterReturnRequirement()

    formattedStartDate = formatDateObjectToISO(returnCycle.startDate)
    formattedEndDate = formatDateObjectToISO(returnCycle.endDate)
  })

  afterEach(async () => {
    await ReturnLogModel.query()
      .delete()
      .whereIn('returnId', results || [])
  })

  describe('when called', () => {
    describe('and the return log to be created does not exist', () => {
      it('creates the return log and returns its returnId', async () => {
        results = await CreateReturnLogsService(returnRequirement, returnCycle)

        const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)
        const returnId = `${returnLogPrefix}:${formattedStartDate}:${formattedEndDate}`

        expect(results).toEqual([returnId])

        const returnLog = await ReturnLogModel.query().findOne({ returnId })

        expect(returnLog.returnRequirementId).toEqual(returnRequirement.id)
      })
    })

    describe('and the return log to be created already exists', () => {
      beforeEach(async () => {
        const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

        await ReturnLogHelper.add({
          returnId: `${returnLogPrefix}:${formattedStartDate}:${formattedEndDate}`,
          licenceRef: returnRequirement.returnVersion.licence.licenceRef,
          endDate: returnCycle.endDate,
          returnReference: returnRequirement.reference,
          startDate: returnCycle.startDate
        })
      })

      it('returns the existing return log returnId instead of creating a new one', async () => {
        results = await CreateReturnLogsService(returnRequirement, returnCycle)

        const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

        expect(results).toEqual([`${returnLogPrefix}:${formattedStartDate}:${formattedEndDate}`])
      })
    })
  })
})
