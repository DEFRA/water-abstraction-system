'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyHelper = require('../../../support/helpers/company.helper.js')
const LicenceDocumentHeaderHelper = require('../../../support/helpers/licence-document-header.helper.js')
const LicenceEntityHelper = require('../../../support/helpers/licence-entity.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../../support/helpers/licence-version.helper.js')
const UserHelper = require('../../../support/helpers/user.helper.js')
const UserVerificationHelper = require('../../../support/helpers/user-verification.helper.js')
const UserVerificationDocumentHelper = require('../../../support/helpers/user-verification-document.helper.js')
const { today } = require('../../../../app/lib/general.lib.js')
const { yesterday } = require('../../../support/general.js')

// Thing under test
const FetchVerificationsDal = require('../../../../app/dal/users/external/fetch-verifications.dal.js')

describe('Users - External - Fetch Verifications DAL', () => {
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

    // Third user verification, linked to the last licence and has a verifiedAt value.
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

  describe('when the user has verifications', () => {
    it('returns the matching verifications and the total', async () => {
      const result = await FetchVerificationsDal.go(user.licenceEntityId)

      expect(result).to.equal({
        totalNumber: 3,
        verifications: [
          {
            createdAt: userVerificationData2.userVerification.createdAt,
            id: userVerificationData2.userVerification.id,
            verifiedAt: userVerificationData2.userVerification.verifiedAt,
            verificationCode: userVerificationData2.userVerification.verificationCode,
            licenceDocumentHeaders: [
              {
                id: licenceData1.licenceDocumentHeader.id,
                licenceRef: licenceData1.licenceDocumentHeader.licenceRef,
                licence: {
                  id: licenceData1.licence.id,
                  licenceRef: licenceData1.licence.licenceRef,
                  licenceVersions: [
                    {
                      id: licenceData1.licenceVersionCurrent.id,
                      issueDate: licenceData1.licenceVersionCurrent.issueDate,
                      licenceId: licenceData1.licenceVersionCurrent.licenceId,
                      startDate: licenceData1.licenceVersionCurrent.startDate,
                      status: licenceData1.licenceVersionCurrent.status,
                      company: {
                        id: licenceData1.companyCurrent.id,
                        name: licenceData1.companyCurrent.name,
                        type: licenceData1.companyCurrent.type
                      }
                    }
                  ]
                }
              },
              {
                id: licenceData3.licenceDocumentHeader.id,
                licenceRef: licenceData3.licenceDocumentHeader.licenceRef,
                licence: {
                  id: licenceData3.licence.id,
                  licenceRef: licenceData3.licence.licenceRef,
                  licenceVersions: [
                    {
                      id: licenceData3.licenceVersionCurrent.id,
                      issueDate: licenceData3.licenceVersionCurrent.issueDate,
                      licenceId: licenceData3.licenceVersionCurrent.licenceId,
                      startDate: licenceData3.licenceVersionCurrent.startDate,
                      status: licenceData3.licenceVersionCurrent.status,
                      company: {
                        id: licenceData3.companyCurrent.id,
                        name: licenceData3.companyCurrent.name,
                        type: licenceData3.companyCurrent.type
                      }
                    }
                  ]
                }
              }
            ]
          },
          {
            createdAt: userVerificationData1.userVerification.createdAt,
            id: userVerificationData1.userVerification.id,
            verifiedAt: userVerificationData1.userVerification.verifiedAt,
            verificationCode: userVerificationData1.userVerification.verificationCode,
            licenceDocumentHeaders: [
              {
                id: licenceData4.licenceDocumentHeader.id,
                licenceRef: licenceData4.licenceDocumentHeader.licenceRef,
                licence: {
                  id: licenceData4.licence.id,
                  licenceRef: licenceData4.licence.licenceRef,
                  licenceVersions: [
                    {
                      id: licenceData4.licenceVersionCurrent.id,
                      issueDate: licenceData4.licenceVersionCurrent.issueDate,
                      licenceId: licenceData4.licenceVersionCurrent.licenceId,
                      startDate: licenceData4.licenceVersionCurrent.startDate,
                      status: licenceData4.licenceVersionCurrent.status,
                      company: {
                        id: licenceData4.companyCurrent.id,
                        name: licenceData4.companyCurrent.name,
                        type: licenceData4.companyCurrent.type
                      }
                    }
                  ]
                }
              }
            ]
          },
          {
            createdAt: userVerificationData3.userVerification.createdAt,
            id: userVerificationData3.userVerification.id,
            verifiedAt: userVerificationData3.userVerification.verifiedAt,
            verificationCode: userVerificationData3.userVerification.verificationCode,
            licenceDocumentHeaders: [
              {
                id: licenceData2.licenceDocumentHeader.id,
                licenceRef: licenceData2.licenceDocumentHeader.licenceRef,
                licence: {
                  id: licenceData2.licence.id,
                  licenceRef: licenceData2.licence.licenceRef,
                  licenceVersions: [
                    {
                      id: licenceData2.licenceVersionCurrent.id,
                      issueDate: licenceData2.licenceVersionCurrent.issueDate,
                      licenceId: licenceData2.licenceVersionCurrent.licenceId,
                      startDate: licenceData2.licenceVersionCurrent.startDate,
                      status: licenceData2.licenceVersionCurrent.status,
                      company: {
                        id: licenceData2.companyCurrent.id,
                        name: licenceData2.companyCurrent.name,
                        type: licenceData2.companyCurrent.type
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      })
    })
  })

  describe('when the user has no verifications', () => {
    it('returns an empty array and zero', async () => {
      const result = await FetchVerificationsDal.go('c02ac8b8-e5d4-41f3-b3df-3a370c95ff0a')

      expect(result).to.equal({ verifications: [], totalNumber: 0 })
    })
  })
})

async function _licenceData(licenceRef) {
  const licence = await LicenceHelper.add({ licenceRef })
  const licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({ licenceRef: licence.licenceRef })

  const companySuperseded = await CompanyHelper.add({ name: 'Superseded Company' })
  const licenceVersionSuperseded = await LicenceVersionHelper.add({
    companyId: companySuperseded.id,
    licenceId: licence.id,
    status: 'superseded'
  })

  const companyCurrent = await CompanyHelper.add({ name: 'Current Company' })
  const licenceVersionCurrent = await LicenceVersionHelper.add({
    companyId: companyCurrent.id,
    issue: licenceVersionSuperseded.issue + 1,
    licenceId: licence.id
  })

  return {
    companyCurrent,
    licenceVersionCurrent,
    licence,
    licenceDocumentHeader,
    clean: async () => {
      await licence.$query().delete()
      await licenceDocumentHeader.$query().delete()
      await companySuperseded.$query().delete()
      await licenceVersionSuperseded.$query().delete()
      await companyCurrent.$query().delete()
      await licenceVersionCurrent.$query().delete()
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
