'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const AddressHelper = require('../../support/helpers/address.helper.js')
const BillHelper = require('../../support/helpers/bill.helper.js')
const BillingAccountHelper = require('../../support/helpers/billing-account.helper.js')
const BillingAccountAddressHelper = require('../../support/helpers/billing-account-address.helper.js')
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../app/models/bill-run.model.js')
const BillLicenceHelper = require('../../support/helpers/bill-licence.helper.js')
const CompanyHelper = require('../../support/helpers/company.helper.js')
const { closeConnection } = require('../../support/database.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')
const RegionModel = require('../../../app/models/region.model.js')

// Thing under test
const FetchBillRunService = require('../../../app/services/bill-runs/fetch-bill-run.service.js')

describe('Fetch Bill Run service', () => {
  let linkedBillingAccounts
  let linkedBills
  let linkedCompanies
  let linkedLicences
  let linkedRegion
  let testBillRun

  beforeEach(async () => {
    // Create the initial bill run linked and associated region
    linkedRegion = RegionHelper.select()
    testBillRun = await BillRunHelper.add({ regionId: linkedRegion.id })

    // Create 3 licences including 1 that is a water undertaker (company). We'll link the first 2 to the first bill to
    // test the result we get lists both. We link the 3rd licence to the second bill to test we correctly flag the bill
    // is for a water company
    linkedLicences = await Promise.all([
      LicenceHelper.add({ regionId: linkedRegion.id }),
      LicenceHelper.add({ regionId: linkedRegion.id }),
      LicenceHelper.add({ regionId: linkedRegion.id, waterUndertaker: true })
    ])

    // Create 3 companies. Billing accounts _have_ to be linked to a company. So, we have 1 for each billing account.
    // They must also be linked to at least 1 BillingAccountAddress (BAA). The BAA can optionally be linked to an agent
    // company. We have to do all this setup to confirm the service returns both the company name and agent company
    // name where it exists. This is because when this data finally makes it to the UI, we display the agent company
    // name where it exists, else the linked company name.
    linkedCompanies = await Promise.all([
      CompanyHelper.add({ name: 'Company One Ltd' }),
      CompanyHelper.add({ name: 'Company Two Ltd' }),
      CompanyHelper.add({ name: 'Agent Company Ltd' })
    ])

    // We intend to create 2 Bills linked to this bill run and test we get 2 summaries back. Each bill _must_ be linked
    // to a different billing account. So, we need two.
    linkedBillingAccounts = await Promise.all([
      BillingAccountHelper.add({ companyId: linkedCompanies[0].id }),
      BillingAccountHelper.add({ companyId: linkedCompanies[1].id })
    ])

    // We don't care about the address in our service. But it's a required field when creating a BillingAccountAddress
    const address = await AddressHelper.add()

    // Create a BillingAccountAddress for each BillingAccount we created. On the second one we set the optional agent
    // company we prepared earlier
    await Promise.all([
      BillingAccountAddressHelper.add({
        billingAccountId: linkedBillingAccounts[0].id,
        addressId: address.id
      }),
      BillingAccountAddressHelper.add({
        billingAccountId: linkedBillingAccounts[1].id,
        addressId: address.id,
        companyId: linkedCompanies[2].id
      })
    ])

    // Create the 2 bills linked to our bill run. These form the basis for the bill summaries we expect to see in the
    // result from the service
    linkedBills = await Promise.all([
      BillHelper.add({
        billRunId: testBillRun.id,
        billingAccountId: linkedBillingAccounts[0].id,
        accountNumber: linkedBillingAccounts[0].accountNumber,
        netAmount: 1550
      }),
      BillHelper.add({
        billRunId: testBillRun.id,
        billingAccountId: linkedBillingAccounts[1].id,
        accountNumber: linkedBillingAccounts[1].accountNumber,
        netAmount: 2345
      })
    ])

    // Licences are linked to a bill via BillLicences. We create 3 so we can test that the first bill summary returns
    // multiple licence references (the first 2) in its `allLicences` property.
    await Promise.all([
      BillLicenceHelper.add({
        billId: linkedBills[0].id,
        licenceId: linkedLicences[0].id,
        licenceRef: linkedLicences[0].licenceRef
      }),
      BillLicenceHelper.add({
        billId: linkedBills[0].id,
        licenceId: linkedLicences[1].id,
        licenceRef: linkedLicences[1].licenceRef
      }),
      BillLicenceHelper.add({
        billId: linkedBills[1].id,
        licenceId: linkedLicences[2].id,
        licenceRef: linkedLicences[2].licenceRef
      })
    ])
  })

  after(async () => {
    await closeConnection()
  })

  describe('when a bill run with a matching ID exists', () => {
    it('returns the matching instance of BillRunModel', async () => {
      const { billRun: result } = await FetchBillRunService.go(testBillRun.id)

      expect(result.id).to.equal(testBillRun.id)
      expect(result).to.be.an.instanceOf(BillRunModel)
    })

    it('returns the matching bill run including the linked region', async () => {
      const { billRun: result } = await FetchBillRunService.go(testBillRun.id)
      const { region: returnedRegion } = result

      expect(result.id).to.equal(testBillRun.id)
      expect(result).to.be.an.instanceOf(BillRunModel)

      expect(returnedRegion.id).to.equal(linkedRegion.id)
      expect(returnedRegion).to.be.an.instanceOf(RegionModel)
    })

    it('returns a bill summary for each bill linked to the bill run', async () => {
      const { billSummaries: result } = await FetchBillRunService.go(testBillRun.id)

      // NOTE: When we create the licences the helper will generate random licence references. When the service returns
      // them for the first bill though, they are expected to be in ascending order. So, we need to sort them first to
      // then compare against the result
      const firstBillsLicences = [linkedLicences[0].licenceRef, linkedLicences[1].licenceRef].sort()

      expect(result).to.have.length(2)
      expect(result).to.include({
        id: linkedBills[0].id,
        billingAccountId: linkedBills[0].billingAccountId,
        accountNumber: linkedBills[0].accountNumber,
        netAmount: linkedBills[0].netAmount,
        financialYearEnding: linkedBills[0].financialYearEnding,
        companyName: linkedCompanies[0].name,
        agentName: null,
        allLicences: firstBillsLicences.join(','),
        waterCompany: false
      })
      expect(result).to.include({
        id: linkedBills[1].id,
        billingAccountId: linkedBills[1].billingAccountId,
        accountNumber: linkedBills[1].accountNumber,
        netAmount: linkedBills[1].netAmount,
        financialYearEnding: linkedBills[1].financialYearEnding,
        companyName: linkedCompanies[1].name,
        agentName: linkedCompanies[2].name,
        allLicences: `${linkedLicences[2].licenceRef}`,
        waterCompany: true
      })
    })
  })

  describe('when a bill run with a matching ID does not exist', () => {
    it('returns a result with no values set', async () => {
      const result = await FetchBillRunService.go('93112100-152b-4860-abea-2adee11dcd69')

      expect(result).to.exist()
      expect(result.billRun).to.equal(undefined)
      expect(result.billSummaries).to.equal([])
    })
  })
})
