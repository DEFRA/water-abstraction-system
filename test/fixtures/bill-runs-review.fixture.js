'use strict'

const BillingAccountModel = require('../../app/models/billing-account.model.js')

/**
 * Represents a complete response from `FetchRemoveReviewLicenceService`
 *
 * @returns {object}
 */
function removeReviewLicence() {
  return {
    id: 'bb779166-0576-4581-b504-edbc0227d763',
    licenceId: '32416c67-f755-4c3f-8816-ecde0ee596bd',
    licenceRef: '1/11/11/*11/1111',
    billRun: {
      id: '287aeb25-cf11-429d-8c6f-f98f06db021d',
      batchType: 'two_part_tariff',
      billRunNumber: 10001,
      createdAt: new Date('2024-10-22'),
      status: 'review',
      toFinancialYearEnding: 2024,
      region: {
        id: '4ccf3c5b-ab4e-48e1-afa8-3b18b5d07fab',
        displayName: 'Test Region'
      }
    }
  }
}

/**
 * Represents a complete response from `FetchReviewChargeElementService`
 *
 * @returns {object}
 */
function reviewChargeElement() {
  return {
    id: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1',
    amendedAllocated: 0,
    issues: 'Aggregate',
    status: 'review',
    chargeElement: {
      id: 'dd050414-9c58-4a40-a114-77853f2fe6d2',
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 4,
      abstractionPeriodEndDay: 30,
      abstractionPeriodEndMonth: 9,
      authorisedAnnualQuantity: 9.092,
      description: 'Spray Irrigation - Direct'
    },
    reviewChargeReference: {
      id: '6c70461b-3f83-47b1-9538-8305e82b34eb',
      amendedAuthorisedVolume: 9.092,
      reviewChargeElements: [{ id: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1' }],
      reviewChargeVersion: {
        id: 'a71c386c-d9b8-4915-a508-74fb1508c071',
        chargePeriodStartDate: new Date('2023-04-01'),
        chargePeriodEndDate: new Date('2024-03-31'),
        reviewLicence: {
          id: 'bb779166-0576-4581-b504-edbc0227d763',
          licenceId: '32416c67-f755-4c3f-8816-ecde0ee596bd',
          billRun: {
            id: '287aeb25-cf11-429d-8c6f-f98f06db021d',
            toFinancialYearEnding: 2024
          }
        }
      }
    },
    reviewReturns: [
      {
        id: 'e3f64190-6a58-40af-8648-23c71ad1726f',
        allocated: 0,
        description: 'Test Road. Points 1 and 2.',
        endDate: new Date('2023-10-31'),
        issues: '',
        quantity: 0,
        purposes: [
          {
            primary: { code: 'A', description: 'Agriculture' },
            tertiary: { code: '400', description: 'Spray Irrigation - Direct' },
            secondary: { code: 'AGR', description: 'General Agriculture' }
          }
        ],
        returnId: 'v1:5:1/11/11/*11/1111:11142960:2022-11-01:2023-10-31',
        returnReference: '11142960',
        returnStatus: 'completed',
        startDate: new Date('2022-11-01'),
        underQuery: false,
        returnLog: {
          id: 'v1:5:1/11/11/*11/1111:11142960:2022-11-01:2023-10-31',
          periodStartDay: 1,
          periodStartMonth: 4,
          periodEndDay: 30,
          periodEndMonth: 9,
          returnId: 'e0e3957d-ab75-4a49-bb04-36a332053448'
        }
      }
    ]
  }
}

/**
 * Represents a complete response from `FetchReviewChargeReferenceService`
 *
 * @returns {object}
 */
function reviewChargeReference() {
  return {
    id: '6b3d11f2-d361-4eaa-bce2-5561283bd023',
    abatementAgreement: 1,
    aggregate: 0.333333333,
    amendedAggregate: 0.333333333,
    amendedAuthorisedVolume: 9.092,
    amendedChargeAdjustment: 1,
    canalAndRiverTrustAgreement: false,
    chargeAdjustment: 1,
    twoPartTariffAgreement: true,
    winterDiscount: false,
    reviewChargeVersion: {
      id: 'a71c386c-d9b8-4915-a508-74fb1508c071',
      chargePeriodStartDate: new Date('2023-04-01'),
      chargePeriodEndDate: new Date('2024-03-31'),
      reviewLicence: {
        id: 'bb779166-0576-4581-b504-edbc0227d763',
        billRun: {
          id: '287aeb25-cf11-429d-8c6f-f98f06db021d',
          toFinancialYearEnding: 2024
        },
        licence: {
          id: '32416c67-f755-4c3f-8816-ecde0ee596bd',
          waterUndertaker: false
        }
      }
    },
    reviewChargeElements: [
      {
        id: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1',
        amendedAllocated: 0
      }
    ],
    chargeReference: {
      id: 'fc493c81-5003-4dc0-9d48-4b5bf4af9c1e',
      volume: 9.092,
      chargeCategoryId: '9f194aa2-562d-4e89-a0ce-d4a31b5833b1',
      loss: 'high',
      supportedSourceName: null,
      waterCompanyCharge: null,
      chargeCategory: {
        id: '9f194aa2-562d-4e89-a0ce-d4a31b5833b1',
        reference: '4.6.5',
        shortDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model'
      }
    }
  }
}

/**
 * Represents a complete response from `FetchReviewLicenceService`
 *
 * @returns {object}
 */
function reviewLicence() {
  return {
    id: 'bb779166-0576-4581-b504-edbc0227d763',
    billRunId: '287aeb25-cf11-429d-8c6f-f98f06db021d',
    licenceId: '32416c67-f755-4c3f-8816-ecde0ee596bd',
    licenceRef: '1/11/11/*11/1111',
    licenceHolder: 'Licence Holder Ltd',
    status: 'review',
    progress: false,
    billRun: {
      id: '287aeb25-cf11-429d-8c6f-f98f06db021d',
      batchType: 'two_part_tariff',
      scheme: 'sroc',
      summer: false,
      toFinancialYearEnding: 2024,
      region: {
        id: '4ccf3c5b-ab4e-48e1-afa8-3b18b5d07fab',
        displayName: 'South West'
      }
    },
    reviewReturns: [
      {
        id: 'e3f64190-6a58-40af-8648-23c71ad1726f',
        allocated: 0,
        description: 'Test Road. Points 1 and 2.',
        endDate: new Date('2023-10-31'),
        issues: '',
        quantity: 0,
        purposes: [
          {
            primary: { code: 'A', description: 'Agriculture' },
            tertiary: { code: '400', description: 'Spray Irrigation - Direct' },
            secondary: { code: 'AGR', description: 'General Agriculture' }
          }
        ],
        returnId: 'v1:5:1/11/11/*11/1111:11142960:2022-11-01:2023-10-31',
        returnReference: '11142960',
        returnStatus: 'completed',
        startDate: new Date('2022-11-01'),
        underQuery: false,
        returnLog: {
          id: 'v1:5:1/11/11/*11/1111:11142960:2022-11-01:2023-10-31',
          periodStartDay: 1,
          periodStartMonth: 4,
          periodEndDay: 30,
          periodEndMonth: 9
        },
        reviewChargeElements: [
          {
            id: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1',
            reviewChargeReferenceId: '6c70461b-3f83-47b1-9538-8305e82b34eb',
            chargeElementId: 'dd050414-9c58-4a40-a114-77853f2fe6d2',
            allocated: 0,
            chargeDatesOverlap: false,
            issues: 'Aggregate',
            status: 'review',
            createdAt: new Date('2024-10-22'),
            updatedAt: new Date('2024-10-22'),
            amendedAllocated: 0
          }
        ]
      },
      {
        id: '4864f643-5c16-5ca9-8512-f63e1d4e58be',
        allocated: 0,
        description: 'Lost Road. Points 1 and 2.',
        endDate: new Date('2023-10-31'),
        issues: '',
        quantity: 0,
        purposes: [
          {
            primary: { code: 'A', description: 'Agriculture' },
            tertiary: { code: '420', description: 'Spray Irrigation - Storage' },
            secondary: { code: 'AGR', description: 'General Agriculture' }
          }
        ],
        returnId: 'v1:5:1/11/11/*11/1111:11142961:2022-11-01:2023-10-31',
        returnReference: '11142961',
        returnStatus: 'completed',
        startDate: new Date('2022-11-01'),
        underQuery: false,
        returnLog: {
          id: 'v1:5:1/11/11/*11/1111:11142961:2022-11-01:2023-10-31',
          periodStartDay: 1,
          periodStartMonth: 4,
          periodEndDay: 30,
          periodEndMonth: 9
        },
        reviewChargeElements: []
      }
    ],
    reviewChargeVersions: [
      {
        id: 'a71c386c-d9b8-4915-a508-74fb1508c071',
        chargePeriodEndDate: new Date('2024-03-31'),
        chargePeriodStartDate: new Date('2023-04-01'),
        reviewChargeReferences: [
          {
            id: '6c70461b-3f83-47b1-9538-8305e82b34eb',
            aggregate: 0.333333333,
            amendedAuthorisedVolume: 9.092,
            chargeAdjustment: 1,
            chargeReference: {
              id: 'fc493c81-5003-4dc0-9d48-4b5bf4af9c1e',
              chargeCategory: {
                id: '9f194aa2-562d-4e89-a0ce-d4a31b5833b1',
                reference: '4.6.5',
                shortDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model'
              }
            },
            reviewChargeElements: [
              {
                id: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1',
                amendedAllocated: 0,
                issues: 'Aggregate',
                status: 'review',
                chargeElement: {
                  id: 'dd050414-9c58-4a40-a114-77853f2fe6d2',
                  description: 'Spray Irrigation - Direct',
                  abstractionPeriodStartDay: 1,
                  abstractionPeriodStartMonth: 4,
                  abstractionPeriodEndDay: 30,
                  abstractionPeriodEndMonth: 9,
                  authorisedAnnualQuantity: 9.092,
                  purpose: {
                    id: '4ad11971-be6a-4da5-af04-563c76205b0e',
                    description: 'Spray Irrigation - Direct'
                  }
                },
                reviewReturns: [
                  {
                    id: 'e3f64190-6a58-40af-8648-23c71ad1726f',
                    quantity: 0,
                    returnReference: '10030495',
                    returnStatus: 'completed'
                  }
                ]
              }
            ]
          }
        ],
        chargeVersion: {
          id: '281a6820-4074-4ba8-92f1-7d1bfe63b426',
          billingAccount: BillingAccountModel.fromJson({
            id: 'f041c128-bb4d-4f67-8f97-e33d71d50842',
            accountNumber: 'E99999999A',
            company: {
              id: '838c9770-87a8-47b6-89a4-549c8e08ed2f',
              name: 'Mr B Blobby Ltd',
              type: 'organisation'
            },
            billingAccountAddresses: [
              {
                id: 'c95c0144-db2d-48fc-9bc0-e60126f762db',
                company: null,
                contact: null,
                address: {
                  id: 'da502c5b-0214-49d5-9125-83c4ea1359e5',
                  address1: 'C/O Noel Edmonds',
                  address2: 'Crinkley Bottom',
                  address3: 'Cricket St Thomas',
                  address4: null,
                  address5: null,
                  address6: 'Somerset',
                  postcode: 'TA20 1KL',
                  country: 'United Kingdom'
                }
              }
            ]
          })
        }
      }
    ]
  }
}

module.exports = {
  removeReviewLicence,
  reviewChargeElement,
  reviewChargeReference,
  reviewLicence
}
