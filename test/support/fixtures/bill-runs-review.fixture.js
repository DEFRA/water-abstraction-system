import BillingAccountModel from 'water-abstraction-engine/models/billing-account.model.js'

/**
 * Represents a complete response from `FetchRemoveReviewLicenceService`
 *
 * @returns {object}
 */
function removeReviewLicence() {
  return {
    billRun: {
      batchType: 'two_part_tariff',
      billRunNumber: 10001,
      createdAt: new Date('2024-10-22'),
      id: '287aeb25-cf11-429d-8c6f-f98f06db021d',
      region: {
        displayName: 'Test Region',
        id: '4ccf3c5b-ab4e-48e1-afa8-3b18b5d07fab'
      },
      status: 'review',
      toFinancialYearEnding: 2024
    },
    id: 'bb779166-0576-4581-b504-edbc0227d763',
    licenceId: '32416c67-f755-4c3f-8816-ecde0ee596bd',
    licenceRef: '1/11/11/*11/1111'
  }
}

/**
 * Represents a complete response from `FetchReviewChargeElementService`
 *
 * @returns {object}
 */
function reviewChargeElement() {
  return {
    amendedAllocated: 0,
    chargeElement: {
      abstractionPeriodEndDay: 30,
      abstractionPeriodEndMonth: 9,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 4,
      authorisedAnnualQuantity: 9.092,
      description: 'Spray Irrigation - Direct',
      id: 'dd050414-9c58-4a40-a114-77853f2fe6d2'
    },
    id: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1',
    issues: 'Aggregate',
    reviewChargeReference: {
      amendedAuthorisedVolume: 9.092,
      id: '6c70461b-3f83-47b1-9538-8305e82b34eb',
      reviewChargeElements: [{ id: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1' }],
      reviewChargeVersion: {
        chargePeriodEndDate: new Date('2024-03-31'),
        chargePeriodStartDate: new Date('2023-04-01'),
        id: 'a71c386c-d9b8-4915-a508-74fb1508c071',
        reviewLicence: {
          billRun: {
            id: '287aeb25-cf11-429d-8c6f-f98f06db021d',
            toFinancialYearEnding: 2024
          },
          id: 'bb779166-0576-4581-b504-edbc0227d763',
          licenceId: '32416c67-f755-4c3f-8816-ecde0ee596bd'
        }
      }
    },
    reviewReturns: [
      {
        allocated: 0,
        description: 'Test Road. Points 1 and 2.',
        endDate: new Date('2023-10-31'),
        id: 'e3f64190-6a58-40af-8648-23c71ad1726f',
        issues: '',
        purposes: [
          {
            primary: { code: 'A', description: 'Agriculture' },
            secondary: { code: 'AGR', description: 'General Agriculture' },
            tertiary: { code: '400', description: 'Spray Irrigation - Direct' }
          }
        ],
        quantity: 0,
        returnId: 'v1:5:1/11/11/*11/1111:11142960:2022-11-01:2023-10-31',
        returnLog: {
          id: 'e0e3957d-ab75-4a49-bb04-36a332053448',
          periodEndDay: 30,
          periodEndMonth: 9,
          periodStartDay: 1,
          periodStartMonth: 4,
          returnId: 'v1:5:1/11/11/*11/1111:11142960:2022-11-01:2023-10-31'
        },
        returnLogId: 'e0e3957d-ab75-4a49-bb04-36a332053448',
        returnReference: '11142960',
        returnStatus: 'completed',
        startDate: new Date('2022-11-01'),
        underQuery: false
      }
    ],
    status: 'review'
  }
}

/**
 * Represents a complete response from `FetchReviewChargeReferenceService`
 *
 * @returns {object}
 */
function reviewChargeReference() {
  return {
    abatementAgreement: 1,
    aggregate: 0.333333333,
    amendedAggregate: 0.333333333,
    amendedAuthorisedVolume: 9.092,
    amendedChargeAdjustment: 1,
    canalAndRiverTrustAgreement: false,
    chargeAdjustment: 1,
    chargeReference: {
      chargeCategory: {
        id: '9f194aa2-562d-4e89-a0ce-d4a31b5833b1',
        reference: '4.6.5',
        shortDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model'
      },
      chargeCategoryId: '9f194aa2-562d-4e89-a0ce-d4a31b5833b1',
      id: 'fc493c81-5003-4dc0-9d48-4b5bf4af9c1e',
      loss: 'high',
      supportedSourceName: null,
      volume: 9.092,
      waterCompanyCharge: null
    },
    id: '6b3d11f2-d361-4eaa-bce2-5561283bd023',
    reviewChargeElements: [
      {
        amendedAllocated: 0,
        id: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1'
      }
    ],
    reviewChargeVersion: {
      chargePeriodEndDate: new Date('2024-03-31'),
      chargePeriodStartDate: new Date('2023-04-01'),
      id: 'a71c386c-d9b8-4915-a508-74fb1508c071',
      reviewLicence: {
        billRun: {
          id: '287aeb25-cf11-429d-8c6f-f98f06db021d',
          toFinancialYearEnding: 2024
        },
        id: 'bb779166-0576-4581-b504-edbc0227d763',
        licence: {
          id: '32416c67-f755-4c3f-8816-ecde0ee596bd',
          waterUndertaker: false
        }
      }
    },
    twoPartTariffAgreement: true,
    winterDiscount: false
  }
}

/**
 * Represents a complete response from `FetchReviewLicenceService`
 *
 * @returns {object}
 */
function reviewLicence() {
  return {
    billRun: {
      batchType: 'two_part_tariff',
      id: '287aeb25-cf11-429d-8c6f-f98f06db021d',
      region: {
        displayName: 'South West',
        id: '4ccf3c5b-ab4e-48e1-afa8-3b18b5d07fab'
      },
      scheme: 'sroc',
      summer: false,
      toFinancialYearEnding: 2024
    },
    billRunId: '287aeb25-cf11-429d-8c6f-f98f06db021d',
    id: 'bb779166-0576-4581-b504-edbc0227d763',
    licenceHolder: 'Licence Holder Ltd',
    licenceId: '32416c67-f755-4c3f-8816-ecde0ee596bd',
    licenceRef: '1/11/11/*11/1111',
    progress: false,
    reviewChargeVersions: [
      {
        chargePeriodEndDate: new Date('2024-03-31'),
        chargePeriodStartDate: new Date('2023-04-01'),
        chargeVersion: {
          billingAccount: BillingAccountModel.fromJson({
            accountNumber: 'E99999999A',
            billingAccountAddresses: [
              {
                address: {
                  address1: 'C/O Noel Edmonds',
                  address2: 'Crinkley Bottom',
                  address3: 'Cricket St Thomas',
                  address4: null,
                  address5: null,
                  address6: 'Somerset',
                  country: 'United Kingdom',
                  id: 'da502c5b-0214-49d5-9125-83c4ea1359e5',
                  postcode: 'TA20 1KL'
                },
                company: null,
                contact: null,
                id: 'c95c0144-db2d-48fc-9bc0-e60126f762db'
              }
            ],
            company: {
              id: '838c9770-87a8-47b6-89a4-549c8e08ed2f',
              name: 'Mr B Blobby Ltd',
              type: 'organisation'
            },
            id: 'f041c128-bb4d-4f67-8f97-e33d71d50842'
          }),
          id: '281a6820-4074-4ba8-92f1-7d1bfe63b426'
        },
        id: 'a71c386c-d9b8-4915-a508-74fb1508c071',
        reviewChargeReferences: [
          {
            aggregate: 0.333333333,
            amendedAuthorisedVolume: 9.092,
            chargeAdjustment: 1,
            chargeReference: {
              chargeCategory: {
                id: '9f194aa2-562d-4e89-a0ce-d4a31b5833b1',
                reference: '4.6.5',
                shortDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model'
              },
              id: 'fc493c81-5003-4dc0-9d48-4b5bf4af9c1e'
            },
            id: '6c70461b-3f83-47b1-9538-8305e82b34eb',
            reviewChargeElements: [
              {
                amendedAllocated: 0,
                chargeElement: {
                  abstractionPeriodEndDay: 30,
                  abstractionPeriodEndMonth: 9,
                  abstractionPeriodStartDay: 1,
                  abstractionPeriodStartMonth: 4,
                  authorisedAnnualQuantity: 9.092,
                  description: 'Spray Irrigation - Direct',
                  id: 'dd050414-9c58-4a40-a114-77853f2fe6d2',
                  purpose: {
                    description: 'Spray Irrigation - Direct',
                    id: '4ad11971-be6a-4da5-af04-563c76205b0e'
                  }
                },
                id: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1',
                issues: 'Aggregate',
                reviewReturns: [
                  {
                    id: 'e3f64190-6a58-40af-8648-23c71ad1726f',
                    quantity: 0,
                    returnReference: '10030495',
                    returnStatus: 'completed'
                  }
                ],
                status: 'review'
              }
            ]
          }
        ]
      }
    ],
    reviewReturns: [
      {
        allocated: 0,
        description: 'Test Road. Points 1 and 2.',
        endDate: new Date('2023-10-31'),
        id: 'e3f64190-6a58-40af-8648-23c71ad1726f',
        issues: '',
        purposes: [
          {
            primary: { code: 'A', description: 'Agriculture' },
            secondary: { code: 'AGR', description: 'General Agriculture' },
            tertiary: { code: '400', description: 'Spray Irrigation - Direct' }
          }
        ],
        quantity: 0,
        returnId: 'v1:5:1/11/11/*11/1111:11142960:2022-11-01:2023-10-31',
        returnLog: {
          id: 'b22626c5-db4e-450e-9897-b615d605b110',
          periodEndDay: 30,
          periodEndMonth: 9,
          periodStartDay: 1,
          periodStartMonth: 4,
          returnId: 'v1:5:1/11/11/*11/1111:11142960:2022-11-01:2023-10-31'
        },
        returnLogId: 'b22626c5-db4e-450e-9897-b615d605b110',
        returnReference: '11142960',
        returnStatus: 'completed',
        reviewChargeElements: [
          {
            allocated: 0,
            amendedAllocated: 0,
            chargeDatesOverlap: false,
            chargeElementId: 'dd050414-9c58-4a40-a114-77853f2fe6d2',
            createdAt: new Date('2024-10-22'),
            id: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1',
            issues: 'Aggregate',
            reviewChargeReferenceId: '6c70461b-3f83-47b1-9538-8305e82b34eb',
            status: 'review',
            updatedAt: new Date('2024-10-22')
          }
        ],
        startDate: new Date('2022-11-01'),
        underQuery: false
      },
      {
        allocated: 0,
        description: 'Lost Road. Points 1 and 2.',
        endDate: new Date('2023-10-31'),
        id: '4864f643-5c16-5ca9-8512-f63e1d4e58be',
        issues: '',
        purposes: [
          {
            primary: { code: 'A', description: 'Agriculture' },
            secondary: { code: 'AGR', description: 'General Agriculture' },
            tertiary: { code: '420', description: 'Spray Irrigation - Storage' }
          }
        ],
        quantity: 0,
        returnId: 'v1:5:1/11/11/*11/1111:11142961:2022-11-01:2023-10-31',
        returnLog: {
          id: '41d6c667-16d6-4a1e-b0e2-9e9cf52d3325',
          periodEndDay: 30,
          periodEndMonth: 9,
          periodStartDay: 1,
          periodStartMonth: 4,
          returnId: 'v1:5:1/11/11/*11/1111:11142961:2022-11-01:2023-10-31'
        },
        returnLogId: '41d6c667-16d6-4a1e-b0e2-9e9cf52d3325',
        returnReference: '11142961',
        returnStatus: 'completed',
        reviewChargeElements: [],
        startDate: new Date('2022-11-01'),
        underQuery: false
      }
    ],
    status: 'review'
  }
}

export default {
  removeReviewLicence,
  reviewChargeElement,
  reviewChargeReference,
  reviewLicence
}
