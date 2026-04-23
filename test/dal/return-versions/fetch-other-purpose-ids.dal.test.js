'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../support/helpers/licence-version-purpose.helper.js')
const PrimaryPurposeHelper = require('../../support/helpers/primary-purpose.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const SecondaryPurposeHelper = require('../../support/helpers/secondary-purpose.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchOtherPurposeIdsDal = require('../../../app/dal/return-versions/fetch-other-purpose-ids.dal.js')

describe('DAL - Return Versions - Fetch Other Purpose Ids dal', () => {
  let licenceId
  let licenceVersions
  let licenceVersionPurposes
  let primaryPurposeId
  let purposeId
  let secondaryPurposeId

  before(async () => {
    licenceId = generateUUID()

    purposeId = PurposeHelper.select(0).id
    primaryPurposeId = PrimaryPurposeHelper.select(0).id
    secondaryPurposeId = SecondaryPurposeHelper.select(0).id

    // 0 - A current licence version linked to a different licence
    // 1 - A superseded licence version linked to the licence
    // 2 - A current licence version linked to the licence. Only purposes linked to this should be fetched
    licenceVersions = [
      await LicenceVersionHelper.add({
        endDate: null,
        licenceId: generateUUID(),
        startDate: new Date('2024-04-01'),
        status: 'current'
      }),
      await LicenceVersionHelper.add({
        endDate: new Date('2024-03-31'),
        licenceId,
        startDate: new Date('2022-04-01'),
        status: 'superseded'
      }),
      await LicenceVersionHelper.add({
        endDate: null,
        licenceId,
        startDate: new Date('2024-04-01'),
        status: 'current'
      })
    ]

    // 0 - Matches our purpose but linked to a different licence
    // 1 - Matches our purpose and licence, but is linked to the superseded licence version
    // 2 - Matches our licence and is linked to the current licence version, but has a different purpose
    // 3 - Matches our purpose and licence, and is linked to the current licence version
    licenceVersionPurposes = [
      await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersions[0].id,
        primaryPurposeId,
        purposeId,
        secondaryPurposeId
      }),
      await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersions[1].id,
        primaryPurposeId: PrimaryPurposeHelper.select(1).id,
        purposeId,
        secondaryPurposeId: SecondaryPurposeHelper.select(1).id
      }),
      await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersions[2].id,
        primaryPurposeId,
        purposeId: PurposeHelper.select(1).id,
        secondaryPurposeId
      }),
      await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersions[2].id,
        primaryPurposeId,
        purposeId,
        secondaryPurposeId
      })
    ]
  })

  after(async () => {
    for (const licenceVersionPurpose of licenceVersionPurposes) {
      await licenceVersionPurpose.$query().delete()
    }

    for (const licenceVersion of licenceVersions) {
      await licenceVersion.$query().delete()
    }
  })

  describe('when called', () => {
    it('returns the matching primary and secondary purpose IDs for the specified licence and purpose', async () => {
      const result = await FetchOtherPurposeIdsDal.go(licenceId, purposeId)

      expect(result).to.equal({ primaryPurposeId, secondaryPurposeId })
    })
  })
})
