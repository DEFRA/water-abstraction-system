// Test helpers
import * as AddressHelper from '../support/helpers/address.helper.js'
import * as CompanyAddressHelper from '../support/helpers/company-address.helper.js'
import * as CompanyHelper from '../support/helpers/company.helper.js'
import * as LicenceRoleHelper from '../support/helpers/licence-role.helper.js'
import AddressModel from '../../app/models/address.model.js'
import CompanyModel from '../../app/models/company.model.js'
import LicenceRoleModel from '../../app/models/licence-role.model.js'

// Thing under test
import CompanyAddressModel from '../../app/models/company-address.model.js'

describe('Company Address model', () => {
  let testAddress
  let testCompany
  let testLicenceRole
  let testRecord

  beforeAll(async () => {
    // Link licence role
    testLicenceRole = await LicenceRoleHelper.select()

    // Link company
    testCompany = await CompanyHelper.add()

    // Link address
    testAddress = await AddressHelper.add()

    // Test record
    testRecord = await CompanyAddressHelper.add({
      addressId: testAddress.id,
      companyId: testCompany.id,
      licenceRoleId: testLicenceRole.id
    })
  })

  afterAll(async () => {
    await testCompany.$query().delete()
    await testAddress.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await CompanyAddressModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(CompanyAddressModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to address', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyAddressModel.query().innerJoinRelated('address')

        expect(query).toBeDefined()
      })

      it('can eager load the address', async () => {
        const result = await CompanyAddressModel.query().findById(testRecord.id).withGraphFetched('address')

        expect(result).toBeInstanceOf(CompanyAddressModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.address).toBeInstanceOf(AddressModel)
        expect(result.address).toEqual(testAddress)
      })
    })

    describe('when linking to company', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyAddressModel.query().innerJoinRelated('company')

        expect(query).toBeDefined()
      })

      it('can eager load the company', async () => {
        const result = await CompanyAddressModel.query().findById(testRecord.id).withGraphFetched('company')

        expect(result).toBeInstanceOf(CompanyAddressModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.company).toBeInstanceOf(CompanyModel)
        expect(result.company).toEqual(testCompany)
      })
    })

    describe('when linking to licence role', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyAddressModel.query().innerJoinRelated('licenceRole')

        expect(query).toBeDefined()
      })

      it('can eager load the licence role', async () => {
        const result = await CompanyAddressModel.query().findById(testRecord.id).withGraphFetched('licenceRole')

        expect(result).toBeInstanceOf(CompanyAddressModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.licenceRole).toBeInstanceOf(LicenceRoleModel)
        expect(result.licenceRole).toMatchObject(testLicenceRole)
      })
    })
  })
})
