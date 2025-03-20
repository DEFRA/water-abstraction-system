'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const PreviousBillingDataSeeder = require('../../support/seeders/previous-billing-data.seeder.js')

// Thing under test
const FetchPreviousTransactionsService = require('../../../app/services/bill-runs/fetch-previous-transactions.service.js')

describe('Bill Runs - Fetch Previous Transactions service', () => {
  let seededData
  let standard
  let twoPartTariff
  let twoPartTariffFlag

  before(async () => {
    seededData = await PreviousBillingDataSeeder.seed()

    standard = seededData.standard
    twoPartTariff = seededData.twoPartTariff
  })

  after(async () => {
    await PreviousBillingDataSeeder.zap(seededData)
  })

  describe('when a "standard" supplementary bill run is being created', () => {
    before(() => {
      twoPartTariffFlag = false
    })

    describe('and the billing account has bills in the previous annual and supplementary bill runs', () => {
      describe('and the licence is in both bill runs', () => {
        // NOTE: This would result in 3 transactions for the licence
        //
        // - Bill Run 1 - Annual - debit
        // - Bill Run 2 - Supplementary - credit
        // - Bill Run 2 - Supplementary - debit
        //
        // The credit being for the debit in the annual.
        //
        // When creating Bill Run 3 FetchPreviousTransactions will find these 3 transactions. The annual debit and
        // supplementary credit will cancel each other out, leaving just the supplementary debit to be taken forward.
        //
        // For reference, ProcessSupplementaryTransactions, which calls this service, will flip it to a credit, then
        // compare it to the transactions it is generating.
        it('returns the debit from the supplementary (transactions in the annual and supplementary cancel out)', async () => {
          const results = await FetchPreviousTransactionsService.go(
            seededData.billingAccount.id,
            seededData.licenceBoth.id,
            seededData.toFinancialYearEnding,
            twoPartTariffFlag
          )

          expect(results).to.have.length(1)

          const expectedDebit = standard.supplementaryBillRun.bills[0].billLicences[0].transactions[1]

          expect(results[0]).to.equal({
            authorisedDays: expectedDebit.authorisedDays,
            billableDays: expectedDebit.billableDays,
            waterUndertaker: expectedDebit.waterUndertaker,
            chargeReferenceId: expectedDebit.chargeReferenceId,
            startDate: expectedDebit.startDate,
            endDate: expectedDebit.endDate,
            source: expectedDebit.source,
            season: expectedDebit.season,
            loss: expectedDebit.loss,
            credit: false,
            chargeType: 'standard',
            authorisedQuantity: expectedDebit.authorisedQuantity,
            billableQuantity: expectedDebit.billableQuantity,
            description: expectedDebit.description,
            volume: expectedDebit.volume,
            section126Factor: expectedDebit.section126Factor,
            section127Agreement: expectedDebit.section127Agreement,
            secondPartCharge: expectedDebit.secondPartCharge,
            scheme: expectedDebit.scheme,
            aggregateFactor: expectedDebit.aggregateFactor,
            adjustmentFactor: expectedDebit.adjustmentFactor,
            chargeCategoryCode: expectedDebit.chargeCategoryCode,
            chargeCategoryDescription: expectedDebit.chargeCategoryDescription,
            supportedSource: expectedDebit.supportedSource,
            supportedSourceName: expectedDebit.supportedSourceName,
            newLicence: expectedDebit.newLicence,
            waterCompanyCharge: expectedDebit.waterCompanyCharge,
            winterOnly: expectedDebit.winterOnly,
            purposes: expectedDebit.purposes,
            section130Agreement: expectedDebit.section130Agreement === 'true'
          })
        })
      })

      describe('but the licence is only in one of the bill runs', () => {
        // NOTE: In this example the licence was billed in the annual, but this is its first supplementary bill run.
        //
        // So, the service will have no credits to cancel it off and will just return it for further processing.
        it('returns the debit from the debit from it', async () => {
          const results = await FetchPreviousTransactionsService.go(
            seededData.billingAccount.id,
            seededData.licenceAnnual.id,
            seededData.toFinancialYearEnding,
            twoPartTariffFlag
          )

          expect(results).to.have.length(1)

          const expectedDebit = standard.annualBillRun.bills[0].billLicences[0].transactions[0]

          expect(results[0]).to.equal({
            authorisedDays: expectedDebit.authorisedDays,
            billableDays: expectedDebit.billableDays,
            waterUndertaker: expectedDebit.waterUndertaker,
            chargeReferenceId: expectedDebit.chargeReferenceId,
            startDate: expectedDebit.startDate,
            endDate: expectedDebit.endDate,
            source: expectedDebit.source,
            season: expectedDebit.season,
            loss: expectedDebit.loss,
            credit: false,
            chargeType: 'standard',
            authorisedQuantity: expectedDebit.authorisedQuantity,
            billableQuantity: expectedDebit.billableQuantity,
            description: expectedDebit.description,
            volume: expectedDebit.volume,
            section126Factor: expectedDebit.section126Factor,
            section127Agreement: expectedDebit.section127Agreement,
            secondPartCharge: expectedDebit.secondPartCharge,
            scheme: expectedDebit.scheme,
            aggregateFactor: expectedDebit.aggregateFactor,
            adjustmentFactor: expectedDebit.adjustmentFactor,
            chargeCategoryCode: expectedDebit.chargeCategoryCode,
            chargeCategoryDescription: expectedDebit.chargeCategoryDescription,
            supportedSource: expectedDebit.supportedSource,
            supportedSourceName: expectedDebit.supportedSourceName,
            newLicence: expectedDebit.newLicence,
            waterCompanyCharge: expectedDebit.waterCompanyCharge,
            winterOnly: expectedDebit.winterOnly,
            purposes: expectedDebit.purposes,
            section130Agreement: expectedDebit.section130Agreement === 'true'
          })
        })
      })

      describe('but the licence has never been billed', () => {
        it('returns an empty array', async () => {
          const results = await FetchPreviousTransactionsService.go(
            seededData.billingAccount.id,
            '6d2b7db9-afee-4af2-8916-88c23dd9807d',
            seededData.toFinancialYearEnding,
            twoPartTariffFlag
          )

          expect(results).to.have.length(0)
        })
      })
    })

    describe('and the billing account has no previous bills', () => {
      it('returns an empty array', async () => {
        const results = await FetchPreviousTransactionsService.go(
          'c772d96a-7e99-4f37-8fbd-414828e42ac4',
          '6d2b7db9-afee-4af2-8916-88c23dd9807d',
          seededData.toFinancialYearEnding,
          twoPartTariffFlag
        )

        expect(results).to.have.length(0)
      })
    })
  })

  describe('when a "two-part tariff" supplementary bill run is being created', () => {
    before(() => {
      twoPartTariffFlag = true
    })

    describe('and the billing account has bills in the previous annual and supplementary bill runs', () => {
      describe('and the licence is in both bill runs', () => {
        // NOTE: This would result in 3 transactions for the licence
        //
        // - Bill Run 1 - Annual - debit
        // - Bill Run 2 - Supplementary - credit
        // - Bill Run 2 - Supplementary - debit
        //
        // The credit being for the debit in the annual.
        //
        // When creating Bill Run 3 FetchPreviousTransactions will find these 3 transactions. The annual debit and
        // supplementary credit will cancel each other out, leaving just the supplementary debit to be taken forward.
        //
        // For reference, ProcessSupplementaryTransactions, which calls this service, will flip it to a credit, then
        // compare it to the transactions it is generating.
        it('returns the debit from the supplementary (transactions in the annual and supplementary cancel out)', async () => {
          const results = await FetchPreviousTransactionsService.go(
            seededData.billingAccount.id,
            seededData.licenceBoth.id,
            seededData.toFinancialYearEnding,
            twoPartTariffFlag
          )

          expect(results).to.have.length(1)

          const expectedDebit = twoPartTariff.supplementaryBillRun.bills[0].billLicences[0].transactions[1]

          expect(results[0]).to.equal({
            authorisedDays: expectedDebit.authorisedDays,
            billableDays: expectedDebit.billableDays,
            waterUndertaker: expectedDebit.waterUndertaker,
            chargeReferenceId: expectedDebit.chargeReferenceId,
            startDate: expectedDebit.startDate,
            endDate: expectedDebit.endDate,
            source: expectedDebit.source,
            season: expectedDebit.season,
            loss: expectedDebit.loss,
            credit: false,
            chargeType: 'standard',
            authorisedQuantity: expectedDebit.authorisedQuantity,
            billableQuantity: expectedDebit.billableQuantity,
            description: expectedDebit.description,
            volume: expectedDebit.volume,
            section126Factor: expectedDebit.section126Factor,
            section127Agreement: expectedDebit.section127Agreement,
            secondPartCharge: expectedDebit.secondPartCharge,
            scheme: expectedDebit.scheme,
            aggregateFactor: expectedDebit.aggregateFactor,
            adjustmentFactor: expectedDebit.adjustmentFactor,
            chargeCategoryCode: expectedDebit.chargeCategoryCode,
            chargeCategoryDescription: expectedDebit.chargeCategoryDescription,
            supportedSource: expectedDebit.supportedSource,
            supportedSourceName: expectedDebit.supportedSourceName,
            newLicence: expectedDebit.newLicence,
            waterCompanyCharge: expectedDebit.waterCompanyCharge,
            winterOnly: expectedDebit.winterOnly,
            purposes: expectedDebit.purposes,
            section130Agreement: expectedDebit.section130Agreement === 'true'
          })
        })
      })

      describe('but the licence is only in one of the bill runs', () => {
        // NOTE: In this example the licence was billed in the annual, but this is its first supplementary bill run.
        //
        // So, the service will have no credits to cancel it off and will just return it for further processing.
        it('returns the debit from the debit from it', async () => {
          const results = await FetchPreviousTransactionsService.go(
            seededData.billingAccount.id,
            seededData.licenceAnnual.id,
            seededData.toFinancialYearEnding,
            twoPartTariffFlag
          )

          expect(results).to.have.length(1)

          const expectedDebit = twoPartTariff.annualBillRun.bills[0].billLicences[0].transactions[0]

          expect(results[0]).to.equal({
            authorisedDays: expectedDebit.authorisedDays,
            billableDays: expectedDebit.billableDays,
            waterUndertaker: expectedDebit.waterUndertaker,
            chargeReferenceId: expectedDebit.chargeReferenceId,
            startDate: expectedDebit.startDate,
            endDate: expectedDebit.endDate,
            source: expectedDebit.source,
            season: expectedDebit.season,
            loss: expectedDebit.loss,
            credit: false,
            chargeType: 'standard',
            authorisedQuantity: expectedDebit.authorisedQuantity,
            billableQuantity: expectedDebit.billableQuantity,
            description: expectedDebit.description,
            volume: expectedDebit.volume,
            section126Factor: expectedDebit.section126Factor,
            section127Agreement: expectedDebit.section127Agreement,
            secondPartCharge: expectedDebit.secondPartCharge,
            scheme: expectedDebit.scheme,
            aggregateFactor: expectedDebit.aggregateFactor,
            adjustmentFactor: expectedDebit.adjustmentFactor,
            chargeCategoryCode: expectedDebit.chargeCategoryCode,
            chargeCategoryDescription: expectedDebit.chargeCategoryDescription,
            supportedSource: expectedDebit.supportedSource,
            supportedSourceName: expectedDebit.supportedSourceName,
            newLicence: expectedDebit.newLicence,
            waterCompanyCharge: expectedDebit.waterCompanyCharge,
            winterOnly: expectedDebit.winterOnly,
            purposes: expectedDebit.purposes,
            section130Agreement: expectedDebit.section130Agreement === 'true'
          })
        })
      })

      describe('but the licence has never been billed', () => {
        it('returns an empty array', async () => {
          const results = await FetchPreviousTransactionsService.go(
            seededData.billingAccount.id,
            '6d2b7db9-afee-4af2-8916-88c23dd9807d',
            seededData.toFinancialYearEnding,
            twoPartTariffFlag
          )

          expect(results).to.have.length(0)
        })
      })
    })

    describe('and the billing account has no previous bills', () => {
      it('returns an empty array', async () => {
        const results = await FetchPreviousTransactionsService.go(
          'c772d96a-7e99-4f37-8fbd-414828e42ac4',
          '6d2b7db9-afee-4af2-8916-88c23dd9807d',
          seededData.toFinancialYearEnding,
          twoPartTariffFlag
        )

        expect(results).to.have.length(0)
      })
    })
  })

  // const chargeCategoryCode = '4.3.1'
  // const financialYearEnding = 2023

  // let accountNumber
  // let billingAccountId
  // let billRunSetupValues
  // let licenceId
  // let licenceRef
  // let twoPartTariff

  // beforeEach(async () => {
  //   accountNumber = BillingAccountHelper.generateAccountNumber()
  //   billingAccountId = generateUUID()
  //   licenceId = generateUUID()
  //   licenceRef = LicenceHelper.generateLicenceRef()

  //   billRunSetupValues = { billingAccountId, accountNumber, licenceId, licenceRef }
  // })

  // describe('when there are no transactions', () => {
  //   it('returns no results', async () => {
  //     const result = await FetchPreviousTransactionsService.go(billingAccountId, licenceId, financialYearEnding)

  //     expect(result).to.be.empty()
  //   })
  // })

  // describe('when there is a bill run', () => {
  //   describe('for the same licence and billing account', () => {
  //     beforeEach(async () => {
  //       const billLicenceId = await _createBillRunAndBillAndBillLicence(billRunSetupValues)

  //       await TransactionHelper.add({ billLicenceId, chargeCategoryCode })
  //     })

  //     it('returns results', async () => {
  //       const results = await FetchPreviousTransactionsService.go(billingAccountId, licenceId, financialYearEnding)

  //       expect(results).to.have.length(1)
  //       expect(results[0].credit).to.be.false()
  //     })

  //     describe('followed by another bill run for the same licence and billing account', () => {
  //       let followUpBillLicenceId

  //       beforeEach(async () => {
  //         followUpBillLicenceId = await _createBillRunAndBillAndBillLicence(billRunSetupValues)
  //       })

  //       describe('which only contains a credit', () => {
  //         describe("that matches the first bill run's debit", () => {
  //           beforeEach(async () => {
  //             await TransactionHelper.add({
  //               billLicenceId: followUpBillLicenceId,
  //               chargeCategoryCode,
  //               credit: true
  //             })
  //           })

  //           it('returns no results', async () => {
  //             const results = await FetchPreviousTransactionsService.go(
  //               billingAccountId,
  //               licenceId,
  //               financialYearEnding
  //             )

  //             expect(results).to.be.empty()
  //           })
  //         })

  //         describe("that does not match the first bill run's debit", () => {
  //           beforeEach(async () => {
  //             await TransactionHelper.add({
  //               billLicenceId: followUpBillLicenceId,
  //               billableDays: 30,
  //               chargeCategoryCode,
  //               credit: true
  //             })
  //           })

  //           it('returns the debits', async () => {
  //             const results = await FetchPreviousTransactionsService.go(
  //               billingAccountId,
  //               licenceId,
  //               financialYearEnding
  //             )

  //             expect(results).to.have.length(1)
  //             expect(results[0].credit).to.be.false()
  //           })
  //         })
  //       })

  //       describe('which contains a debit', () => {
  //         beforeEach(async () => {
  //           await TransactionHelper.add({
  //             billLicenceId: followUpBillLicenceId,
  //             description: 'follow up'
  //           })
  //         })

  //         describe("and a credit that matches the first bill run's debit", () => {
  //           beforeEach(async () => {
  //             await TransactionHelper.add({
  //               billLicenceId: followUpBillLicenceId,
  //               chargeCategoryCode,
  //               credit: true
  //             })
  //           })

  //           it('returns only the follow up debit', async () => {
  //             const results = await FetchPreviousTransactionsService.go(
  //               billingAccountId,
  //               licenceId,
  //               financialYearEnding
  //             )

  //             expect(results).to.have.length(1)
  //             expect(results[0].credit).to.be.false()
  //             expect(results[0].description).to.equal('follow up')
  //           })
  //         })

  //         describe("and a credit that does not match the first bill run's debit", () => {
  //           beforeEach(async () => {
  //             await TransactionHelper.add({
  //               billLicenceId: followUpBillLicenceId,
  //               billableDays: 30,
  //               chargeCategoryCode,
  //               credit: true
  //             })
  //           })

  //           it('returns both debits', async () => {
  //             const results = await FetchPreviousTransactionsService.go(
  //               billingAccountId,
  //               licenceId,
  //               financialYearEnding
  //             )

  //             expect(results).to.have.length(2)
  //             expect(
  //               results.every((transaction) => {
  //                 return !transaction.credit
  //               })
  //             ).to.be.true()
  //             expect(
  //               results.find((transaction) => {
  //                 return transaction.description === 'follow up'
  //               })
  //             ).to.exist()
  //           })
  //         })
  //       })
  //     })
  //   })

  //   describe('but for a different licence', () => {
  //     beforeEach(async () => {
  //       const billLicenceId = await _createBillRunAndBillAndBillLicence({
  //         ...billRunSetupValues,
  //         licenceId: '66498337-e6a6-4a2a-9fb7-e39f43410f80'
  //       })

  //       await TransactionHelper.add({ billLicenceId, chargeCategoryCode })
  //     })

  //     it('returns no results', async () => {
  //       const results = await FetchPreviousTransactionsService.go(billingAccountId, licenceId, financialYearEnding)

  //       expect(results).to.be.empty()
  //     })
  //   })

  //   describe('but for a different billing account', () => {
  //     beforeEach(async () => {
  //       const billLicenceId = await _createBillRunAndBillAndBillLicence({
  //         ...billRunSetupValues,
  //         billingAccountId: 'b0b75e7a-e80a-4c28-9ac9-33b3a850722b'
  //       })

  //       await TransactionHelper.add({ billLicenceId, chargeCategoryCode })
  //     })

  //     it('returns no results', async () => {
  //       const results = await FetchPreviousTransactionsService.go(billingAccountId, licenceId, financialYearEnding)

  //       expect(results).to.be.empty()
  //     })
  //   })
  // })
})
