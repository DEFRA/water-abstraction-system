'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderHelper = require('../../../support/helpers/licence-document-header.helper.js')
const LicenceEntityHelper = require('../../../support/helpers/licence-entity.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../../support/helpers/licence-version.helper.js')
const LicenceVersionHolderHelper = require('../../../support/helpers/licence-version-holder.helper.js')
const UserHelper = require('../../../support/helpers/user.helper.js')
const UserVerificationHelper = require('../../../support/helpers/user-verification.helper.js')
const UserVerificationDocumentHelper = require('../../../support/helpers/user-verification-document.helper.js')
const { today } = require('../../../../app/lib/general.lib.js')
const { yesterday } = require('../../../support/general.js')

// Thing under test
const FetchOutstandingVerificationsService = require('../../../../app/services/users/external/fetch-outstanding-verifications.service.js')

describe('Users - External - Fetch Outstanding Verifications service', () => {
  let licenceData1
  let licenceData2
  let licenceData3
  let licenceData4
  let user
  let userEntity
  let userVerificationData1
  let userVerificationData2
  let userVerificationData3

  before(async () => {
    userEntity = await LicenceEntityHelper.add()
    user = await UserHelper.add({ licenceEntityId: userEntity.id, username: userEntity.name })

    // Add the licences in non-alphabetical order to ensure the service is correctly ordering them by licenceRef,
    // not just returning them in the order they were added
    licenceData3 = await _licenceData('FE/TC/H/US/ER/03')
    licenceData1 = await _licenceData('FE/TC/H/US/ER/01')
    licenceData4 = await _licenceData('FE/TC/H/US/ER/04')
    licenceData2 = await _licenceData('FE/TC/H/US/ER/02')

    // First user verification, linked to just one licence. Created yesterday to demonstrate the service is correctly
    // ordering by createdAt as well as licenceRef
    userVerificationData1 = await _userVerificationData(yesterday(), userEntity.id, [
      licenceData4.licenceDocumentHeader.id
    ])

    // Second user verification, linked to two licences to demonstrate the same code can be used to verify multiple
    // licences
    userVerificationData2 = await _userVerificationData(today(), userEntity.id, [
      licenceData3.licenceDocumentHeader.id,
      licenceData1.licenceDocumentHeader.id
    ])

    // Third user verification, linked to the last licence but has a verifiedAt value. This should not be returned.
    userVerificationData3 = await _userVerificationData(
      yesterday(),
      userEntity.id,
      [licenceData2.licenceDocumentHeader.id],
      today()
    )
  })

  after(async () => {
    await userVerificationData3.clean()
    await userVerificationData2.clean()
    await userVerificationData1.clean()

    await licenceData4.clean()
    await licenceData3.clean()
    await licenceData2.clean()
    await licenceData1.clean()

    await user.$query().delete()
    await userEntity.$query().delete()
  })

  describe('when called', () => {
    it('returns the requested user', async () => {
      const result = await FetchOutstandingVerificationsService.go(user.licenceEntityId)

      expect(result).to.equal([
        {
          id: userVerificationData2.userVerification.id,
          verificationCode: userVerificationData2.userVerification.verificationCode,
          createdAt: userVerificationData2.userVerification.createdAt,
          licenceId: licenceData1.licence.id,
          licenceRef: 'FE/TC/H/US/ER/01',
          licenceHolder: 'Current Holder'
        },
        {
          id: userVerificationData2.userVerification.id,
          verificationCode: userVerificationData2.userVerification.verificationCode,
          createdAt: userVerificationData2.userVerification.createdAt,
          licenceId: licenceData3.licence.id,
          licenceRef: 'FE/TC/H/US/ER/03',
          licenceHolder: 'Current Holder'
        },
        {
          id: userVerificationData1.userVerification.id,
          verificationCode: userVerificationData1.userVerification.verificationCode,
          createdAt: userVerificationData1.userVerification.createdAt,
          licenceId: licenceData4.licence.id,
          licenceRef: 'FE/TC/H/US/ER/04',
          licenceHolder: 'Current Holder'
        }
      ])
    })
  })
})

async function _licenceData(licenceRef) {
  const licence = await LicenceHelper.add({ licenceRef })
  const licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({ licenceRef: licence.licenceRef })

  const licenceVersionSuperseded = await LicenceVersionHelper.add({ licenceId: licence.id, status: 'superseded' })
  const licenceVersionHolderSuperseded = await LicenceVersionHolderHelper.add({
    derivedName: 'Superseded Holder',
    licenceVersionId: licenceVersionSuperseded.id
  })

  const licenceVersionCurrent = await LicenceVersionHelper.add({
    issue: licenceVersionSuperseded.issue + 1,
    licenceId: licence.id
  })
  const licenceVersionHolderCurrent = await LicenceVersionHolderHelper.add({
    derivedName: 'Current Holder',
    licenceVersionId: licenceVersionCurrent.id
  })

  return {
    licence,
    licenceDocumentHeader,
    clean: async () => {
      await licence.$query().delete()
      await licenceDocumentHeader.$query().delete()
      await licenceVersionSuperseded.$query().delete()
      await licenceVersionHolderSuperseded.$query().delete()
      await licenceVersionCurrent.$query().delete()
      await licenceVersionHolderCurrent.$query().delete()
    }
  }
}

async function _userVerificationData(createdAt, licenceEntityId, licenceDocumentHeaderIds, verifiedAt = null) {
  const userVerification = await UserVerificationHelper.add({ createdAt, licenceEntityId, verifiedAt })

  const userVerificationDocuments = []

  for (const licenceDocumentHeaderId of licenceDocumentHeaderIds) {
    const userVerificationDocument = await UserVerificationDocumentHelper.add({
      licenceDocumentHeaderId,
      userVerificationId: userVerification.id
    })
    userVerificationDocuments.push(userVerificationDocument)
  }

  return {
    userVerification,
    clean: async () => {
      await userVerification.$query().delete()

      for (const userVerificationDocument of userVerificationDocuments) {
        await userVerificationDocument.$query().delete()
      }
    }
  }
}
