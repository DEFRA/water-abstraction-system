// Test helpers
import * as CompanyAddressHelper from '../support/helpers/company-address.helper.js'
import CompanyAddressModel from '../../app/models/company-address.model.js'
import * as CompanyContactHelper from '../support/helpers/company-contact.helper.js'
import CompanyContactModel from '../../app/models/company-contact.model.js'
import * as LicenceDocumentRoleHelper from '../support/helpers/licence-document-role.helper.js'
import LicenceDocumentRoleModel from '../../app/models/licence-document-role.model.js'
import * as LicenceRoleHelper from '../support/helpers/licence-role.helper.js'

// Thing under test
import LicenceRoleModel from '../../app/models/licence-role.model.js'

describe('Licence Role model', () => {
  let testCompanyAddresses
  let testCompanyContacts
  let testLicenceDocumentRoles
  let testRecord

  beforeAll(async () => {
    // Test record
    testRecord = await LicenceRoleHelper.select()

    // Link company addresses
    testCompanyAddresses = []
    for (let i = 0; i < 2; i++) {
      const companyAddress = await CompanyAddressHelper.add({ licenceRoleId: testRecord.id })

      testCompanyAddresses.push(companyAddress)
    }

    // Link company contacts
    testCompanyContacts = []
    for (let i = 0; i < 2; i++) {
      const companyContact = await CompanyContactHelper.add({ licenceRoleId: testRecord.id })

      testCompanyContacts.push(companyContact)
    }

    // Link licence document roles
    testLicenceDocumentRoles = []
    for (let i = 0; i < 2; i++) {
      const licenceDocumentRole = await LicenceDocumentRoleHelper.add({ licenceRoleId: testRecord.id })

      testLicenceDocumentRoles.push(licenceDocumentRole)
    }
  })

  afterAll(async () => {
    for (const companyAddress of testCompanyAddresses) {
      await companyAddress.$query().delete()
    }

    for (const companyContact of testCompanyContacts) {
      await companyContact.$query().delete()
    }

    for (const licenceDocumentRole of testLicenceDocumentRoles) {
      await licenceDocumentRole.$query().delete()
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceRoleModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(LicenceRoleModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to company addresses', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceRoleModel.query().innerJoinRelated('companyAddresses')

        expect(query).toBeDefined()
      })

      it('can eager load the company addresses', async () => {
        const result = await LicenceRoleModel.query().findById(testRecord.id).withGraphFetched('companyAddresses')

        expect(result).toBeInstanceOf(LicenceRoleModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.companyAddresses).toBeInstanceOf(Array)
        expect(result.companyAddresses[0]).toBeInstanceOf(CompanyAddressModel)
        expect(result.companyAddresses).toContainEqual(testCompanyAddresses[0])
        expect(result.companyAddresses).toContainEqual(testCompanyAddresses[1])
      })
    })

    describe('when linking to company contacts', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceRoleModel.query().innerJoinRelated('companyContacts')

        expect(query).toBeDefined()
      })

      it('can eager load the company contacts', async () => {
        const result = await LicenceRoleModel.query().findById(testRecord.id).withGraphFetched('companyContacts')

        expect(result).toBeInstanceOf(LicenceRoleModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.companyContacts).toBeInstanceOf(Array)
        expect(result.companyContacts[0]).toBeInstanceOf(CompanyContactModel)
        expect(result.companyContacts).toContainEqual(testCompanyContacts[0])
        expect(result.companyContacts).toContainEqual(testCompanyContacts[1])
      })
    })

    describe('when linking to licence document roles', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceRoleModel.query().innerJoinRelated('licenceDocumentRoles')

        expect(query).toBeDefined()
      })

      it('can eager load the licence document roles', async () => {
        const result = await LicenceRoleModel.query().findById(testRecord.id).withGraphFetched('licenceDocumentRoles')

        expect(result).toBeInstanceOf(LicenceRoleModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceDocumentRoles).toBeInstanceOf(Array)
        expect(result.licenceDocumentRoles[0]).toBeInstanceOf(LicenceDocumentRoleModel)
        expect(result.licenceDocumentRoles).toContainEqual(testLicenceDocumentRoles[0])
        expect(result.licenceDocumentRoles).toContainEqual(testLicenceDocumentRoles[1])
      })
    })
  })
})
