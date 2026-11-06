// Test framework
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import PurposeHelper from 'water-abstraction-engine/test/helpers/purpose.helper.js'
import ReturnLogHelper from 'water-abstraction-engine/test/helpers/return-log.helper.js'
import ReturnRequirementHelper from 'water-abstraction-engine/test/helpers/return-requirement.helper.js'
import ReturnRequirementPurposeHelper from 'water-abstraction-engine/test/helpers/return-requirement-purpose.helper.js'
import ReturnSubmissionHelper from 'water-abstraction-engine/test/helpers/return-submission.helper.js'
import ReturnSubmissionLineHelper from 'water-abstraction-engine/test/helpers/return-submission-line.helper.js'
import { generateLicenceRef } from 'water-abstraction-engine/test/generators.js'

// Thing under test
import FetchReturnLogsForLicenceDal from '../../../../src/dal/bill-runs/match/fetch-return-logs-for-licence.dal.js'

describe('Bill Runs - Match - Fetch Return Logs For Licence dal', () => {
  const billingPeriod = { endDate: new Date('2023-03-31'), startDate: new Date('2022-04-01') }

  let animalWateringPurpose
  let animalWateringReturnRequirementPurpose
  let boilerFeedPurpose
  let boilerFeedReturnRequirementPurpose
  let returnLog
  let returnRequirement
  let returnSubmission
  let returnSubmissionLine

  beforeEach(async () => {
    animalWateringPurpose = PurposeHelper.select(0)
    boilerFeedPurpose = PurposeHelper.select(1)

    returnRequirement = await ReturnRequirementHelper.add({
      siteDescription: 'WELL AT SOUTHBROOK',
      twoPartTariff: true
    })

    // NOTE: Added in reverse alphabetical order so we can confirm the purposes are sorted by their description
    boilerFeedReturnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
      purposeId: boilerFeedPurpose.id,
      returnRequirementId: returnRequirement.id
    })
    animalWateringReturnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
      purposeId: animalWateringPurpose.id,
      returnRequirementId: returnRequirement.id
    })

    returnLog = await ReturnLogHelper.add({ returnRequirementId: returnRequirement.id })

    returnSubmission = await ReturnSubmissionHelper.add({ returnLogId: returnLog.id })

    returnSubmissionLine = await ReturnSubmissionLineHelper.add({
      endDate: new Date('2022-05-20'),
      quantity: 1234,
      returnSubmissionId: returnSubmission.id,
      startDate: new Date('2022-05-14')
    })
  })

  afterEach(async () => {
    await returnSubmissionLine.$query().delete()
    await returnSubmission.$query().delete()
    await returnLog.$query().delete()
    await animalWateringReturnRequirementPurpose.$query().delete()
    await boilerFeedReturnRequirementPurpose.$query().delete()
    await returnRequirement.$query().delete()
  })

  describe('when there is a matching return log', () => {
    it('returns the return log with its return requirement details, purposes, current submission and lines', async () => {
      const result = await FetchReturnLogsForLicenceDal(returnLog.licenceRef, billingPeriod)

      expect(result).toEqual([
        {
          description: 'WELL AT SOUTHBROOK',
          dueDate: null,
          endDate: new Date('2023-03-31'),
          id: returnLog.id,
          periodEndDay: 31,
          periodEndMonth: 3,
          periodStartDay: 1,
          periodStartMonth: 4,
          purposes: [
            {
              alias: 'Purpose alias',
              code: animalWateringPurpose.legacyId,
              description: animalWateringPurpose.description
            },
            {
              alias: 'Purpose alias',
              code: boilerFeedPurpose.legacyId,
              description: boilerFeedPurpose.description
            }
          ],
          receivedDate: null,
          returnId: returnLog.returnId,
          returnReference: returnRequirement.reference,
          returnSubmissions: [
            {
              id: returnSubmission.id,
              nilReturn: false,
              returnSubmissionLines: [
                {
                  endDate: new Date('2022-05-20'),
                  id: returnSubmissionLine.id,
                  quantity: 1234,
                  startDate: new Date('2022-05-14')
                }
              ]
            }
          ],
          startDate: new Date('2022-04-01'),
          status: 'due',
          underQuery: false
        }
      ])
    })

    describe('and the return log starts before the billing period but ends within it', () => {
      beforeEach(async () => {
        await returnLog.$query().patch({ startDate: new Date('2021-11-14') })
      })

      it('returns the return log', async () => {
        const result = await FetchReturnLogsForLicenceDal(returnLog.licenceRef, billingPeriod)

        expect(result).toHaveLength(1)
        expect(result[0].id).toEqual(returnLog.id)
      })
    })

    describe('and the return submission is a nil return', () => {
      beforeEach(async () => {
        await returnSubmission.$query().patch({ nilReturn: true })
      })

      it('returns the return submission flagged as a nil return', async () => {
        const result = await FetchReturnLogsForLicenceDal(returnLog.licenceRef, billingPeriod)

        expect(result[0].returnSubmissions[0].nilReturn).toBe(true)
      })
    })

    describe('and the return submission line is outside the billing period', () => {
      beforeEach(async () => {
        await returnSubmissionLine.$query().patch({
          endDate: new Date('2023-05-20'),
          startDate: new Date('2023-05-14')
        })
      })

      it('returns the return submission with no lines', async () => {
        const result = await FetchReturnLogsForLicenceDal(returnLog.licenceRef, billingPeriod)

        expect(result[0].returnSubmissions[0].returnSubmissionLines).toEqual([])
      })
    })
  })

  describe('when there are multiple matching return logs', () => {
    describe('with different start dates', () => {
      let earlierReturnLog
      let earlierReturnRequirement

      beforeEach(async () => {
        earlierReturnRequirement = await ReturnRequirementHelper.add({ twoPartTariff: true })

        earlierReturnLog = await ReturnLogHelper.add({
          endDate: new Date('2022-11-13'),
          licenceRef: returnLog.licenceRef,
          returnRequirementId: earlierReturnRequirement.id,
          startDate: new Date('2021-11-14')
        })
      })

      afterEach(async () => {
        await earlierReturnLog.$query().delete()
        await earlierReturnRequirement.$query().delete()
      })

      it('returns them ordered by start date', async () => {
        const result = await FetchReturnLogsForLicenceDal(returnLog.licenceRef, billingPeriod)

        expect(result).toHaveLength(2)
        expect(result[0].id).toEqual(earlierReturnLog.id)
        expect(result[1].id).toEqual(returnLog.id)
      })
    })

    describe('with the same start date', () => {
      let higherReferenceReturnLog
      let higherReferenceReturnRequirement
      let licenceRef
      let lowerReferenceReturnLog
      let lowerReferenceReturnRequirement

      beforeEach(async () => {
        licenceRef = generateLicenceRef()

        // NOTE: The reference is generated by a DB sequence, so the return requirement created first has the lower one
        lowerReferenceReturnRequirement = await ReturnRequirementHelper.add({ twoPartTariff: true })
        higherReferenceReturnRequirement = await ReturnRequirementHelper.add({ twoPartTariff: true })

        // NOTE: Added in reverse order so we can confirm the return logs are sorted by their return reference
        higherReferenceReturnLog = await ReturnLogHelper.add({
          licenceRef,
          returnRequirementId: higherReferenceReturnRequirement.id
        })
        lowerReferenceReturnLog = await ReturnLogHelper.add({
          licenceRef,
          returnRequirementId: lowerReferenceReturnRequirement.id
        })
      })

      afterEach(async () => {
        await higherReferenceReturnLog.$query().delete()
        await higherReferenceReturnRequirement.$query().delete()
        await lowerReferenceReturnLog.$query().delete()
        await lowerReferenceReturnRequirement.$query().delete()
      })

      it('returns them ordered by return reference', async () => {
        const result = await FetchReturnLogsForLicenceDal(licenceRef, billingPeriod)

        expect(result).toHaveLength(2)
        expect(result[0].id).toEqual(lowerReferenceReturnLog.id)
        expect(result[1].id).toEqual(higherReferenceReturnLog.id)
      })
    })
  })

  describe('when there are no matching return logs', () => {
    describe('because the return logs are for a different licence', () => {
      it('returns no records', async () => {
        const result = await FetchReturnLogsForLicenceDal(generateLicenceRef(), billingPeriod)

        expect(result).toEqual([])
      })
    })

    describe('because the return log is void', () => {
      beforeEach(async () => {
        await returnLog.$query().patch({ status: 'void' })
      })

      it('returns no records', async () => {
        const result = await FetchReturnLogsForLicenceDal(returnLog.licenceRef, billingPeriod)

        expect(result).toEqual([])
      })
    })

    describe('because the return log ends before the billing period', () => {
      beforeEach(async () => {
        await returnLog.$query().patch({ endDate: new Date('2022-03-31'), startDate: new Date('2021-04-01') })
      })

      it('returns no records', async () => {
        const result = await FetchReturnLogsForLicenceDal(returnLog.licenceRef, billingPeriod)

        expect(result).toEqual([])
      })
    })

    describe('because the return log ends after the billing period', () => {
      beforeEach(async () => {
        await returnLog.$query().patch({ endDate: new Date('2023-12-31') })
      })

      it('returns no records', async () => {
        const result = await FetchReturnLogsForLicenceDal(returnLog.licenceRef, billingPeriod)

        expect(result).toEqual([])
      })
    })

    describe('because the return requirement is not two-part tariff', () => {
      beforeEach(async () => {
        await returnRequirement.$query().patch({ twoPartTariff: false })
      })

      it('returns no records', async () => {
        const result = await FetchReturnLogsForLicenceDal(returnLog.licenceRef, billingPeriod)

        expect(result).toEqual([])
      })
    })

    describe('because the return log is not linked to a return requirement', () => {
      beforeEach(async () => {
        await returnLog.$query().patch({ returnRequirementId: null })
      })

      it('returns no records', async () => {
        const result = await FetchReturnLogsForLicenceDal(returnLog.licenceRef, billingPeriod)

        expect(result).toEqual([])
      })
    })
  })
})
