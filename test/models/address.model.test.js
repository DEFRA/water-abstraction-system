// Test helpers
import * as AddressHelper from '../support/helpers/address.helper.js'
import * as BillingAccountAddressHelper from '../support/helpers/billing-account-address.helper.js'
import BillingAccountAddressModel from '../../app/models/billing-account-address.model.js'
import * as CompanyAddressHelper from '../support/helpers/company-address.helper.js'
import CompanyAddressModel from '../../app/models/company-address.model.js'
import * as LicenceDocumentRoleHelper from '../support/helpers/licence-document-role.helper.js'
import LicenceDocumentRoleModel from '../../app/models/licence-document-role.model.js'
import * as LicenceVersionHelper from '../support/helpers/licence-version.helper.js'
import LicenceVersionModel from '../../app/models/licence-version.model.js'

// Thing under test
import AddressModel from '../../app/models/address.model.js'

describe('Address model', () => {
  let billingAccountAddresses
  let companyAddresses
  let licenceDocumentRoles
  let licenceVersions
  let testRecord

  beforeAll(async () => {
    // Test record
    testRecord = await AddressHelper.add()
    const { id: addressId } = testRecord

    billingAccountAddresses = []
    companyAddresses = []
    licenceDocumentRoles = []
    licenceVersions = []

    for (let i = 0; i < 2; i++) {
      // Link billing account addresses

      // NOTE: A constraint in the billing_account_addresses table means you cannot have 2 records with the same
      // billingAccountId and start date
      const startDate = i === 0 ? new Date(2023, 8, 4) : new Date(2023, 8, 3)
      const billingAccountAddress = await BillingAccountAddressHelper.add({ startDate, addressId })

      billingAccountAddresses.push(billingAccountAddress)

      // Link company addresses
      const companyAddress = await CompanyAddressHelper.add({ addressId })

      companyAddresses.push(companyAddress)

      // Link licence document roles
      const licenceDocumentRole = await LicenceDocumentRoleHelper.add({ addressId })

      licenceDocumentRoles.push(licenceDocumentRole)

      // Link licence versions
      const licenceVersion = await LicenceVersionHelper.add({ addressId })

      licenceVersions.push(licenceVersion)
    }
  })

  afterAll(async () => {
    for (const licenceVersion of licenceVersions) {
      await licenceVersion.$query().delete()
    }
    for (const licenceDocumentRole of licenceDocumentRoles) {
      await licenceDocumentRole.$query().delete()
    }

    for (const companyAddress of companyAddresses) {
      await companyAddress.$query().delete()
    }

    for (const billingAccountAddress of billingAccountAddresses) {
      await billingAccountAddress.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await AddressModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(AddressModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing account addresses', () => {
      it('can successfully run a related query', async () => {
        const query = await AddressModel.query().innerJoinRelated('billingAccountAddresses')

        expect(query).toBeDefined()
      })

      it('can eager load the billing account addresses', async () => {
        const result = await AddressModel.query().findById(testRecord.id).withGraphFetched('billingAccountAddresses')

        expect(result).toBeInstanceOf(AddressModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billingAccountAddresses).toBeInstanceOf(Array)
        expect(result.billingAccountAddresses[0]).toBeInstanceOf(BillingAccountAddressModel)
        expect(result.billingAccountAddresses).toContainEqual(billingAccountAddresses[0])
        expect(result.billingAccountAddresses).toContainEqual(billingAccountAddresses[1])
      })
    })

    describe('when linking to company addresses', () => {
      it('can successfully run a related query', async () => {
        const query = await AddressModel.query().innerJoinRelated('companyAddresses')

        expect(query).toBeDefined()
      })

      it('can eager load the company addresses', async () => {
        const result = await AddressModel.query().findById(testRecord.id).withGraphFetched('companyAddresses')

        expect(result).toBeInstanceOf(AddressModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.companyAddresses).toBeInstanceOf(Array)
        expect(result.companyAddresses[0]).toBeInstanceOf(CompanyAddressModel)
        expect(result.companyAddresses).toContainEqual(companyAddresses[0])
        expect(result.companyAddresses).toContainEqual(companyAddresses[1])
      })
    })

    describe('when linking to licence document roles', () => {
      it('can successfully run a related query', async () => {
        const query = await AddressModel.query().innerJoinRelated('licenceDocumentRoles')

        expect(query).toBeDefined()
      })

      it('can eager load the licence document roles', async () => {
        const result = await AddressModel.query().findById(testRecord.id).withGraphFetched('licenceDocumentRoles')

        expect(result).toBeInstanceOf(AddressModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceDocumentRoles).toBeInstanceOf(Array)
        expect(result.licenceDocumentRoles[0]).toBeInstanceOf(LicenceDocumentRoleModel)
        expect(result.licenceDocumentRoles).toContainEqual(licenceDocumentRoles[0])
        expect(result.licenceDocumentRoles).toContainEqual(licenceDocumentRoles[1])
      })
    })

    describe('when linking to licence versions', () => {
      it('can successfully run a related query', async () => {
        const query = await AddressModel.query().innerJoinRelated('licenceVersions')

        expect(query).toBeDefined()
      })

      it('can eager load the licence versions', async () => {
        const result = await AddressModel.query().findById(testRecord.id).withGraphFetched('licenceVersions')

        expect(result).toBeInstanceOf(AddressModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceVersions).toBeInstanceOf(Array)
        expect(result.licenceVersions[0]).toBeInstanceOf(LicenceVersionModel)
        expect(result.licenceVersions).toContainEqual(licenceVersions[0])
        expect(result.licenceVersions).toContainEqual(licenceVersions[1])
      })
    })
  })
})
