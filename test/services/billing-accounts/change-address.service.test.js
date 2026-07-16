// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import AddressHelper from '../../support/helpers/address.helper.js'
import AddressModel from '../../../app/models/address.model.js'
import BillingAccountAddressHelper from '../../support/helpers/billing-account-address.helper.js'
import BillingAccountAddressModel from '../../../app/models/billing-account-address.model.js'
import BillingAccountHelper from '../../support/helpers/billing-account.helper.js'
import CompanyHelper from '../../support/helpers/company.helper.js'
import CompanyModel from '../../../app/models/company.model.js'
import ContactModel from '../../../app/models/contact.model.js'

// Things we need to stub
import * as SendCustomerChangeService from '../../../app/services/billing-accounts/send-customer-change.service.js'

// Thing under test
import ChangeAddressService from '../../../app/services/billing-accounts/change-address.service.js'

describe('Change address service', () => {
  let address
  let agentCompany
  let billingAccount
  let contact

  beforeEach(async () => {
    billingAccount = await BillingAccountHelper.add()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request to the Charging Module API succeeds', () => {
    beforeEach(async () => {
      vi.spyOn(SendCustomerChangeService, 'default').mockResolvedValue()
    })

    describe('and only an address is provided', () => {
      beforeEach(() => {
        address = { addressLine1: '1 Matrix Rd', town: 'Testington', postcode: 'JC1 1BC' }
      })

      it('creates the billing account address and address records and handles the null agent and contact', async () => {
        const result = await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

        const newAddress = await AddressModel.query().where('postcode', address.postcode).first()

        expect(result.billingAccountAddress.addressId).toEqual(newAddress.id)
        expect(result.address.address1).toEqual('1 Matrix Rd')
        expect(result.address.address5).toEqual('Testington')
        expect(result.agentCompany).toBeNull()
        expect(result.contact).toBeNull()
      })
    })

    describe('and the address provided', () => {
      describe('was selected from OS Places results (has a UPRN)', () => {
        beforeEach(() => {
          address = {
            addressLine1: 'NATURAL ENGLAND',
            addressLine2: 'HORIZON HOUSE',
            town: 'BRISTOL',
            postcode: 'BS1 5AH',
            uprn: AddressHelper.generateUprn()
          }
        })

        describe('and a matching address already exists', () => {
          let existingAddress

          beforeEach(async () => {
            const { uprn } = address

            existingAddress = await AddressHelper.add({ uprn })
          })

          it('overwrites the existing address with the latest OS Places details', async () => {
            await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

            const reFetchedExistingAddress = await existingAddress.$query()

            expect(reFetchedExistingAddress.id).toEqual(existingAddress.id)
            expect(reFetchedExistingAddress.createdAt).toEqual(existingAddress.createdAt)
            expect(reFetchedExistingAddress.address1).toEqual(address.addressLine1)
          })

          it('links the billing account address record to the existing address', async () => {
            const result = await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

            expect(result.billingAccountAddress.addressId).toEqual(existingAddress.id)
          })
        })

        describe('and a matching address does not exist', () => {
          it('creates a new address record', async () => {
            await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

            const result = await AddressModel.query().where('uprn', address.uprn)

            expect(result.length).toEqual(1)
            expect(result[0].address1).toEqual(address.addressLine1)
            expect(result[0].postcode).toEqual(address.postcode)
          })

          it('links the billing account address record to the new address', async () => {
            const result = await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

            const newAddress = await AddressModel.query().where('uprn', address.uprn).first()

            expect(result.billingAccountAddress.addressId).toEqual(newAddress.id)
          })
        })
      })

      describe('was entered manually (does not have a UPRN)', () => {
        beforeEach(() => {
          address = { addressLine1: '2 Matrix Rd', town: 'Testington', postcode: 'JC2 2BC' }
        })

        it('creates a new address record', async () => {
          await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

          const result = await AddressModel.query().where('postcode', address.postcode)

          expect(result.length).toEqual(1)
          expect(result[0].address1).toEqual('2 Matrix Rd')
        })

        it('links the billing account address record to the new address', async () => {
          const result = await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

          const newAddress = await AddressModel.query().findById(result.address.id)

          expect(result.billingAccountAddress.addressId).toEqual(newAddress.id)
        })
      })

      describe('was selected from previously used addresses (has an ID)', () => {
        let existingAddress

        beforeEach(async () => {
          existingAddress = await AddressHelper.add()

          address = { addressId: existingAddress.id }
        })

        it('makes no changes to the existing address record', async () => {
          await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

          const reFetchedExistingAddress = await existingAddress.$query()

          expect(reFetchedExistingAddress.id).toEqual(existingAddress.id)
          expect(reFetchedExistingAddress.address1).toEqual(existingAddress.address1)
          expect(reFetchedExistingAddress.createdAt).toEqual(existingAddress.createdAt)
          expect(reFetchedExistingAddress.updatedAt).toEqual(existingAddress.updatedAt)
        })

        it('links the billing account address record to the existing address', async () => {
          const result = await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

          expect(result.billingAccountAddress.addressId).toEqual(existingAddress.id)
        })
      })
    })

    describe('and the company provided', () => {
      beforeEach(() => {
        address = { addressLine1: '3 Matrix Rd', town: 'Testington', postcode: 'JC3 3BC' }
        agentCompany = {
          type: 'organisation',
          name: 'SCP Foundation',
          companyNumber: CompanyHelper.generateCompanyNumber(),
          organisationType: 'limitedCompany'
        }
      })

      describe('has a company number that matches an existing record', () => {
        let existingCompany

        beforeEach(async () => {
          const { companyNumber } = agentCompany

          existingCompany = await CompanyHelper.add({ companyNumber })
        })

        it('overwrites the existing company with the latest Companies House details', async () => {
          await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

          const reFetchedExistingCompany = await existingCompany.$query()

          expect(reFetchedExistingCompany.id).toEqual(existingCompany.id)
          expect(reFetchedExistingCompany.createdAt).toEqual(existingCompany.createdAt)
          expect(reFetchedExistingCompany.name).toEqual(agentCompany.name)
        })

        it('links the billing account address record to the existing company', async () => {
          const result = await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

          expect(result.billingAccountAddress.companyId).toEqual(existingCompany.id)
        })
      })

      describe('has a company number that does not match an existing record', () => {
        it('creates a new company record', async () => {
          await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

          const result = await CompanyModel.query().where('companyNumber', agentCompany.companyNumber)

          expect(result.length).toEqual(1)
          expect(result[0].name).toEqual(agentCompany.name)
        })

        it('links the billing account address record to the new company', async () => {
          const result = await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

          const newCompany = await CompanyModel.query().where('companyNumber', agentCompany.companyNumber).first()

          expect(result.billingAccountAddress.companyId).toEqual(newCompany.id)
        })
      })

      describe('was selected from companies matching the provided search', () => {
        let existingCompany

        beforeEach(async () => {
          existingCompany = await CompanyHelper.add()

          agentCompany = { companyId: existingCompany.id }
        })

        it('makes no changes to the existing company record', async () => {
          await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

          const reFetchedExistingCompany = await existingCompany.$query()

          expect(reFetchedExistingCompany.id).toEqual(existingCompany.id)
          expect(reFetchedExistingCompany.name).toEqual(existingCompany.name)
          expect(reFetchedExistingCompany.createdAt).toEqual(existingCompany.createdAt)
          expect(reFetchedExistingCompany.updatedAt).toEqual(existingCompany.updatedAt)
        })

        it('links the billing account address record to the existing company', async () => {
          const result = await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

          expect(result.billingAccountAddress.companyId).toEqual(existingCompany.id)
        })
      })
    })

    describe('and the contact is provided', () => {
      beforeEach(() => {
        address = { addressLine1: '4 Matrix Rd', town: 'Testington', postcode: 'JC4 4BC' }
      })

      describe('is a department', () => {
        beforeEach(() => {
          contact = {
            type: 'department',
            department: 'Humanoid Risk Assessment'
          }
        })

        it('creates a new contact record', async () => {
          await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

          const result = await ContactModel.query().where('department', 'Humanoid Risk Assessment')

          expect(result.length).toEqual(1)
        })

        it('links the billing account address record to the new contact', async () => {
          const result = await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

          const newContact = await ContactModel.query().findById(result.contact.id)

          expect(result.billingAccountAddress.contactId).toEqual(newContact.id)
        })
      })

      describe('is an individual', () => {
        beforeEach(() => {
          contact = {
            type: 'person',
            firstName: 'Margarita',
            lastName: 'Villa'
          }
        })

        it('creates a new contact record', async () => {
          await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

          const result = await ContactModel.query().where('lastName', 'Villa')

          expect(result.length).toEqual(1)
          expect(result[0].firstName).toEqual('Margarita')
          expect(result[0].lastName).toEqual('Villa')
        })

        it('links the billing account address record to the new contact', async () => {
          const result = await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

          const newContact = await ContactModel.query().findById(result.contact.id)

          expect(result.billingAccountAddress.contactId).toEqual(newContact.id)
        })
      })
    })

    describe('and the "current" billing account address', () => {
      let existingBillingAccountAddress

      beforeEach(() => {
        address = { addressLine1: '5 Matrix Rd', town: 'Testington', postcode: 'JC5 5BC' }

        const testDate = new Date(2023, 8, 4, 10, 31, 57, 2)

        vi.useFakeTimers({ now: testDate, toFake: ['Date'] })
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      describe('has a matching start date', () => {
        beforeEach(async () => {
          const startDate = new Date(2023, 8, 4)
          const timestamp = new Date(2023, 8, 4, 9, 22, 57, 13)

          existingBillingAccountAddress = await BillingAccountAddressHelper.add({
            billingAccountId: billingAccount.id,
            startDate,
            createdAt: timestamp,
            updatedAt: timestamp
          })
        })

        it('overwrites the existing record and ensures the end date is null', async () => {
          const result = await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

          const newBillingAccountAddress = await BillingAccountAddressModel.query().findById(
            result.billingAccountAddress.id
          )

          expect(newBillingAccountAddress.id).toEqual(existingBillingAccountAddress.id)
          expect(newBillingAccountAddress.addressId).not.toEqual(existingBillingAccountAddress.addressId)
          expect(newBillingAccountAddress.endDate).toBeNull()
          expect(newBillingAccountAddress.createdAt).toEqual(existingBillingAccountAddress.createdAt)
          expect(newBillingAccountAddress.updatedAt.getTime()).toBeGreaterThan(
            existingBillingAccountAddress.updatedAt.getTime()
          )
        })
      })

      describe('has a different start date', () => {
        beforeEach(async () => {
          const startDate = new Date(2023, 7, 3)
          const timestamp = new Date(2023, 7, 3, 14, 46, 3, 18)

          existingBillingAccountAddress = await BillingAccountAddressHelper.add({
            billingAccountId: billingAccount.id,
            startDate,
            createdAt: timestamp,
            updatedAt: timestamp
          })
        })

        it('creates a new billing account record with a null end date', async () => {
          const result = await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

          const newBillingAccountAddress = await BillingAccountAddressModel.query().findById(
            result.billingAccountAddress.id
          )

          expect(newBillingAccountAddress.id).not.toEqual(existingBillingAccountAddress.id)
          expect(newBillingAccountAddress.addressId).not.toEqual(existingBillingAccountAddress.addressId)
          expect(newBillingAccountAddress.endDate).toBeNull()
          expect(newBillingAccountAddress.createdAt.getTime()).toBeGreaterThan(
            existingBillingAccountAddress.createdAt.getTime()
          )
          expect(newBillingAccountAddress.updatedAt.getTime()).toBeGreaterThan(
            existingBillingAccountAddress.updatedAt.getTime()
          )
        })

        it("updates the end date of the existing record to yesterday's date", async () => {
          await ChangeAddressService(billingAccount.id, address, agentCompany, contact)

          const reFetchedExistingBillingAccountAddress = await existingBillingAccountAddress.$query()
          const yesterday = new Date(2023, 8, 3)

          expect(reFetchedExistingBillingAccountAddress.endDate).toEqual(yesterday)
          expect(reFetchedExistingBillingAccountAddress.updatedAt.getTime()).toBeGreaterThan(
            existingBillingAccountAddress.updatedAt.getTime()
          )
        })
      })
    })
  })

  describe('when the request to the Charging Module API fails', () => {
    beforeEach(() => {
      vi.spyOn(SendCustomerChangeService, 'default').mockRejectedValue()
    })

    it('throws an error', async () => {
      await expect(ChangeAddressService(billingAccount, address, agentCompany, contact)).rejects.toThrow()
    })
  })

  describe('when persisting the changes fails', () => {
    beforeEach(() => {
      address = { addressLine1: '1 Worlds End', town: 'Testington', postcode: 'ZZ9 9JC' }
      agentCompany = {
        type: 'organisation',
        name: 'WRLS Team',
        companyNumber: CompanyHelper.generateCompanyNumber(),
        organisationType: 'limitedCompany'
      }
      contact = {
        type: 'department',
        department: 'Bean Counting'
      }

      // We just need something within the transaction to go bang. `fromJson() is ideal because a) we can stub it!, and
      // b) it gets called after we have supposedly persisted the address, company and contact records.
      vi.spyOn(BillingAccountAddressModel, 'fromJson').mockRejectedValue()
    })

    it('throws an error', async () => {
      await expect(ChangeAddressService(billingAccount, address, agentCompany, contact)).rejects.toThrow()
    })

    it('no changes are made to the DB', async () => {
      await expect(ChangeAddressService(billingAccount, address, agentCompany, contact)).rejects.toThrow()

      const resultAddresses = await AddressModel.query().where('postcode', address.postcode)
      const resultCompanies = await CompanyModel.query().where('name', agentCompany.name)
      const resultContacts = await ContactModel.query().where('department', contact.department)
      const resultBillingAccountAddresses = await BillingAccountAddressModel.query().findById(billingAccount.id)

      expect(resultAddresses).toHaveLength(0)
      expect(resultCompanies).toHaveLength(0)
      expect(resultContacts).toHaveLength(0)
      expect(resultBillingAccountAddresses).toBeUndefined()
    })
  })
})
