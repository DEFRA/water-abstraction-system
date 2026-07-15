// Test helpers
import * as CompanyContactHelper from '../support/helpers/company-contact.helper.js'
import * as CompanyHelper from '../support/helpers/company.helper.js'
import * as ContactHelper from '../support/helpers/contact.helper.js'
import * as LicenceRoleHelper from '../support/helpers/licence-role.helper.js'
import * as UserHelper from '../support/helpers/user.helper.js'
import CompanyModel from '../../app/models/company.model.js'
import ContactModel from '../../app/models/contact.model.js'
import LicenceRoleModel from '../../app/models/licence-role.model.js'
import UserModel from '../../app/models/user.model.js'
import { generateUUID } from '../../app/lib/general.lib.js'

// Thing under test
import CompanyContactModel from '../../app/models/company-contact.model.js'

describe('Company Contacts model', () => {
  let testCompany
  let testContact
  let testCreatedByUser
  let testLicenceRole
  let testRecord
  let testUpdatedByUser

  beforeAll(async () => {
    // Link licence role
    testLicenceRole = await LicenceRoleHelper.select()

    // Link contact
    testContact = await ContactHelper.add()

    // Link company
    testCompany = await CompanyHelper.add()

    // Link to user for createdBy
    testCreatedByUser = await UserHelper.select(0)

    // Link to user for updatedBy
    testUpdatedByUser = await UserHelper.select(1)

    // Test record
    testRecord = await CompanyContactHelper.add({
      companyId: testCompany.id,
      contactId: testContact.id,
      createdBy: testCreatedByUser.id,
      licenceRoleId: testLicenceRole.id,
      updatedBy: testUpdatedByUser.id
    })
  })

  afterAll(async () => {
    await testCompany.$query().delete()
    await testContact.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await CompanyContactModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(CompanyContactModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to company', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyContactModel.query().innerJoinRelated('company')

        expect(query).toBeDefined()
      })

      it('can eager load the company', async () => {
        const result = await CompanyContactModel.query().findById(testRecord.id).withGraphFetched('company')

        expect(result).toBeInstanceOf(CompanyContactModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.company).toBeInstanceOf(CompanyModel)
        expect(result.company).toEqual(testCompany)
      })
    })

    describe('when linking to contact', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyContactModel.query().innerJoinRelated('contact')

        expect(query).toBeDefined()
      })

      it('can eager load the contact', async () => {
        const result = await CompanyContactModel.query().findById(testRecord.id).withGraphFetched('contact')

        expect(result).toBeInstanceOf(CompanyContactModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.contact).toBeInstanceOf(ContactModel)
        expect(result.contact).toEqual(testContact)
      })
    })

    describe('when linking to created by user', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyContactModel.query().innerJoinRelated('createdByUser')

        expect(query).toBeDefined()
      })

      it('can eager load the created by user', async () => {
        const result = await CompanyContactModel.query().findById(testRecord.id).withGraphFetched('createdByUser')

        expect(result).toBeInstanceOf(CompanyContactModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.createdByUser).toBeInstanceOf(UserModel)
        expect(result.createdByUser).toMatchObject({ ...testCreatedByUser, password: expect.any(String) })
      })
    })

    describe('when linking to licence role', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyContactModel.query().innerJoinRelated('licenceRole')

        expect(query).toBeDefined()
      })

      it('can eager load the licence role', async () => {
        const result = await CompanyContactModel.query().findById(testRecord.id).withGraphFetched('licenceRole')

        expect(result).toBeInstanceOf(CompanyContactModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.licenceRole).toBeInstanceOf(LicenceRoleModel)
        expect(result.licenceRole).toMatchObject(testLicenceRole)
      })
    })

    describe('when linking to updated by user', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyContactModel.query().innerJoinRelated('updatedByUser')

        expect(query).toBeDefined()
      })

      it('can eager load the updated by user', async () => {
        const result = await CompanyContactModel.query().findById(testRecord.id).withGraphFetched('updatedByUser')

        expect(result).toBeInstanceOf(CompanyContactModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.updatedByUser).toBeInstanceOf(UserModel)
        expect(result.updatedByUser).toMatchObject({ ...testUpdatedByUser, password: expect.any(String) })
      })
    })
  })

  describe('$abstractionAlertType', () => {
    let abstractionAlertTypeTestRecord

    afterEach(async () => {
      await abstractionAlertTypeTestRecord.$query().delete()
    })

    describe('when "abstractionAlerts" is disabled', () => {
      beforeEach(async () => {
        abstractionAlertTypeTestRecord = await CompanyContactHelper.add({ abstractionAlerts: false })
      })

      it('returns "no"', () => {
        const result = abstractionAlertTypeTestRecord.$abstractionAlertType()

        expect(result).toEqual('no')
      })
    })

    describe('when "abstractionAlerts" is enabled', () => {
      beforeEach(async () => {
        abstractionAlertTypeTestRecord = await CompanyContactHelper.add({ abstractionAlerts: true })
      })

      describe('and "abstractionAlertLicences" is null', () => {
        it('returns "yes"', () => {
          const result = abstractionAlertTypeTestRecord.$abstractionAlertType()

          expect(result).toEqual('yes')
        })
      })

      describe('and "abstractionAlertLicences" is populated', () => {
        beforeEach(async () => {
          abstractionAlertTypeTestRecord = await CompanyContactHelper.add({
            abstractionAlertLicences: JSON.stringify([generateUUID()]),
            abstractionAlerts: true
          })
        })

        it('returns "some"', () => {
          const result = abstractionAlertTypeTestRecord.$abstractionAlertType()

          expect(result).toEqual('some')
        })
      })
    })
  })
})
