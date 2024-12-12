'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AddressHelper = require('../../../support/helpers/address.helper.js')
const BillingAccountHelper = require('../../../support/helpers/billing-account.helper.js')
const BillingAccountAddressHelper = require('../../../support/helpers/billing-account-address.helper.js')
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')
const ChargeElementHelper = require('../../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const CompanyHelper = require('../../../support/helpers/company.helper.js')
const ContactHelper = require('../../../support/helpers/contact.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const PurposeHelper = require('../../../support/helpers/purpose.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReviewChargeElementHelper = require('../../../support/helpers/review-charge-element.helper.js')
const ReviewChargeElementReturnHelper = require('../../../support/helpers/review-charge-element-return.helper.js')
const ReviewChargeReferenceHelper = require('../../../support/helpers/review-charge-reference.helper.js')
const ReviewChargeVersionHelper = require('../../../support/helpers/review-charge-version.helper.js')
const ReviewLicenceHelper = require('../../../support/helpers/review-licence.helper.js')
const ReviewReturnHelper = require('../../../support/helpers/review-return.helper.js')

// Thing under test
const FetchReviewLicenceService = require('../../../../app/services/bill-runs/review/fetch-review-licence.service.js')

describe('Bill Runs Review - Fetch Review Licence service', () => {
  let address
  let billingAccount
  let billingAccountAddress
  let billRun
  let chargeCategory
  let chargeElement
  let chargeReference
  let chargeVersion
  let company
  let contact
  let licence
  let purpose
  let region
  let returnLog
  let reviewChargeElement
  let reviewChargeVersion
  let reviewChargeReference
  let reviewLicence
  let reviewReturn

  before(async () => {
    address = await AddressHelper.add()
    company = await CompanyHelper.add()
    contact = await ContactHelper.add()
    billingAccount = await BillingAccountHelper.add({ companyId: company.id })
    billingAccountAddress = await BillingAccountAddressHelper.add({
      addressId: address.id,
      billingAccountId: billingAccount.id,
      companyId: company.id,
      contactId: contact.id
    })

    region = RegionHelper.select()

    billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', regionId: region.id, status: 'review' })

    licence = await LicenceHelper.add()
    returnLog = await ReturnLogHelper.add()

    chargeVersion = await ChargeVersionHelper.add({
      billingAccountId: billingAccount.id,
      licenceId: licence.id,
      licenceRef: licence.licenceRef
    })
    chargeCategory = ChargeCategoryHelper.select()
    chargeReference = await ChargeReferenceHelper.add({
      chargeCategoryId: chargeCategory.id,
      chargeVersionId: chargeVersion.id
    })
    purpose = PurposeHelper.select()
    chargeElement = await ChargeElementHelper.add({ chargeReferenceId: chargeReference.id, purposeId: purpose.id })

    reviewLicence = await ReviewLicenceHelper.add({
      billRunId: billRun.id,
      licenceId: licence.id,
      licenceRef: licence.licenceRef
    })
    reviewReturn = await ReviewReturnHelper.add({
      purposes: [
        {
          primary: { code: 'A', description: 'Agriculture' },
          tertiary: { code: '400', description: 'Spray Irrigation - Direct' },
          secondary: { code: 'AGR', description: 'General Agriculture' }
        }
      ],
      returnId: returnLog.id,
      reviewLicenceId: reviewLicence.id
    })

    reviewChargeVersion = await ReviewChargeVersionHelper.add({
      chargeVersionId: chargeVersion.id,
      reviewLicenceId: reviewLicence.id
    })
    reviewChargeReference = await ReviewChargeReferenceHelper.add({
      chargeReferenceId: chargeReference.id,
      reviewChargeVersionId: reviewChargeVersion.id
    })
    reviewChargeElement = await ReviewChargeElementHelper.add({
      chargeElementId: chargeElement.id,
      reviewChargeReferenceId: reviewChargeReference.id
    })

    await ReviewChargeElementReturnHelper.add({
      reviewChargeElementId: reviewChargeElement.id,
      reviewReturnId: reviewReturn.id
    })
  })

  describe('when a matching review licence exists', () => {
    it('returns the match', async () => {
      const result = await FetchReviewLicenceService.go(reviewLicence.id)

      expect(result).to.equal({
        id: reviewLicence.id,
        billRunId: reviewLicence.billRunId,
        licenceId: reviewLicence.licenceId,
        licenceRef: reviewLicence.licenceRef,
        licenceHolder: 'Licence Holder Ltd',
        status: 'ready',
        progress: false,
        billRun: {
          id: billRun.id,
          toFinancialYearEnding: 2023,
          region: {
            id: region.id,
            displayName: region.displayName
          }
        },
        reviewReturns: [
          {
            id: reviewReturn.id,
            allocated: 0,
            description: 'Lands at Mosshayne Farm, Exeter & Broadclyst',
            endDate: new Date('2022-05-06'),
            issues: '',
            quantity: 0,
            purposes: [
              {
                primary: { code: 'A', description: 'Agriculture' },
                tertiary: { code: '400', description: 'Spray Irrigation - Direct' },
                secondary: { code: 'AGR', description: 'General Agriculture' }
              }
            ],
            returnId: reviewReturn.returnId,
            returnReference: reviewReturn.returnReference,
            returnStatus: 'completed',
            startDate: new Date('2022-04-01'),
            underQuery: false,
            returnLog: {
              id: returnLog.id,
              periodStartDay: 1,
              periodStartMonth: 4,
              periodEndDay: 28,
              periodEndMonth: 4
            },
            reviewChargeElements: [
              {
                id: reviewChargeElement.id
              }
            ]
          }
        ],
        reviewChargeVersions: [
          {
            id: reviewChargeVersion.id,
            chargePeriodStartDate: new Date('2022-04-01'),
            chargePeriodEndDate: new Date('2022-06-05'),
            reviewChargeReferences: [
              {
                id: reviewChargeReference.id,
                aggregate: 1,
                amendedAuthorisedVolume: 0,
                chargeAdjustment: 1,
                chargeReference: {
                  id: chargeReference.id,
                  chargeCategory: {
                    id: chargeCategory.id,
                    reference: chargeCategory.reference,
                    shortDescription: chargeCategory.shortDescription
                  }
                },
                reviewChargeElements: [
                  {
                    id: reviewChargeElement.id,
                    amendedAllocated: 0,
                    issues: '',
                    status: 'ready',
                    chargeElement: {
                      id: chargeElement.id,
                      abstractionPeriodStartDay: 1,
                      abstractionPeriodStartMonth: 4,
                      abstractionPeriodEndDay: 31,
                      abstractionPeriodEndMonth: 3,
                      authorisedAnnualQuantity: 200,
                      description: 'Trickle Irrigation - Direct',
                      purpose: {
                        id: purpose.id,
                        description: purpose.description
                      }
                    },
                    reviewReturns: [
                      {
                        id: reviewReturn.id,
                        quantity: 0,
                        returnReference: reviewReturn.returnReference,
                        returnStatus: 'completed'
                      }
                    ]
                  }
                ]
              }
            ],
            chargeVersion: {
              id: chargeVersion.id,
              billingAccount: {
                id: billingAccount.id,
                accountNumber: billingAccount.accountNumber,
                billingAccountAddresses: [
                  {
                    id: billingAccountAddress.id,
                    address: {
                      id: address.id,
                      address1: 'ENVIRONMENT AGENCY',
                      address2: 'HORIZON HOUSE',
                      address3: 'DEANERY ROAD',
                      address4: 'BRISTOL',
                      address5: null,
                      address6: null,
                      postcode: 'BS1 5AH',
                      country: 'United Kingdom'
                    },
                    company: {
                      id: company.id,
                      name: 'Example Trading Ltd',
                      type: 'organisation'
                    },
                    contact: {
                      id: contact.id,
                      contactType: 'person',
                      dataSource: 'wrls',
                      department: null,
                      firstName: 'Amara',
                      initials: null,
                      lastName: 'Gupta',
                      middleInitials: null,
                      salutation: null,
                      suffix: null
                    }
                  }
                ],
                company: {
                  id: company.id,
                  name: 'Example Trading Ltd',
                  type: 'organisation'
                }
              }
            }
          }
        ]
      })
    })
  })

  describe('when no matching review licence exists', () => {
    it('returns nothing', async () => {
      const result = await FetchReviewLicenceService.go('dfa47d48-0c98-4707-a5b8-820eb16c1dfd')

      expect(result).to.be.undefined()
    })
  })
})
