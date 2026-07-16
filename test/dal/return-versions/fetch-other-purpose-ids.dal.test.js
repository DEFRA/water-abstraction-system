// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import LicenceVersionHelper from '../../support/helpers/licence-version.helper.js'
import LicenceVersionPurposeHelper from '../../support/helpers/licence-version-purpose.helper.js'
import PrimaryPurposeHelper from '../../support/helpers/primary-purpose.helper.js'
import PurposeHelper from '../../support/helpers/purpose.helper.js'
import SecondaryPurposeHelper from '../../support/helpers/secondary-purpose.helper.js'
import { generateUUID } from '../../support/generators.js'

// Thing under test
import FetchOtherPurposeIdsDal from '../../../app/dal/return-versions/fetch-other-purpose-ids.dal.js'

describe('DAL - Return Versions - Fetch Other Purpose Ids dal', () => {
  let currentPurposeDetails
  let historicPurposeDetails
  let licenceId
  let licenceVersions
  let licenceVersionPurposes
  let otherLicencePurposeDetails
  let otherPurposeDetails
  let supersededPurposeDetails

  beforeAll(async () => {
    licenceId = generateUUID()

    // NOTE: We use the different primary and secondary purpose IDs to confirm we are fetching the correct ones when the
    // service is executed. Having each of them different means we can trace the result back to the licence version
    // purpose we created.
    currentPurposeDetails = {
      purposeId: PurposeHelper.select(0).id,
      primaryPurposeId: PrimaryPurposeHelper.select(0).id,
      secondaryPurposeId: SecondaryPurposeHelper.select(0).id
    }
    supersededPurposeDetails = {
      purposeId: PurposeHelper.select(0).id,
      primaryPurposeId: PrimaryPurposeHelper.select(1).id,
      secondaryPurposeId: SecondaryPurposeHelper.select(1).id
    }
    otherLicencePurposeDetails = {
      purposeId: PurposeHelper.select(0).id,
      primaryPurposeId: PrimaryPurposeHelper.select(2).id,
      secondaryPurposeId: SecondaryPurposeHelper.select(2).id
    }
    historicPurposeDetails = {
      purposeId: PurposeHelper.select(1).id,
      primaryPurposeId: PrimaryPurposeHelper.select(3).id,
      secondaryPurposeId: SecondaryPurposeHelper.select(3).id
    }
    otherPurposeDetails = {
      purposeId: PurposeHelper.select(2).id,
      primaryPurposeId: PrimaryPurposeHelper.select(4).id,
      secondaryPurposeId: SecondaryPurposeHelper.select(4).id
    }

    licenceVersions = [
      // 0 - A current licence version linked to a different licence
      await LicenceVersionHelper.add({
        endDate: null,
        licenceId: generateUUID(),
        startDate: new Date('2024-04-01'),
        status: 'current'
      }),
      // 1 - A superseded licence version linked to the licence
      await LicenceVersionHelper.add({
        endDate: new Date('2024-03-31'),
        licenceId,
        startDate: new Date('2022-04-01'),
        status: 'superseded'
      }),
      // 2 - A current licence version linked to the licence
      await LicenceVersionHelper.add({
        endDate: null,
        licenceId,
        startDate: new Date('2024-04-01'),
        status: 'current'
      })
    ]

    licenceVersionPurposes = [
      // 0 - Matches our purpose but linked to a different licence
      await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersions[0].id,
        primaryPurposeId: otherLicencePurposeDetails.primaryPurposeId,
        purposeId: otherLicencePurposeDetails.purposeId,
        secondaryPurposeId: otherLicencePurposeDetails.secondaryPurposeId
      }),
      // 1 - Matches our purpose and licence, and is linked to the superseded licence version
      await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersions[1].id,
        primaryPurposeId: supersededPurposeDetails.primaryPurposeId,
        purposeId: supersededPurposeDetails.purposeId,
        secondaryPurposeId: supersededPurposeDetails.secondaryPurposeId
      }),
      // 2 - Matches our historic purpose and licence, and is linked to the superseded licence version
      await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersions[1].id,
        primaryPurposeId: historicPurposeDetails.primaryPurposeId,
        purposeId: historicPurposeDetails.purposeId,
        secondaryPurposeId: historicPurposeDetails.secondaryPurposeId
      }),
      // 3 - Matches our licence and is linked to the current licence version, but has a different purpose
      await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersions[2].id,
        primaryPurposeId: otherPurposeDetails.primaryPurposeId,
        purposeId: otherPurposeDetails.purposeId,
        secondaryPurposeId: otherPurposeDetails.secondaryPurposeId
      }),
      // 4 - Matches our purpose and licence, and is linked to the current licence version
      await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersions[2].id,
        primaryPurposeId: currentPurposeDetails.primaryPurposeId,
        purposeId: currentPurposeDetails.purposeId,
        secondaryPurposeId: currentPurposeDetails.secondaryPurposeId
      })
    ]
  })

  afterAll(async () => {
    for (const licenceVersionPurpose of licenceVersionPurposes) {
      await licenceVersionPurpose.$query().delete()
    }

    for (const licenceVersion of licenceVersions) {
      await licenceVersion.$query().delete()
    }
  })

  describe('when called', () => {
    describe("and the purpose matches to one linked to the licences's 'current' licence version", () => {
      it('returns the matching primary and secondary purpose IDs', async () => {
        const result = await FetchOtherPurposeIdsDal(licenceId, currentPurposeDetails.purposeId)

        expect(result).toEqual({
          primaryPurposeId: currentPurposeDetails.primaryPurposeId,
          secondaryPurposeId: currentPurposeDetails.secondaryPurposeId
        })
      })
    })

    describe("and the purpose matches to one linked to a licences's historic licence versions", () => {
      it('still returns the matching primary and secondary purpose IDs', async () => {
        const result = await FetchOtherPurposeIdsDal(licenceId, historicPurposeDetails.purposeId)

        expect(result).toEqual({
          primaryPurposeId: historicPurposeDetails.primaryPurposeId,
          secondaryPurposeId: historicPurposeDetails.secondaryPurposeId
        })
      })
    })
  })
})
