'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderHelper = require('../../../support/helpers/licence-document-header.helper.js')
const LicenceEntityHelper = require('../../../support/helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../../../support/helpers/licence-entity-role.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../../support/helpers/licence-version.helper.js')
const LicenceVersionHolderHelper = require('../../../support/helpers/licence-version-holder.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const FetchLicencesDal = require('../../../../app/dal/users/external/fetch-licences.dal.js')

describe('Users - External - Fetch Licences DAL', () => {
  let licenceData1
  let licenceData2
  let licenceData3
  let licenceData4
  let userEntity

  before(async () => {
    userEntity = await LicenceEntityHelper.add()

    // Add the licences in non-alphabetical order to ensure the service is correctly ordering them by licenceRef,
    // not just returning them in the order they were added
    licenceData3 = await _licenceData(userEntity, 'FE/TC/H/US/ER/03', 'primary_user')
    licenceData1 = await _licenceData(userEntity, 'FE/TC/H/US/ER/01', 'user')
    licenceData4 = await _licenceData(userEntity, 'FE/TC/H/US/ER/04', 'user_returns')

    // This will not be returned in the results because no licence entity role will be created, that links the user to
    // the licence
    licenceData2 = await _licenceData(userEntity, 'FE/TC/H/US/ER/02')
  })

  after(async () => {
    await licenceData4.clean()
    await licenceData3.clean()
    await licenceData2.clean()
    await licenceData1.clean()

    await userEntity.$query().delete()
  })

  describe('when called', () => {
    it('returns the matching licences and the total', async () => {
      const result = await FetchLicencesDal.go(userEntity.id)

      expect(result).to.equal({
        licences: [
          {
            expiredDate: licenceData1.licence.expiredDate,
            id: licenceData1.licence.id,
            lapsedDate: licenceData1.licence.lapsedDate,
            licenceRef: licenceData1.licence.licenceRef,
            revokedDate: licenceData1.licence.revokedDate,
            licenceVersions: [
              {
                id: licenceData1.licenceVersion.id,
                licenceId: licenceData1.licence.id,
                licenceVersionHolder: {
                  derivedName: licenceData1.licenceVersionHolder.derivedName,
                  id: licenceData1.licenceVersionHolder.id,
                  licenceVersionId: licenceData1.licenceVersionHolder.licenceVersionId
                }
              }
            ],
            licenceDocumentHeader: {
              id: licenceData1.licenceDocumentHeader.id,
              licenceEntityRoles: [
                {
                  id: licenceData1.licenceEntityRoles[0].id,
                  role: licenceData1.licenceEntityRoles[0].role
                }
              ],
              licenceRef: licenceData1.licenceDocumentHeader.licenceRef
            }
          },
          {
            expiredDate: licenceData3.licence.expiredDate,
            id: licenceData3.licence.id,
            lapsedDate: licenceData3.licence.lapsedDate,
            licenceRef: licenceData3.licence.licenceRef,
            revokedDate: licenceData3.licence.revokedDate,
            licenceVersions: [
              {
                id: licenceData3.licenceVersion.id,
                licenceId: licenceData3.licence.id,
                licenceVersionHolder: {
                  derivedName: licenceData3.licenceVersionHolder.derivedName,
                  id: licenceData3.licenceVersionHolder.id,
                  licenceVersionId: licenceData3.licenceVersionHolder.licenceVersionId
                }
              }
            ],
            licenceDocumentHeader: {
              id: licenceData3.licenceDocumentHeader.id,
              licenceEntityRoles: [
                {
                  id: licenceData3.licenceEntityRoles[0].id,
                  role: licenceData3.licenceEntityRoles[0].role
                }
              ],
              licenceRef: licenceData3.licenceDocumentHeader.licenceRef
            }
          },
          {
            expiredDate: licenceData4.licence.expiredDate,
            id: licenceData4.licence.id,
            lapsedDate: licenceData4.licence.lapsedDate,
            licenceRef: licenceData4.licence.licenceRef,
            revokedDate: licenceData4.licence.revokedDate,
            licenceVersions: [
              {
                id: licenceData4.licenceVersion.id,
                licenceId: licenceData4.licence.id,
                licenceVersionHolder: {
                  derivedName: licenceData4.licenceVersionHolder.derivedName,
                  id: licenceData4.licenceVersionHolder.id,
                  licenceVersionId: licenceData4.licenceVersionHolder.licenceVersionId
                }
              }
            ],
            licenceDocumentHeader: {
              id: licenceData4.licenceDocumentHeader.id,
              licenceEntityRoles: [
                {
                  id: licenceData4.licenceEntityRoles[1].id,
                  role: licenceData4.licenceEntityRoles[1].role
                },
                {
                  id: licenceData4.licenceEntityRoles[0].id,
                  role: licenceData4.licenceEntityRoles[0].role
                }
              ],
              licenceRef: licenceData4.licenceDocumentHeader.licenceRef
            }
          }
        ],
        totalNumber: 3
      })
    })
  })
})

async function _licenceData(userEntity, licenceRef, role) {
  const companyEntityId = generateUUID()
  const licence = await LicenceHelper.add({ licenceRef })
  const licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
    companyEntityId,
    licenceRef: licence.licenceRef
  })

  const licenceEntityRoles = await _licenceEntityRoles(userEntity.id, companyEntityId, role)

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
    licenceEntityRoles,
    licenceDocumentHeader,
    licenceVersion: licenceVersionCurrent,
    licenceVersionHolder: licenceVersionHolderCurrent,
    clean: async () => {
      await licence.$query().delete()
      await licenceDocumentHeader.$query().delete()
      await licenceVersionSuperseded.$query().delete()
      await licenceVersionHolderSuperseded.$query().delete()
      await licenceVersionCurrent.$query().delete()
      await licenceVersionHolderCurrent.$query().delete()

      for (const licenceEntityRole of licenceEntityRoles) {
        await licenceEntityRole.$query().delete()
      }
    }
  }
}

async function _licenceEntityRoles(licenceEntityId, companyEntityId, role) {
  const licenceEntityRoles = []

  // If the role is `primary_user` or `user`, then we can just add that role.
  if (role) {
    const licenceEntityRole = await LicenceEntityRoleHelper.add({ companyEntityId, licenceEntityId, role })

    licenceEntityRoles.push(licenceEntityRole)
  }

  // If the role is `user_returns`, then we need to add both a `user` role and a `user_returns` role. We'll already have
  // added the `user_returns` role above, so we just need to add the `user` role here.
  if (role === 'user_returns') {
    const licenceEntityRole = await LicenceEntityRoleHelper.add({ companyEntityId, licenceEntityId, role: 'user' })

    licenceEntityRoles.push(licenceEntityRole)
  }

  return licenceEntityRoles
}
