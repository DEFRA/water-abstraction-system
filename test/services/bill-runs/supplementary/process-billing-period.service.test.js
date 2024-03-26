'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { generateAccountNumber } = require('../../../support/helpers/billing-account.helper.js')
const BillModel = require('../../../../app/models/bill.model.js')
const BillRunError = require('../../../../app/errors/bill-run.error.js')
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const DatabaseSupport = require('../../../support/database.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { determineCurrentFinancialYear } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const ChargingModuleCreateTransactionRequest = require('../../../../app/requests/charging-module/create-transaction.request.js')
const GenerateTransactionsService = require('../../../../app/services/bill-runs/generate-transactions.service.js')
const FetchPreviousTransactionsService = require('../../../../app/services/bill-runs/supplementary/fetch-previous-transactions.service.js')

// Thing under test
const ProcessBillingPeriodService = require('../../../../app/services/bill-runs/supplementary/process-billing-period.service.js')

describe('Supplementary Process Billing Period service', () => {
  const billingPeriod = determineCurrentFinancialYear()
  const billRun = {
    id: '8e0d4c8b-e9fe-4238-8f3e-dfca743316ef',
    externalId: 'f6e052f5-37f9-43f3-a649-ff6398cec1a3'
  }

  let billingAccount
  let otherBillingAccount
  let chargingModuleCreateTransactionRequestStub
  let fetchPreviousTransactionsServiceStub

  beforeEach(async () => {
    // NOTE: Although we don't rely on the helpers to create the data we pass into the service it does persist the
    // results. If we don't clean the DB it causes the tests to fail because of unique constraints on the legacy tables.
    await DatabaseSupport.clean()

    chargingModuleCreateTransactionRequestStub = Sinon.stub(ChargingModuleCreateTransactionRequest, 'send')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    describe('and there are no billing accounts to process', () => {
      it('returns false (bill run is empty)', async () => {
        const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, [])

        expect(result).to.be.false()
      })
    })

    describe('and there is a billing account to process', () => {
      beforeEach(async () => {
        billingAccount = _billingAccount()

        chargingModuleCreateTransactionRequestStub.onFirstCall().resolves({
          ..._chargingModuleResponse('7e752fa6-a19c-4779-b28c-6e536f028795')
        })
        chargingModuleCreateTransactionRequestStub.onSecondCall().resolves({
          ..._chargingModuleResponse('a2086da4-e3b6-4b83-afe1-0e2e5255efaf')
        })
      })

      describe('and they are billable', () => {
        beforeEach(async () => {
          // We want to ensure there is coverage of the functionality that finds an existing bill licence or creates a
          // new one when processing a billing account. To to that we need a billing account with at least 2 charge versions
          // linked to the same licence.
          // But we also want coverage for charge versions that do not have a status of 'current'. These are processed
          // by the service though only for any previous transactions associated with them.
          const supersededChargeVersion = _chargeVersion(billingAccount.id)
          supersededChargeVersion.status = 'superseded'
          billingAccount.chargeVersions = [supersededChargeVersion, _chargeVersion(billingAccount.id), _chargeVersion(billingAccount.id)]
        })

        it('returns true (bill run is not empty)', async () => {
          const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount])

          expect(result).to.be.true()
        })
      })

      describe('and they are partially billable (some bill licences generate 0 transactions)', () => {
        beforeEach(() => {
          // Create a charge version with an abstraction period that starts in June but which is linked to a licence
          // that was revoked at the start of May. The engine should calculate 0 billable days and therefore not attempt
          // to create a bill licence for this record.
          const unbillableChargeVersion = _chargeVersion(billingAccount.id)
          unbillableChargeVersion.licence.id = 'c3726e99-935e-4a36-ab2f-eef8bda9293a'
          unbillableChargeVersion.licence.revokedDate = new Date(billingPeriod.startDate.getFullYear(), 4, 1)
          unbillableChargeVersion.chargeReferences[0].chargeElements[0].abstractionPeriodStartDay = 1
          unbillableChargeVersion.chargeReferences[0].chargeElements[0].abstractionPeriodStartMonth = 6

          billingAccount.chargeVersions = [
            _chargeVersion(billingAccount.id),
            _chargeVersion(billingAccount.id),
            unbillableChargeVersion
          ]
        })

        it('returns true (bill run is not empty)', async () => {
          const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount])

          expect(result).to.be.true()
        })

        it('only persists the bill licences with transactions', async () => {
          await ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount])

          const result = await BillModel.query().findOne('billRunId', billRun.id).withGraphFetched('billLicences')

          expect(result.billLicences.length).to.equal(1)
          expect(result.billLicences[0].licenceId).to.equal(billingAccount.chargeVersions[0].licence.id)
        })
      })

      describe('but they are not billable', () => {
        beforeEach(async () => {
          const chargeVersion = _chargeVersion(billingAccount.id)

          // We update the billing account's charge information so that the engine calculates a charge period that
          // starts after the abstraction period i.e. nothing to bill
          chargeVersion.startDate = new Date(billingPeriod.endDate.getFullYear(), 7, 1)
          chargeVersion.chargeReferences[0].chargeElements[0].abstractionPeriodEndMonth = 5

          billingAccount.chargeVersions = [chargeVersion]
        })

        it('returns false (bill run is empty)', async () => {
          const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount])

          expect(result).to.be.false()
        })
      })
    })

    describe('and there are multiple billing accounts to process', () => {
      const fixedBillingPeriod = { startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31') }

      beforeEach(() => {
        billingAccount = _billingAccount()
        otherBillingAccount = _billingAccount()
      })

      describe('for the same licence', () => {
        beforeEach(() => {
          // NOTE: The scenario we are recreating here is the same as change-billing-account-current-year.cy.js in our
          // acceptance tests. A billing account initially had 1 charge version starting on 2022-04-01 and a supp. bill
          // is generated. This creates a debit for each billing period from 2022-2023 onwards.
          //
          // It then adds a new charge version with the same details, but for a new billing account starting from
          // 2023-04-01. Another supp. bill is generated. The result should be
          //
          // - No bill for 2022-2023. We'll calculate a debit for the same amount which is cancelled out by the previous
          //   transaction
          // - A credit bill for Account A for 2023-2024. We won't calculate a debit but will find the previous
          //   transaction which when reversed will result in a credit
          // - A debit for Account B for 2023-2024. We calculate a debit and find no previous transactions
          //
          // This example is based on doing this in billing period 2023-2024. We've specifically added this example
          // because it was the one acceptance test that found a flaw after refactoring ProcessBillingPeriodService.
          // Next time we intend to catch any flaws sooner!
          const chargeVersionForAccountOne = _chargeVersion(billingAccount.id)
          chargeVersionForAccountOne.endDate = new Date('2023-03-31')
          billingAccount.chargeVersions = [chargeVersionForAccountOne]

          const chargeVersionForAccountTwo = _chargeVersion(otherBillingAccount.id)
          chargeVersionForAccountTwo.startDate = new Date('2023-04-01')
          otherBillingAccount.chargeVersions = [chargeVersionForAccountTwo]

          fetchPreviousTransactionsServiceStub = Sinon.stub(FetchPreviousTransactionsService, 'go')
          fetchPreviousTransactionsServiceStub.onFirstCall().resolves([_previousTransaction()])
          fetchPreviousTransactionsServiceStub.onSecondCall().resolves([])

          chargingModuleCreateTransactionRequestStub.onFirstCall().resolves({
            ..._chargingModuleResponse('7e752fa6-a19c-4779-b28c-6e536f028795')
          })
          chargingModuleCreateTransactionRequestStub.onSecondCall().resolves({
            ..._chargingModuleResponse('a2086da4-e3b6-4b83-afe1-0e2e5255efaf')
          })
        })

        it('creates a credit transaction for the billing account previously billed, and a debit for the new account', async () => {
          const result = await ProcessBillingPeriodService.go(billRun, fixedBillingPeriod, [billingAccount, otherBillingAccount])

          // Confirm we billed something first!
          expect(result).to.be.true()

          // Check the billing account that was replaced at a later date by the other billing account has a credit
          let matchingBills = await _fetchBills(billingAccount.id)

          expect(matchingBills).to.have.length(1)
          expect(matchingBills[0].billLicences).to.have.length(1)
          expect(matchingBills[0].billLicences[0].transactions).to.have.length(1)
          expect(matchingBills[0].billLicences[0].transactions[0].credit).to.be.true()
          expect(matchingBills[0].billLicences[0].transactions[0].startDate).to.equal(new Date('2023-04-01'))
          expect(matchingBills[0].billLicences[0].transactions[0].endDate).to.equal(new Date('2024-03-31'))

          // Check the billing account that replaced the original billing account has a debit
          matchingBills = await _fetchBills(otherBillingAccount.id)

          expect(matchingBills).to.have.length(1)
          expect(matchingBills[0].billLicences).to.have.length(1)
          expect(matchingBills[0].billLicences[0].transactions).to.have.length(1)
          expect(matchingBills[0].billLicences[0].transactions[0].credit).to.be.false()
          expect(matchingBills[0].billLicences[0].transactions[0].startDate).to.equal(new Date('2023-04-01'))
          expect(matchingBills[0].billLicences[0].transactions[0].endDate).to.equal(new Date('2024-03-31'))
        })
      })
    })
  })

  describe('when the service errors', () => {
    beforeEach(async () => {
      billingAccount = _billingAccount()
      billingAccount.chargeVersions = [_chargeVersion(billingAccount.id)]
    })

    describe('because generating the calculated transactions fails', () => {
      beforeEach(async () => {
        Sinon.stub(GenerateTransactionsService, 'go').throws()
      })

      it('throws a BillRunError with the correct code', async () => {
        const error = await expect(ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount]))
          .to
          .reject()

        expect(error).to.be.an.instanceOf(BillRunError)
        expect(error.code).to.equal(BillRunModel.errorCodes.failedToPrepareTransactions)
      })
    })

    describe('because sending the transactions fails', () => {
      beforeEach(async () => {
        chargingModuleCreateTransactionRequestStub.rejects()
      })

      it('throws a BillRunError with the correct code', async () => {
        const error = await expect(ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount]))
          .to
          .reject()

        expect(error).to.be.an.instanceOf(BillRunError)
        expect(error.code).to.equal(BillRunModel.errorCodes.failedToCreateCharge)
      })
    })
  })
})

