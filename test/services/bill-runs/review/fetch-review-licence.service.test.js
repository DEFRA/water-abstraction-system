// Test framework
import { beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import AddressHelper from '../../../support/helpers/address.helper.js'
import BillRunHelper from '../../../support/helpers/bill-run.helper.js'
import BillingAccountAddressHelper from '../../../support/helpers/billing-account-address.helper.js'
import BillingAccountHelper from '../../../support/helpers/billing-account.helper.js'
import ChargeCategoryHelper from '../../../support/helpers/charge-category.helper.js'
import ChargeElementHelper from '../../../support/helpers/charge-element.helper.js'
import ChargeReferenceHelper from '../../../support/helpers/charge-reference.helper.js'
import ChargeVersionHelper from '../../../support/helpers/charge-version.helper.js'
import CompanyHelper from '../../../support/helpers/company.helper.js'
import ContactHelper from '../../../support/helpers/contact.helper.js'
import LicenceHelper from '../../../support/helpers/licence.helper.js'
import PurposeHelper from '../../../support/helpers/purpose.helper.js'
import RegionHelper from '../../../support/helpers/region.helper.js'
import ReturnLogHelper from '../../../support/helpers/return-log.helper.js'
import ReviewChargeElementHelper from '../../../support/helpers/review-charge-element.helper.js'
import ReviewChargeElementReturnHelper from '../../../support/helpers/review-charge-element-return.helper.js'
import ReviewChargeReferenceHelper from '../../../support/helpers/review-charge-reference.helper.js'
import ReviewChargeVersionHelper from '../../../support/helpers/review-charge-version.helper.js'
import ReviewLicenceHelper from '../../../support/helpers/review-licence.helper.js'
import ReviewReturnHelper from '../../../support/helpers/review-return.helper.js'

// Thing under test
import FetchReviewLicenceService from '../../../../app/services/bill-runs/review/fetch-review-licence.service.js'

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

  beforeAll(async () => {
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
      returnId: returnLog.returnId,
      returnLogId: returnLog.id,
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
      const result = await FetchReviewLicenceService(reviewLicence.id)

      expect(result).toEqual({
        id: reviewLicence.id,
        billRunId: reviewLicence.billRunId,
        licenceId: reviewLicence.licenceId,
        licenceRef: reviewLicence.licenceRef,
        licenceHolder: 'Licence Holder Ltd',
        status: 'ready',
        progress: false,
        billRun: {
          id: billRun.id,
          batchType: 'two_part_tariff',
          scheme: 'sroc',
          summer: false,
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
            returnLogId: reviewReturn.returnLogId,
            returnReference: reviewReturn.returnReference,
            returnStatus: 'completed',
            startDate: new Date('2022-04-01'),
            underQuery: false,
            returnLog: {
              id: returnLog.id,
              periodStartDay: 1,
              periodStartMonth: 4,
              periodEndDay: 28,
              periodEndMonth: 4,
              returnId: returnLog.returnId
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
      const result = await FetchReviewLicenceService('dfa47d48-0c98-4707-a5b8-820eb16c1dfd')

      expect(result).toBeUndefined()
    })
  })
})
