// Test helpers
import * as CompanyHelper from '../../../../support/helpers/company.helper.js'
import * as LicenceDocumentHeaderHelper from '../../../../support/helpers/licence-document-header.helper.js'
import * as LicenceEntityHelper from '../../../../support/helpers/licence-entity.helper.js'
import * as LicenceEntityRoleHelper from '../../../../support/helpers/licence-entity-role.helper.js'
import * as LicenceHelper from '../../../../support/helpers/licence.helper.js'
import * as LicenceVersionHelper from '../../../../support/helpers/licence-version.helper.js'
import { generateUUID } from '../../../../../app/lib/general.lib.js'

// Thing under test
import FetchLicencesDal from '../../../../../app/dal/users/external/setup/fetch-licences.dal.js'

describe('Users - External - Setup - Fetch Licences DAL', () => {
  let licenceData1
  let licenceData2
  let licenceData3
  let licenceData4
  let userEntity

  beforeAll(async () => {
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

  afterAll(async () => {
    await licenceData4.clean()
    await licenceData3.clean()
    await licenceData2.clean()
    await licenceData1.clean()

    await userEntity.$query().delete()
  })

  describe('when called', () => {
    it('returns the matching licences', async () => {
      const result = await FetchLicencesDal(userEntity.id)

      expect(result).toEqual([
        {
          id: licenceData1.licence.id,
          licenceDocumentHeaderId: licenceData1.licenceDocumentHeader.id,
          licenceRef: licenceData1.licence.licenceRef,
          licenceVersions: [
            {
              id: licenceData1.licenceVersion.id,
              issueDate: null,
              licenceId: licenceData1.licence.id,
              startDate: licenceData1.licenceVersion.startDate,
              status: 'current',
              company: { id: licenceData1.company.id, name: licenceData1.company.name, type: 'organisation' }
            }
          ]
        },
        {
          id: licenceData3.licence.id,
          licenceDocumentHeaderId: licenceData3.licenceDocumentHeader.id,
          licenceRef: licenceData3.licence.licenceRef,
          licenceVersions: [
            {
              id: licenceData3.licenceVersion.id,
              issueDate: null,
              licenceId: licenceData3.licence.id,
              startDate: licenceData3.licenceVersion.startDate,
              status: 'current',
              company: { id: licenceData3.company.id, name: licenceData3.company.name, type: 'organisation' }
            }
          ]
        },
        {
          id: licenceData4.licence.id,
          licenceDocumentHeaderId: licenceData4.licenceDocumentHeader.id,
          licenceRef: licenceData4.licence.licenceRef,
          licenceVersions: [
            {
              id: licenceData4.licenceVersion.id,
              issueDate: null,
              licenceId: licenceData4.licence.id,
              startDate: licenceData4.licenceVersion.startDate,
              status: 'current',
              company: { id: licenceData4.company.id, name: licenceData4.company.name, type: 'organisation' }
            }
          ]
        }
      ])
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

  const supersededCompany = await CompanyHelper.add({ name: 'Superseded Holder' })
  const licenceVersionSuperseded = await LicenceVersionHelper.add({
    companyId: supersededCompany.id,
    licenceId: licence.id,
    status: 'superseded'
  })

  const currentCompany = await CompanyHelper.add({ name: 'Current Holder' })
  const licenceVersionCurrent = await LicenceVersionHelper.add({
    companyId: currentCompany.id,
    issue: licenceVersionSuperseded.issue + 1,
    licenceId: licence.id
  })

  return {
    company: currentCompany,
    licence,
    licenceEntityRoles,
    licenceDocumentHeader,
    licenceVersion: licenceVersionCurrent,
    clean: async () => {
      await supersededCompany.$query().delete()
      await currentCompany.$query().delete()
      await licence.$query().delete()
      await licenceDocumentHeader.$query().delete()
      await licenceVersionSuperseded.$query().delete()
      await licenceVersionSuperseded.$query().delete()
      await licenceVersionCurrent.$query().delete()

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