function _billingAccount () {
  return {
    id: generateUUID(),
    accountNumber: generateAccountNumber()
  }
}

function _chargingModuleResponse (transactionId) {
  return {
    succeeded: true,
    response: {
      body: { transaction: { id: transactionId } }
    }
  }
}

function _chargeVersion (billingAccountId) {
  return {
    id: generateUUID(),
    scheme: 'sroc',
    startDate: new Date('2022-04-01'),
    endDate: null,
    billingAccountId,
    status: 'current',
    licence: {
      id: '1b605a4e-a065-4b17-80eb-47179b99a4e8',
      licenceRef: '01/684',
      waterUndertaker: true,
      historicalAreaCode: 'SAAR',
      regionalChargeArea: 'Southern',
      startDate: new Date('2022-01-01'),
      expiredDate: null,
      lapsedDate: null,
      revokedDate: null,
      region: {
        id: '03d3a38b-0213-43eb-9ab4-d83f26d3b111',
        chargeRegionId: 'A'
      }
    },
    changeReason: {
      id: '9107791e-b4b2-481c-b768-fb66d0b5d22e',
      triggersMinimumCharge: false
    },
    chargeReferences: [
      {
        id: generateUUID(),
        source: 'non-tidal',
        loss: 'low',
        volume: '100',
        adjustments: {
          s126: null, s127: false, s130: false, charge: null, winter: false, aggregate: '1'
        },
        additionalCharges: { isSupplyPublicWater: false },
        description: 'Mineral washing',
        chargeCategory: {
          id: 'cc4a66da-efdb-4882-b18a-daf000131349',
          reference: '4.4.1',
          shortDescription: 'Low loss, non-tidal, up to and including 5,000 ML/yr'
        },
        chargeElements: [
          {
            id: generateUUID(),
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 10,
            // NOTE: We are faking an Objection model which comes with a toJSON() method that gets called as part
            // of processing the billing account.
            toJSON: () => { return '{}' }
          }
        ]
      }
    ]
  }
}

