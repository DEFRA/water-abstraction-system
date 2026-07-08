// Test helpers
import * as TwoPartTariffSupplementarySeeder from '../../../support/seeders/two-part-tariff-supplementary.seeder.js'

// Thing under test
import FetchBillingAccountsService from '../../../../app/services/bill-runs/tpt-supplementary/fetch-billing-accounts.service.js'

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
        const results = await FetchBillingAccountsService(seedData.billRun.id, seedData.billingPeriod)

        expect(results).toHaveLength(1)

        expect(results[0]).toEqual({
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
        const results = await FetchBillingAccountsService(seedData.billRun.id, seedData.billingPeriod)

        expect(results).toHaveLength(2)

        expect(results).toEqual([
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
        const results = await FetchBillingAccountsService(seedData.billRun.id, seedData.billingPeriod)

        expect(results).toHaveLength(1)

        expect(results[0]).toEqual({
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
        const results = await FetchBillingAccountsService(seedData.billRun.id, seedData.billingPeriod)

        expect(results).toHaveLength(1)

        expect(results[0]).toEqual({
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
      const results = await FetchBillingAccountsService(seedData.billRun.id, seedData.billingPeriod)

      expect(results).toHaveLength(1)

      expect(results[0]).toEqual({
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
  //     const results = await FetchBillingAccountsService(billRun.id, billingPeriod)

  //     expect(results).toHaveLength(1)

  //     expect(results[0].id).toEqual(billingAccount1A.id)
  //     expect(results[0].accountNumber).toEqual(billingAccount1A.accountNumber)
  //   })

  //   describe('and each billing account', () => {
  //     describe('for the charge versions property', () => {
  //       it('returns the applicable charge versions', async () => {
  //         const results = await FetchBillingAccountsService(billRun.id, billingPeriod)

  //         expect(results[0].chargeVersions).toHaveLength(2)

  //         const [tptChargeVersionResult, nonTptChargeVersionResult] = results[0].chargeVersions

  //         expect(tptChargeVersionResult.id).toEqual(chargeVersion1B.id)
  //         expect(tptChargeVersionResult.scheme).toEqual('sroc')
  //         expect(tptChargeVersionResult.startDate).toEqual(new Date('2023-04-01'))
  //         expect(tptChargeVersionResult.endDate).toEqual(new Date('2023-09-30'))
  //         expect(tptChargeVersionResult.billingAccountId).toEqual(billingAccount1A.id)
  //         expect(tptChargeVersionResult.status).toEqual('current')

  //         expect(nonTptChargeVersionResult.id).toEqual(chargeVersion1C.id)
  //         expect(nonTptChargeVersionResult.scheme).toEqual('sroc')
  //         expect(nonTptChargeVersionResult.startDate).toEqual(new Date('2023-10-01'))
  //         expect(nonTptChargeVersionResult.endDate).toBeNull()
  //         expect(nonTptChargeVersionResult.billingAccountId).toEqual(billingAccount1A.id)
  //         expect(nonTptChargeVersionResult.status).toEqual('current')
  //       })
  //     })

  //     describe('and against each charge version', () => {
  //       it('includes the licence', async () => {
  //         const results = await FetchBillingAccountsService(billRun.id, billingPeriod)

  //         let licence = results[0].chargeVersions[0].licence

  //         expect(licence.id).toEqual(licence.id)
  //         expect(licence.licenceRef).toEqual(licence.licenceRef)
  //         expect(licence.waterUndertaker).toEqual(false)
  //         expect(licence.historicalAreaCode).toEqual('SAAR')
  //         expect(licence.regionalChargeArea).toEqual('Southern')
  //         expect(licence.region).toEqual({
  //           id: region.id,
  //           chargeRegionId: region.chargeRegionId
  //         })

  //         licence = results[0].chargeVersions[1].licence

  //         expect(licence.id).toEqual(licence.id)
  //         expect(licence.licenceRef).toEqual(licence.licenceRef)
  //         expect(licence.waterUndertaker).toEqual(false)
  //         expect(licence.historicalAreaCode).toEqual('SAAR')
  //         expect(licence.regionalChargeArea).toEqual('Southern')
  //         expect(licence.region).toEqual({
  //           id: region.id,
  //           chargeRegionId: region.chargeRegionId
  //         })
  //       })

  //       describe('and when the charge version is two-part tariff (been through match & allocate)', () => {
  //         it('includes the applicable charge references', async () => {
  //           const results = await FetchBillingAccountsService(billRun.id, billingPeriod)

  //           const { chargeReferences } = results[0].chargeVersions[0]

  //           expect(chargeReferences[0].id).toEqual(chargeReference1B.id)
  //           expect(chargeReferences[0].source).toEqual('non-tidal')
  //           expect(chargeReferences[0].loss).toEqual('low')
  //           expect(chargeReferences[0].volume).toEqual(6.819)
  //           expect(chargeReferences[0].adjustments).toEqual({
  //             s126: null,
  //             s127: true,
  //             s130: false,
  //             charge: null,
  //             winter: false,
  //             aggregate: 0.562114443
  //           })
  //           expect(chargeReferences[0].additionalCharges).toEqual({ isSupplyPublicWater: true })
  //           expect(chargeReferences[0].description).toEqual('Mineral washing')
  //         })

  //         describe('and against each charge reference', () => {
  //           it('includes the charge category', async () => {
  //             const results = await FetchBillingAccountsService(billRun.id, billingPeriod)

  //             const { chargeCategory: result } = results[0].chargeVersions[0].chargeReferences[0]

  //             expect(result.id).toEqual(chargeCategory.id)
  //             expect(result.reference).toEqual(chargeCategory.reference)
  //             expect(result.shortDescription).toEqual(chargeCategory.shortDescription)
  //           })

  //           it('includes the review charge references', async () => {
  //             const results = await FetchBillingAccountsService(billRun.id, billingPeriod)

  //             const { reviewChargeReferences: result } = results[0].chargeVersions[0].chargeReferences[0]

  //             expect(result[0].id).toEqual(reviewChargeReference1B.id)
  //             expect(result[0].amendedAggregate).toEqual(reviewChargeReference1B.amendedAggregate)
  //             expect(result[0].amendedChargeAdjustment).toEqual(reviewChargeReference1B.amendedChargeAdjustment)
  //             expect(result[0].amendedAuthorisedVolume).toEqual(reviewChargeReference1B.amendedAuthorisedVolume)
  //           })

  //           it('includes the charge elements', async () => {
  //             const results = await FetchBillingAccountsService(billRun.id, billingPeriod)

  //             const { chargeElements: result } = results[0].chargeVersions[0].chargeReferences[0]

  //             expect(result[0].id).toEqual(chargeElement1B.id)
  //             expect(result[0].abstractionPeriodStartDay).toEqual(chargeElement1B.abstractionPeriodStartDay)
  //             expect(result[0].abstractionPeriodStartMonth).toEqual(chargeElement1B.abstractionPeriodStartMonth)
  //             expect(result[0].abstractionPeriodEndDay).toEqual(chargeElement1B.abstractionPeriodEndDay)
  //             expect(result[0].abstractionPeriodEndMonth).toEqual(chargeElement1B.abstractionPeriodEndMonth)
  //           })

  //           describe('and against each charge element', () => {
  //             it('includes the review charge elements', async () => {
  //               const results = await FetchBillingAccountsService(billRun.id, billingPeriod)

  //               const { reviewChargeElements: result } =
  //                 results[0].chargeVersions[0].chargeReferences[0].chargeElements[0]

  //               expect(result[0].id).toEqual(reviewChargeElement1B.id)
  //               expect(result[0].amendedAllocated).toEqual(reviewChargeElement1B.amendedAllocated)
  //             })
  //           })
  //         })
  //       })

  //       describe('and when the charge version is not two-part tariff (not been through match & allocate)', () => {
  //         it('does not include any charge references', async () => {
  //           const results = await FetchBillingAccountsService(billRun.id, billingPeriod)

  //           const { chargeReferences } = results[0].chargeVersions[1]

  //           expect(chargeReferences).toHaveLength(0)
  //         })
  //       })
  //     })
  //   })
  // })

  // describe('when there is a billing account linked to the bill run which has non-chargeable licences', () => {
  //   describe('as well as chargeable licences (billing account found by both services)', () => {
  //     it('merges the billing account record into one result', async () => {
  //       const results = await FetchBillingAccountsService(billRun.id, billingPeriod)

  //       expect(results).toHaveLength(1)

  //       expect(results[0].id).toEqual(billingAccount1A.id)
  //       expect(results[0].accountNumber).toEqual(billingAccount1A.accountNumber)

  //       expect(results[0].chargeVersions).toHaveLength(3)

  //       // The TPT charge version
  //       expect(results[0].chargeVersions[0].id).toEqual(chargeVersion1B.id)
  //       expect(results[0].chargeVersions[0].licence.id).toEqual(licence1.id)
  //       expect(results[0].chargeVersions[0].licence.licenceRef).toEqual(licence1.licenceRef)

  //       // The non-TPT charge version
  //       expect(results[0].chargeVersions[1].id).toEqual(chargeVersion1C.id)
  //       expect(results[0].chargeVersions[1].licence.id).toEqual(licence1.id)
  //       expect(results[0].chargeVersions[1].licence.licenceRef).toEqual(licence1.licenceRef)

  //       // The non-chargeable charge version
  //       expect(results[0].chargeVersions[2].licence.id).toEqual(
  //         nonChargeableMergedBillingAccount.chargeVersions[0].licence.id
  //       )
  //       expect(results[0].chargeVersions[2].licence.licenceRef).toEqual(
  //         nonChargeableMergedBillingAccount.chargeVersions[0].licence.licenceRef
  //       )
  //     })
  //   })

  //   describe('but no chargeable licences (billing account only found by FetchNonChargeableBillingAccounts)', () => {
  //     it('adds the billing account record to the results', async () => {
  //       const results = await FetchBillingAccountsService(billRun.id, billingPeriod)

  //       expect(results).toHaveLength(2)

  //       // Billing account found by this service
  //       expect(results[0].id).toEqual(billingAccount1A.id)
  //       expect(results[0].accountNumber).toEqual(billingAccount1A.accountNumber)

  //       expect(results[0].chargeVersions).toHaveLength(2)

  //       // The TPT charge version
  //       expect(results[0].chargeVersions[0].id).toEqual(chargeVersion1B.id)
  //       expect(results[0].chargeVersions[0].licence.id).toEqual(licence1.id)
  //       expect(results[0].chargeVersions[0].licence.licenceRef).toEqual(licence1.licenceRef)

  //       // The non-TPT charge version
  //       expect(results[0].chargeVersions[1].id).toEqual(chargeVersion1C.id)
  //       expect(results[0].chargeVersions[1].licence.id).toEqual(licence1.id)
  //       expect(results[0].chargeVersions[1].licence.licenceRef).toEqual(licence1.licenceRef)

  //       // Billing account found by FetchNonChargeableBillingAccounts
  //       expect(results[1].id).toEqual(nonChargeableNewBillingAccount.id)
  //       expect(results[1].accountNumber).toEqual(nonChargeableNewBillingAccount.accountNumber)

  //       expect(results[1].chargeVersions).toHaveLength(1)

  //       expect(results[1].chargeVersions[0].licence.id).toEqual(
  //         nonChargeableNewBillingAccount.chargeVersions[0].licence.id
  //       )
  //       expect(results[1].chargeVersions[0].licence.licenceRef).toEqual(
  //         nonChargeableNewBillingAccount.chargeVersions[0].licence.licenceRef
  //       )
  //     })
  //   })
  // })

  // describe('when there are billing accounts not linked to the bill run', () => {
  //   it('does not include them in the results', async () => {
  //     const results = await FetchBillingAccountsService(billRun.id, billingPeriod)

  //     expect(results).toHaveLength(1)

  //     expect(results[0].id).not.toEqual(billingAccountNotInBillRun.id)
  //   })
  // })

  describe('when there are no billing accounts at all (no results)', () => {
    it('returns no results', async () => {
      const results = await FetchBillingAccountsService('1c1f7af5-9cba-47a7-8fc4-2c03b0d1124d', seedData.billingPeriod)

      expect(results).toHaveLength(0)
    })
  })
})
