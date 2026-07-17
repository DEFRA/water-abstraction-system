// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import BillingAccountAddressHelper from '../support/helpers/billing-account-address.helper.js'
import BillingAccountAddressModel from '../../app/models/billing-account-address.model.js'
import BillingAccountHelper from '../support/helpers/billing-account.helper.js'
import BillingAccountModel from '../../app/models/billing-account.model.js'
import CompanyAddressHelper from '../support/helpers/company-address.helper.js'
import CompanyAddressModel from '../../app/models/company-address.model.js'
import CompanyContactHelper from '../support/helpers/company-contact.helper.js'
import CompanyContactModel from '../../app/models/company-contact.model.js'
import CompanyHelper from '../support/helpers/company.helper.js'
import LicenceDocumentRoleHelper from '../support/helpers/licence-document-role.helper.js'
import LicenceDocumentRoleModel from '../../app/models/licence-document-role.model.js'
import LicenceVersionHelper from '../support/helpers/licence-version.helper.js'
import LicenceVersionModel from '../../app/models/licence-version.model.js'
import RegionHelper from '../support/helpers/region.helper.js'
import RegionModel from '../../app/models/region.model.js'

// Thing under test
import CompanyModel from '../../app/models/company.model.js'

describe('Company model', () => {
  let billingAccountAddresses
  let billingAccounts
  let companyAddresses
  let companyContacts
  let licenceDocumentRoles
  let licenceVersions
  let region
  let testRecord

  beforeAll(async () => {
    region = RegionHelper.select()

    // Test record
    testRecord = await CompanyHelper.add({ regionId: region.id })

    billingAccountAddresses = []
    billingAccounts = []
    companyAddresses = []
    companyContacts = []
    licenceDocumentRoles = []
    licenceVersions = []

    for (let i = 0; i < 2; i++) {
      // Link billing account addresses

      // NOTE: A constraint in the billing_account_addresses table means you cannot have 2 records with the same
      // billingAccountId and start date
      const startDate = i === 0 ? new Date(2023, 8, 4) : new Date(2023, 8, 3)
      const billingAccountAddress = await BillingAccountAddressHelper.add({ startDate, companyId: testRecord.id })

      billingAccountAddresses.push(billingAccountAddress)

      // Link billing accounts
      const billingAccount = await BillingAccountHelper.add({ companyId: testRecord.id })

      billingAccounts.push(billingAccount)

      // Link company addresses
      const companyAddress = await CompanyAddressHelper.add({ companyId: testRecord.id })

      companyAddresses.push(companyAddress)

      // Link company contacts
      const companyContact = await CompanyContactHelper.add({ companyId: testRecord.id })

      companyContacts.push(companyContact)

      // Link licence document roles
      const licenceDocumentRole = await LicenceDocumentRoleHelper.add({ companyId: testRecord.id })

      licenceDocumentRoles.push(licenceDocumentRole)

      // Link licence versions
      const licenceVersion = await LicenceVersionHelper.add({ companyId: testRecord.id })

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

    for (const companyContact of companyContacts) {
      await companyContact.$query().delete()
    }

    for (const companyAddress of companyAddresses) {
      await companyAddress.$query().delete()
    }

    for (const billingAccount of billingAccounts) {
      await billingAccount.$query().delete()
    }

    for (const billingAccountAddress of billingAccountAddresses) {
      await billingAccountAddress.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await CompanyModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(CompanyModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing account addresses', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query().innerJoinRelated('billingAccountAddresses')

        expect(query).toBeDefined()
      })

      it('can eager load the billing account addresses', async () => {
        const result = await CompanyModel.query().findById(testRecord.id).withGraphFetched('billingAccountAddresses')

        expect(result).toBeInstanceOf(CompanyModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billingAccountAddresses).toBeInstanceOf(Array)
        expect(result.billingAccountAddresses[0]).toBeInstanceOf(BillingAccountAddressModel)
        expect(result.billingAccountAddresses).toContainEqual(billingAccountAddresses[0])
        expect(result.billingAccountAddresses).toContainEqual(billingAccountAddresses[1])
      })
    })

    describe('when linking to billing accounts', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query().innerJoinRelated('billingAccounts')

        expect(query).toBeDefined()
      })

      it('can eager load the billing accounts', async () => {
        const result = await CompanyModel.query().findById(testRecord.id).withGraphFetched('billingAccounts')

        expect(result).toBeInstanceOf(CompanyModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billingAccounts).toBeInstanceOf(Array)
        expect(result.billingAccounts[0]).toBeInstanceOf(BillingAccountModel)
        expect(result.billingAccounts).toContainEqual(billingAccounts[0])
        expect(result.billingAccounts).toContainEqual(billingAccounts[1])
      })
    })

    describe('when linking to company addresses', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query().innerJoinRelated('companyAddresses')

        expect(query).toBeDefined()
      })

      it('can eager load the company addresses', async () => {
        const result = await CompanyModel.query().findById(testRecord.id).withGraphFetched('companyAddresses')

        expect(result).toBeInstanceOf(CompanyModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.companyAddresses).toBeInstanceOf(Array)
        expect(result.companyAddresses[0]).toBeInstanceOf(CompanyAddressModel)
        expect(result.companyAddresses).toContainEqual(companyAddresses[0])
        expect(result.companyAddresses).toContainEqual(companyAddresses[1])
      })
    })

    describe('when linking to company contacts', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query().innerJoinRelated('companyContacts')

        expect(query).toBeDefined()
      })

      it('can eager load the company contacts', async () => {
        const result = await CompanyModel.query().findById(testRecord.id).withGraphFetched('companyContacts')

        expect(result).toBeInstanceOf(CompanyModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.companyContacts).toBeInstanceOf(Array)
        expect(result.companyContacts[0]).toBeInstanceOf(CompanyContactModel)
        expect(result.companyContacts).toContainEqual(companyContacts[0])
        expect(result.companyContacts).toContainEqual(companyContacts[1])
      })
    })

    describe('when linking to licence document roles', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query().innerJoinRelated('licenceDocumentRoles')

        expect(query).toBeDefined()
      })

      it('can eager load the licence document roles', async () => {
        const result = await CompanyModel.query().findById(testRecord.id).withGraphFetched('licenceDocumentRoles')

        expect(result).toBeInstanceOf(CompanyModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceDocumentRoles).toBeInstanceOf(Array)
        expect(result.licenceDocumentRoles[0]).toBeInstanceOf(LicenceDocumentRoleModel)
        expect(result.licenceDocumentRoles).toContainEqual(licenceDocumentRoles[0])
        expect(result.licenceDocumentRoles).toContainEqual(licenceDocumentRoles[1])
      })
    })

    describe('when linking to licence versions', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query().innerJoinRelated('licenceVersions')

        expect(query).toBeDefined()
      })

      it('can eager load the licence versions', async () => {
        const result = await CompanyModel.query().findById(testRecord.id).withGraphFetched('licenceVersions')

        expect(result).toBeInstanceOf(CompanyModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceVersions).toBeInstanceOf(Array)
        expect(result.licenceVersions[0]).toBeInstanceOf(LicenceVersionModel)
        expect(result.licenceVersions).toContainEqual(licenceVersions[0])
        expect(result.licenceVersions).toContainEqual(licenceVersions[1])
      })
    })

    describe('when linking to region', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query().innerJoinRelated('region')

        expect(query).toBeDefined()
      })

      it('can eager load the region', async () => {
        const result = await CompanyModel.query().findById(testRecord.id).withGraphFetched('region')

        expect(result).toBeInstanceOf(CompanyModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.region).toBeInstanceOf(RegionModel)
        expect(result.region).toMatchObject(region)
      })
    })
  })
})