async function _fetchBills (billingAccountId) {
  return BillModel.query()
    .where('billingAccountId', billingAccountId)
    .withGraphFetched('billLicences')
    .modifyGraph('billLicences', (builder) => {
      builder.select([
        'id'
      ])
    })
    .withGraphFetched('billLicences.transactions')
    .modifyGraph('billLicences.transactions', (builder) => {
      builder.select([
        'id',
        'startDate',
        'endDate',
        'credit'
      ])
    })
}

function _previousTransaction () {
  return {
    authorisedDays: 244,
    billableDays: 244,
    waterUndertaker: false,
    chargeReferenceId: '74bf53b8-06ca-4477-a3ce-be1318c9dfbb',
    startDate: new Date('2023-04-01'),
    endDate: new Date('2024-03-31'),
    source: 'non-tidal',
    season: 'all year',
    loss: 'low',
    credit: false,
    chargeType: 'standard',
    authorisedQuantity: 100,
    billableQuantity: 100,
    description: 'Water abstraction charge: SROC Charge Element 02',
    volume: 100,
    section126Factor: 1,
    section127Agreement: false,
    secondPartCharge: false,
    scheme: 'sroc',
    aggregateFactor: 1,
    adjustmentFactor: 1,
    chargeCategoryCode: '4.4.1',
    chargeCategoryDescription: 'Low loss, non-tidal, up to and including 5,000 ML/yr',
    supportedSource: false,
    supportedSourceName: null,
    newLicence: false,
    waterCompanyCharge: false,
    winterOnly: false,
    purposes: [{}],
    section130Agreement: false
  }
}
