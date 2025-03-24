'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const TwoPartTariffSupplementarySeeder = require('../../../support/seeders/two-part-tariff-supplementary.seeder.js')

// Thing under test
const FetchBillingAccountsService = require('../../../../app/services/bill-runs/tpt-supplementary/fetch-billing-accounts.service.js')

describe('Bill Runs - TPT Supplementary - Fetch Billing Accounts service', () => {
  let seedData

  afterEach(async () => {
    await TwoPartTariffSupplementarySeeder.zap(seedData)
  })

  describe('when there is a licence flagged for supplementary', () => {
    describe('simply because it was removed from the annual bill run for checking', () => {
      beforeEach(async () => {
        seedData = await TwoPartTariffSupplementarySeeder.seed('simple')
      })

      it('returns the applicable billing account, charge information, and review results', async () => {
        const results = await FetchBillingAccountsService.go(seedData.billRun.id, seedData.billingPeriod)

        expect(results).to.have.length(1)

        expect(results[0]).to.equal({
          id: seedData.billingAccount.id,
          accountNumber: seedData.billingAccount.accountNumber,
          chargeVersions: [
            {
              id: seedData.chargeVersion.id,
              scheme: seedData.chargeVersion.scheme,
              startDate: seedData.chargeVersion.startDate,
              endDate: seedData.chargeVersion.endDate,
              billingAccountId: seedData.chargeVersion.billingAccountId,
              status: seedData.chargeVersion.status,
              licence: {
                id: seedData.licence.id,
                licenceRef: seedData.licence.licenceRef,
                waterUndertaker: seedData.licence.waterUndertaker,
                historicalAreaCode: seedData.licence.regions.historicalAreaCode,
                regionalChargeArea: seedData.licence.regions.regionalChargeArea,
                startDate: seedData.licence.startDate,
                expiredDate: seedData.licence.expiredDate,
                lapsedDate: seedData.licence.lapsedDate,
                revokedDate: seedData.licence.revokedDate,
                region: {
                  id: seedData.region.id,
                  chargeRegionId: seedData.region.chargeRegionId
                }
              },
              chargeReferences: [
                {
                  id: seedData.chargeReference.id,
                  source: seedData.chargeReference.source,
                  loss: seedData.chargeReference.loss,
                  volume: seedData.chargeReference.volume,
                  adjustments: seedData.chargeReference.adjustments,
                  additionalCharges: seedData.chargeReference.additionalCharges,
                  description: seedData.chargeReference.description,
                  reviewChargeReferences: [
                    {
                      id: seedData.reviewChargeReference.id,
                      amendedAggregate: seedData.reviewChargeReference.amendedAggregate,
                      amendedChargeAdjustment: seedData.reviewChargeReference.amendedChargeAdjustment,
                      amendedAuthorisedVolume: seedData.reviewChargeReference.amendedAuthorisedVolume
                    }
                  ],
                  chargeCategory: {
                    id: seedData.chargeCategory.id,
                    reference: seedData.chargeCategory.reference,
                    shortDescription: seedData.chargeCategory.shortDescription
                  },
                  chargeElements: [
                    {
                      id: seedData.chargeElement.id,
                      abstractionPeriodStartDay: seedData.chargeElement.abstractionPeriodStartDay,
                      abstractionPeriodStartMonth: seedData.chargeElement.abstractionPeriodStartMonth,
                      abstractionPeriodEndDay: seedData.chargeElement.abstractionPeriodEndDay,
                      abstractionPeriodEndMonth: seedData.chargeElement.abstractionPeriodEndMonth,
                      reviewChargeElements: [
                        {
                          id: seedData.reviewChargeElement.id,
                          amendedAllocated: seedData.reviewChargeElement.amendedAllocated
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        })
      })
    })

    describe('because the billing account was updated', () => {
      beforeEach(async () => {
        seedData = await TwoPartTariffSupplementarySeeder.seed('change-billing-account')
      })

      it('returns both billing accounts, charge information, and review results for the applicable charge version', async () => {
        const results = await FetchBillingAccountsService.go(seedData.billRun.id, seedData.billingPeriod)

        expect(results).to.have.length(2)

        expect(results).to.equal([
          {
            id: seedData.billingAccountB.id,
            accountNumber: seedData.billingAccountB.accountNumber,
            chargeVersions: [
              {
                id: seedData.chargeVersionB.id,
                scheme: seedData.chargeVersionB.scheme,
                startDate: seedData.chargeVersionB.startDate,
                endDate: seedData.chargeVersionB.endDate,
                billingAccountId: seedData.chargeVersionB.billingAccountId,
                status: seedData.chargeVersionB.status,
                licence: {
                  id: seedData.licence.id,
                  licenceRef: seedData.licence.licenceRef,
                  waterUndertaker: seedData.licence.waterUndertaker,
                  historicalAreaCode: seedData.licence.regions.historicalAreaCode,
                  regionalChargeArea: seedData.licence.regions.regionalChargeArea,
                  startDate: seedData.licence.startDate,
                  expiredDate: seedData.licence.expiredDate,
                  lapsedDate: seedData.licence.lapsedDate,
                  revokedDate: seedData.licence.revokedDate,
                  region: {
                    id: seedData.region.id,
                    chargeRegionId: seedData.region.chargeRegionId
                  }
                },
                chargeReferences: [
                  {
                    id: seedData.chargeReferenceB.id,
                    source: seedData.chargeReferenceB.source,
                    loss: seedData.chargeReferenceB.loss,
                    volume: seedData.chargeReferenceB.volume,
                    adjustments: seedData.chargeReferenceB.adjustments,
                    additionalCharges: seedData.chargeReferenceB.additionalCharges,
                    description: seedData.chargeReferenceB.description,
                    reviewChargeReferences: [
                      {
                        id: seedData.reviewChargeReference.id,
                        amendedAggregate: seedData.reviewChargeReference.amendedAggregate,
                        amendedChargeAdjustment: seedData.reviewChargeReference.amendedChargeAdjustment,
                        amendedAuthorisedVolume: seedData.reviewChargeReference.amendedAuthorisedVolume
                      }
                    ],
                    chargeCategory: {
                      id: seedData.chargeCategory.id,
                      reference: seedData.chargeCategory.reference,
                      shortDescription: seedData.chargeCategory.shortDescription
                    },
                    chargeElements: [
                      {
                        id: seedData.chargeElementB.id,
                        abstractionPeriodStartDay: seedData.chargeElementB.abstractionPeriodStartDay,
                        abstractionPeriodStartMonth: seedData.chargeElementB.abstractionPeriodStartMonth,
                        abstractionPeriodEndDay: seedData.chargeElementB.abstractionPeriodEndDay,
                        abstractionPeriodEndMonth: seedData.chargeElementB.abstractionPeriodEndMonth,
                        reviewChargeElements: [
                          {
                            id: seedData.reviewChargeElement.id,
                            amendedAllocated: seedData.reviewChargeElement.amendedAllocated
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: seedData.billingAccountA.id,
            accountNumber: seedData.billingAccountA.accountNumber,
            chargeVersions: [
              {
                id: seedData.chargeVersionA.id,
                scheme: seedData.chargeVersionA.scheme,
                startDate: seedData.chargeVersionA.startDate,
                endDate: seedData.chargeVersionA.endDate,
                billingAccountId: seedData.chargeVersionA.billingAccountId,
                status: seedData.chargeVersionA.status,
                licence: {
                  id: seedData.licence.id,
                  licenceRef: seedData.licence.licenceRef,
                  waterUndertaker: seedData.licence.waterUndertaker,
                  historicalAreaCode: seedData.licence.regions.historicalAreaCode,
                  regionalChargeArea: seedData.licence.regions.regionalChargeArea,
                  startDate: seedData.licence.startDate,
                  expiredDate: seedData.licence.expiredDate,
                  lapsedDate: seedData.licence.lapsedDate,
                  revokedDate: seedData.licence.revokedDate,
                  region: {
                    id: seedData.region.id,
                    chargeRegionId: seedData.region.chargeRegionId
                  }
                },
                chargeReferences: []
              }
            ]
          }
        ])
      })
    })

    describe('because it was made non-chargeable', () => {
      beforeEach(async () => {
        seedData = await TwoPartTariffSupplementarySeeder.seed('non-chargeable')
      })

      it('returns the applicable billing account, just the chargeable charge information, but no review results', async () => {
        const results = await FetchBillingAccountsService.go(seedData.billRun.id, seedData.billingPeriod)

        expect(results).to.have.length(1)

        expect(results[0]).to.equal({
          id: seedData.billingAccount.id,
          accountNumber: seedData.billingAccount.accountNumber,
          chargeVersions: [
            {
              id: seedData.chargeVersionA.id,
              scheme: seedData.chargeVersionA.scheme,
              startDate: seedData.chargeVersionA.startDate,
              endDate: seedData.chargeVersionA.endDate,
              billingAccountId: seedData.chargeVersionA.billingAccountId,
              status: seedData.chargeVersionA.status,
              licence: {
                id: seedData.licence.id,
                licenceRef: seedData.licence.licenceRef,
                waterUndertaker: seedData.licence.waterUndertaker,
                historicalAreaCode: seedData.licence.regions.historicalAreaCode,
                regionalChargeArea: seedData.licence.regions.regionalChargeArea,
                startDate: seedData.licence.startDate,
                expiredDate: seedData.licence.expiredDate,
                lapsedDate: seedData.licence.lapsedDate,
                revokedDate: seedData.licence.revokedDate,
                region: {
                  id: seedData.region.id,
                  chargeRegionId: seedData.region.chargeRegionId
                }
              },
              chargeReferences: []
            }
          ]
        })
      })
    })

    describe('because it was made non-two-part tariff', () => {
      beforeEach(async () => {
        seedData = await TwoPartTariffSupplementarySeeder.seed('non-two-part-tariff')
      })

      it('returns the applicable billing account, both sets of charge information, but no review results', async () => {
        const results = await FetchBillingAccountsService.go(seedData.billRun.id, seedData.billingPeriod)

        expect(results).to.have.length(1)

        expect(results[0]).to.equal({
          id: seedData.billingAccount.id,
          accountNumber: seedData.billingAccount.accountNumber,
          chargeVersions: [
            {
              id: seedData.chargeVersionA.id,
              scheme: seedData.chargeVersionA.scheme,
              startDate: seedData.chargeVersionA.startDate,
              endDate: seedData.chargeVersionA.endDate,
              billingAccountId: seedData.chargeVersionA.billingAccountId,
              status: seedData.chargeVersionA.status,
              licence: {
                id: seedData.licence.id,
                licenceRef: seedData.licence.licenceRef,
                waterUndertaker: seedData.licence.waterUndertaker,
                historicalAreaCode: seedData.licence.regions.historicalAreaCode,
                regionalChargeArea: seedData.licence.regions.regionalChargeArea,
                startDate: seedData.licence.startDate,
                expiredDate: seedData.licence.expiredDate,
                lapsedDate: seedData.licence.lapsedDate,
                revokedDate: seedData.licence.revokedDate,
                region: {
                  id: seedData.region.id,
                  chargeRegionId: seedData.region.chargeRegionId
                }
              },
              chargeReferences: []
            },
            {
              id: seedData.chargeVersionB.id,
              scheme: seedData.chargeVersionB.scheme,
              startDate: seedData.chargeVersionB.startDate,
              endDate: seedData.chargeVersionB.endDate,
              billingAccountId: seedData.chargeVersionB.billingAccountId,
              status: seedData.chargeVersionB.status,
              licence: {
                id: seedData.licence.id,
                licenceRef: seedData.licence.licenceRef,
                waterUndertaker: seedData.licence.waterUndertaker,
                historicalAreaCode: seedData.licence.regions.historicalAreaCode,
                regionalChargeArea: seedData.licence.regions.regionalChargeArea,
                startDate: seedData.licence.startDate,
                expiredDate: seedData.licence.expiredDate,
                lapsedDate: seedData.licence.lapsedDate,
                revokedDate: seedData.licence.revokedDate,
                region: {
                  id: seedData.region.id,
                  chargeRegionId: seedData.region.chargeRegionId
                }
              },
              chargeReferences: []
            }
          ]
        })
      })
    })
  })

  describe('when there is a licence flagged multiple times for supplementary', () => {
    beforeEach(async () => {
      seedData = await TwoPartTariffSupplementarySeeder.seed('duplicate')
    })

    it('does not duplicate the results', async () => {
      const results = await FetchBillingAccountsService.go(seedData.billRun.id, seedData.billingPeriod)
      // console.dir(results, { depth: null, colors: true })

      expect(results).to.have.length(1)

      expect(results[0]).to.equal({
        id: seedData.billingAccount.id,
        accountNumber: seedData.billingAccount.accountNumber,
        chargeVersions: [
          {
            id: seedData.chargeVersion.id,
            scheme: 'sroc',
            startDate: seedData.chargeVersion.startDate,
            endDate: seedData.chargeVersion.endDate,
            billingAccountId: seedData.chargeVersion.billingAccountId,
            status: seedData.chargeVersion.status,
            licence: {
              id: seedData.licence.id,
              licenceRef: seedData.licence.licenceRef,
              waterUndertaker: seedData.licence.waterUndertaker,
              historicalAreaCode: seedData.licence.regions.historicalAreaCode,
              regionalChargeArea: seedData.licence.regions.regionalChargeArea,
              startDate: seedData.licence.startDate,
              expiredDate: seedData.licence.expiredDate,
              lapsedDate: seedData.licence.lapsedDate,
              revokedDate: seedData.licence.revokedDate,
              region: {
                id: seedData.region.id,
                chargeRegionId: seedData.region.chargeRegionId
              }
            },
            chargeReferences: [
              {
                id: seedData.chargeReference.id,
                source: seedData.chargeReference.source,
                loss: seedData.chargeReference.loss,
                volume: seedData.chargeReference.volume,
                adjustments: seedData.chargeReference.adjustments,
                additionalCharges: seedData.chargeReference.additionalCharges,
                description: seedData.chargeReference.description,
                reviewChargeReferences: [
                  {
                    id: seedData.reviewChargeReference.id,
                    amendedAggregate: seedData.reviewChargeReference.amendedAggregate,
                    amendedChargeAdjustment: seedData.reviewChargeReference.amendedChargeAdjustment,
                    amendedAuthorisedVolume: seedData.reviewChargeReference.amendedAuthorisedVolume
                  }
                ],
                chargeCategory: {
                  id: seedData.chargeCategory.id,
                  reference: seedData.chargeCategory.reference,
                  shortDescription: seedData.chargeCategory.shortDescription
                },
                chargeElements: [
                  {
                    id: seedData.chargeElement.id,
                    abstractionPeriodStartDay: seedData.chargeElement.abstractionPeriodStartDay,
                    abstractionPeriodStartMonth: seedData.chargeElement.abstractionPeriodStartMonth,
                    abstractionPeriodEndDay: seedData.chargeElement.abstractionPeriodEndDay,
                    abstractionPeriodEndMonth: seedData.chargeElement.abstractionPeriodEndMonth,
                    reviewChargeElements: [
                      {
                        id: seedData.reviewChargeElement.id,
                        amendedAllocated: seedData.reviewChargeElement.amendedAllocated
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      })
    })
  })

  // describe('when there are billing accounts that are linked to the bill run', () => {
  //   it('returns the applicable billing accounts', async () => {
  //     const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

  //     expect(results).to.have.length(1)

  //     expect(results[0].id).to.equal(billingAccount1A.id)
  //     expect(results[0].accountNumber).to.equal(billingAccount1A.accountNumber)
  //   })

  //   describe('and each billing account', () => {
  //     describe('for the charge versions property', () => {
  //       it('returns the applicable charge versions', async () => {
  //         const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

  //         expect(results[0].chargeVersions).to.have.length(2)

  //         const [tptChargeVersionResult, nonTptChargeVersionResult] = results[0].chargeVersions

  //         expect(tptChargeVersionResult.id).to.equal(chargeVersion1B.id)
  //         expect(tptChargeVersionResult.scheme).to.equal('sroc')
  //         expect(tptChargeVersionResult.startDate).to.equal(new Date('2023-04-01'))
  //         expect(tptChargeVersionResult.endDate).to.equal(new Date('2023-09-30'))
  //         expect(tptChargeVersionResult.billingAccountId).to.equal(billingAccount1A.id)
  //         expect(tptChargeVersionResult.status).to.equal('current')

  //         expect(nonTptChargeVersionResult.id).to.equal(chargeVersion1C.id)
  //         expect(nonTptChargeVersionResult.scheme).to.equal('sroc')
  //         expect(nonTptChargeVersionResult.startDate).to.equal(new Date('2023-10-01'))
  //         expect(nonTptChargeVersionResult.endDate).to.be.null()
  //         expect(nonTptChargeVersionResult.billingAccountId).to.equal(billingAccount1A.id)
  //         expect(nonTptChargeVersionResult.status).to.equal('current')
  //       })
  //     })

  //     describe('and against each charge version', () => {
  //       it('includes the licence', async () => {
  //         const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

  //         let licence = results[0].chargeVersions[0].licence

  //         expect(licence.id).to.equal(licence.id)
  //         expect(licence.licenceRef).to.equal(licence.licenceRef)
  //         expect(licence.waterUndertaker).to.equal(false)
  //         expect(licence.historicalAreaCode).to.equal('SAAR')
  //         expect(licence.regionalChargeArea).to.equal('Southern')
  //         expect(licence.region).to.equal({
  //           id: region.id,
  //           chargeRegionId: region.chargeRegionId
  //         })

  //         licence = results[0].chargeVersions[1].licence

  //         expect(licence.id).to.equal(licence.id)
  //         expect(licence.licenceRef).to.equal(licence.licenceRef)
  //         expect(licence.waterUndertaker).to.equal(false)
  //         expect(licence.historicalAreaCode).to.equal('SAAR')
  //         expect(licence.regionalChargeArea).to.equal('Southern')
  //         expect(licence.region).to.equal({
  //           id: region.id,
  //           chargeRegionId: region.chargeRegionId
  //         })
  //       })

  //       describe('and when the charge version is two-part tariff (been through match & allocate)', () => {
  //         it('includes the applicable charge references', async () => {
  //           const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

  //           const { chargeReferences } = results[0].chargeVersions[0]

  //           expect(chargeReferences[0].id).to.equal(chargeReference1B.id)
  //           expect(chargeReferences[0].source).to.equal('non-tidal')
  //           expect(chargeReferences[0].loss).to.equal('low')
  //           expect(chargeReferences[0].volume).to.equal(6.819)
  //           expect(chargeReferences[0].adjustments).to.equal({
  //             s126: null,
  //             s127: true,
  //             s130: false,
  //             charge: null,
  //             winter: false,
  //             aggregate: 0.562114443
  //           })
  //           expect(chargeReferences[0].additionalCharges).to.equal({ isSupplyPublicWater: true })
  //           expect(chargeReferences[0].description).to.equal('Mineral washing')
  //         })

  //         describe('and against each charge reference', () => {
  //           it('includes the charge category', async () => {
  //             const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

  //             const { chargeCategory: result } = results[0].chargeVersions[0].chargeReferences[0]

  //             expect(result.id).to.equal(chargeCategory.id)
  //             expect(result.reference).to.equal(chargeCategory.reference)
  //             expect(result.shortDescription).to.equal(chargeCategory.shortDescription)
  //           })

  //           it('includes the review charge references', async () => {
  //             const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

  //             const { reviewChargeReferences: result } = results[0].chargeVersions[0].chargeReferences[0]

  //             expect(result[0].id).to.equal(reviewChargeReference1B.id)
  //             expect(result[0].amendedAggregate).to.equal(reviewChargeReference1B.amendedAggregate)
  //             expect(result[0].amendedChargeAdjustment).to.equal(reviewChargeReference1B.amendedChargeAdjustment)
  //             expect(result[0].amendedAuthorisedVolume).to.equal(reviewChargeReference1B.amendedAuthorisedVolume)
  //           })

  //           it('includes the charge elements', async () => {
  //             const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

  //             const { chargeElements: result } = results[0].chargeVersions[0].chargeReferences[0]

  //             expect(result[0].id).to.equal(chargeElement1B.id)
  //             expect(result[0].abstractionPeriodStartDay).to.equal(chargeElement1B.abstractionPeriodStartDay)
  //             expect(result[0].abstractionPeriodStartMonth).to.equal(chargeElement1B.abstractionPeriodStartMonth)
  //             expect(result[0].abstractionPeriodEndDay).to.equal(chargeElement1B.abstractionPeriodEndDay)
  //             expect(result[0].abstractionPeriodEndMonth).to.equal(chargeElement1B.abstractionPeriodEndMonth)
  //           })

  //           describe('and against each charge element', () => {
  //             it('includes the review charge elements', async () => {
  //               const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

  //               const { reviewChargeElements: result } =
  //                 results[0].chargeVersions[0].chargeReferences[0].chargeElements[0]

  //               expect(result[0].id).to.equal(reviewChargeElement1B.id)
  //               expect(result[0].amendedAllocated).to.equal(reviewChargeElement1B.amendedAllocated)
  //             })
  //           })
  //         })
  //       })

  //       describe('and when the charge version is not two-part tariff (not been through match & allocate)', () => {
  //         it('does not include any charge references', async () => {
  //           const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

  //           const { chargeReferences } = results[0].chargeVersions[1]

  //           expect(chargeReferences).to.be.empty()
  //         })
  //       })
  //     })
  //   })
  // })

  // describe('when there is a billing account linked to the bill run which has non-chargeable licences', () => {
  //   describe('as well as chargeable licences (billing account found by both services)', () => {
  //     it('merges the billing account record into one result', async () => {
  //       const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

  //       expect(results).to.have.length(1)

  //       expect(results[0].id).to.equal(billingAccount1A.id)
  //       expect(results[0].accountNumber).to.equal(billingAccount1A.accountNumber)

  //       expect(results[0].chargeVersions).to.have.length(3)

  //       // The TPT charge version
  //       expect(results[0].chargeVersions[0].id).to.equal(chargeVersion1B.id)
  //       expect(results[0].chargeVersions[0].licence.id).to.equal(licence1.id)
  //       expect(results[0].chargeVersions[0].licence.licenceRef).to.equal(licence1.licenceRef)

  //       // The non-TPT charge version
  //       expect(results[0].chargeVersions[1].id).to.equal(chargeVersion1C.id)
  //       expect(results[0].chargeVersions[1].licence.id).to.equal(licence1.id)
  //       expect(results[0].chargeVersions[1].licence.licenceRef).to.equal(licence1.licenceRef)

  //       // The non-chargeable charge version
  //       expect(results[0].chargeVersions[2].licence.id).to.equal(
  //         nonChargeableMergedBillingAccount.chargeVersions[0].licence.id
  //       )
  //       expect(results[0].chargeVersions[2].licence.licenceRef).to.equal(
  //         nonChargeableMergedBillingAccount.chargeVersions[0].licence.licenceRef
  //       )
  //     })
  //   })

  //   describe('but no chargeable licences (billing account only found by FetchNonChargeableBillingAccounts)', () => {
  //     it('adds the billing account record to the results', async () => {
  //       const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

  //       expect(results).to.have.length(2)

  //       // Billing account found by this service
  //       expect(results[0].id).to.equal(billingAccount1A.id)
  //       expect(results[0].accountNumber).to.equal(billingAccount1A.accountNumber)

  //       expect(results[0].chargeVersions).to.have.length(2)

  //       // The TPT charge version
  //       expect(results[0].chargeVersions[0].id).to.equal(chargeVersion1B.id)
  //       expect(results[0].chargeVersions[0].licence.id).to.equal(licence1.id)
  //       expect(results[0].chargeVersions[0].licence.licenceRef).to.equal(licence1.licenceRef)

  //       // The non-TPT charge version
  //       expect(results[0].chargeVersions[1].id).to.equal(chargeVersion1C.id)
  //       expect(results[0].chargeVersions[1].licence.id).to.equal(licence1.id)
  //       expect(results[0].chargeVersions[1].licence.licenceRef).to.equal(licence1.licenceRef)

  //       // Billing account found by FetchNonChargeableBillingAccounts
  //       expect(results[1].id).to.equal(nonChargeableNewBillingAccount.id)
  //       expect(results[1].accountNumber).to.equal(nonChargeableNewBillingAccount.accountNumber)

  //       expect(results[1].chargeVersions).to.have.length(1)

  //       expect(results[1].chargeVersions[0].licence.id).to.equal(
  //         nonChargeableNewBillingAccount.chargeVersions[0].licence.id
  //       )
  //       expect(results[1].chargeVersions[0].licence.licenceRef).to.equal(
  //         nonChargeableNewBillingAccount.chargeVersions[0].licence.licenceRef
  //       )
  //     })
  //   })
  // })

  // describe('when there are billing accounts not linked to the bill run', () => {
  //   it('does not include them in the results', async () => {
  //     const results = await FetchBillingAccountsService.go(billRun.id, billingPeriod)

  //     expect(results).to.have.length(1)

  //     expect(results[0].id).not.to.equal(billingAccountNotInBillRun.id)
  //   })
  // })

  describe('when there are no billing accounts at all (no results)', () => {
    it('returns no results', async () => {
      const results = await FetchBillingAccountsService.go(
        '1c1f7af5-9cba-47a7-8fc4-2c03b0d1124d',
        seedData.billingPeriod
      )

      expect(results).to.be.empty()
    })
  })
})
