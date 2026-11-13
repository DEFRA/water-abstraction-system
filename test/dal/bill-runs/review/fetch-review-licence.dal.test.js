// Test framework
import { beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import AddressHelper from 'water-abstraction-engine/test/helpers/address.helper.js'
import BillingAccountAddressHelper from 'water-abstraction-engine/test/helpers/billing-account-address.helper.js'
import BillingAccountHelper from 'water-abstraction-engine/test/helpers/billing-account.helper.js'
import BillRunHelper from 'water-abstraction-engine/test/helpers/bill-run.helper.js'
import ChargeCategoryHelper from 'water-abstraction-engine/test/helpers/charge-category.helper.js'
import ChargeElementHelper from 'water-abstraction-engine/test/helpers/charge-element.helper.js'
import ChargeReferenceHelper from 'water-abstraction-engine/test/helpers/charge-reference.helper.js'
import ChargeVersionHelper from 'water-abstraction-engine/test/helpers/charge-version.helper.js'
import CompanyHelper from 'water-abstraction-engine/test/helpers/company.helper.js'
import ContactHelper from 'water-abstraction-engine/test/helpers/contact.helper.js'
import LicenceHelper from 'water-abstraction-engine/test/helpers/licence.helper.js'
import PurposeHelper from 'water-abstraction-engine/test/helpers/purpose.helper.js'
import RegionHelper from 'water-abstraction-engine/test/helpers/region.helper.js'
import ReturnLogHelper from 'water-abstraction-engine/test/helpers/return-log.helper.js'
import ReturnRequirementHelper from 'water-abstraction-engine/test/helpers/return-requirement.helper.js'
import ReviewChargeElementHelper from 'water-abstraction-engine/test/helpers/review-charge-element.helper.js'
import ReviewChargeElementReturnHelper from 'water-abstraction-engine/test/helpers/review-charge-element-return.helper.js'
import ReviewChargeReferenceHelper from 'water-abstraction-engine/test/helpers/review-charge-reference.helper.js'
import ReviewChargeVersionHelper from 'water-abstraction-engine/test/helpers/review-charge-version.helper.js'
import ReviewLicenceHelper from 'water-abstraction-engine/test/helpers/review-licence.helper.js'
import ReviewReturnHelper from 'water-abstraction-engine/test/helpers/review-return.helper.js'

// Thing under test
import FetchReviewLicenceDal from '../../../../src/dal/bill-runs/review/fetch-review-licence.dal.js'

describe('Bill Runs - Review - Fetch Review Licence dal', () => {
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
  let returnRequirement
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
    returnRequirement = await ReturnRequirementHelper.add()
    returnLog = await ReturnLogHelper.add({ returnRequirementId: returnRequirement.id })

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
          alias: null,
          code: '400',
          description: 'Spray Irrigation - Direct'
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
      const result = await FetchReviewLicenceDal(reviewLicence.id)

      expect(result).toEqual({
        billRun: {
          batchType: 'two_part_tariff',
          id: billRun.id,
          region: {
            displayName: region.displayName,
            id: region.id
          },
          scheme: 'sroc',
          summer: false,
          toFinancialYearEnding: 2023
        },
        billRunId: reviewLicence.billRunId,
        id: reviewLicence.id,
        licenceHolder: 'Licence Holder Ltd',
        licenceId: reviewLicence.licenceId,
        licenceRef: reviewLicence.licenceRef,
        progress: false,
        reviewChargeVersions: [
          {
            chargePeriodEndDate: new Date('2022-06-05'),
            chargePeriodStartDate: new Date('2022-04-01'),
            chargeVersion: {
              billingAccount: {
                accountNumber: billingAccount.accountNumber,
                billingAccountAddresses: [
                  {
                    address: {
                      address1: 'ENVIRONMENT AGENCY',
                      address2: 'HORIZON HOUSE',
                      address3: 'DEANERY ROAD',
                      address4: 'BRISTOL',
                      address5: null,
                      address6: null,
                      country: 'United Kingdom',
                      id: address.id,
                      postcode: 'BS1 5AH'
                    },
                    company: {
                      id: company.id,
                      name: 'Example Trading Ltd',
                      type: 'organisation'
                    },
                    contact: {
                      contactType: 'person',
                      dataSource: 'wrls',
                      department: null,
                      firstName: 'Amara',
                      id: contact.id,
                      initials: null,
                      lastName: 'Gupta',
                      middleInitials: null,
                      salutation: null,
                      suffix: null
                    },
                    id: billingAccountAddress.id
                  }
                ],
                company: {
                  id: company.id,
                  name: 'Example Trading Ltd',
                  type: 'organisation'
                },
                id: billingAccount.id
              },
              id: chargeVersion.id
            },
            id: reviewChargeVersion.id,
            reviewChargeReferences: [
              {
                aggregate: 1,
                amendedAuthorisedVolume: 0,
                chargeAdjustment: 1,
                chargeReference: {
                  chargeCategory: {
                    id: chargeCategory.id,
                    reference: chargeCategory.reference,
                    shortDescription: chargeCategory.shortDescription
                  },
                  id: chargeReference.id
                },
                id: reviewChargeReference.id,
                reviewChargeElements: [
                  {
                    amendedAllocated: 0,
                    chargeElement: {
                      abstractionPeriodEndDay: 31,
                      abstractionPeriodEndMonth: 3,
                      abstractionPeriodStartDay: 1,
                      abstractionPeriodStartMonth: 4,
                      authorisedAnnualQuantity: 200,
                      description: 'Mineral washing',
                      id: chargeElement.id,
                      purpose: {
                        description: purpose.description,
                        id: purpose.id
                      }
                    },
                    id: reviewChargeElement.id,
                    issues: '',
                    reviewReturns: [
                      {
                        id: reviewReturn.id,
                        quantity: 0,
                        returnReference: reviewReturn.returnReference,
                        returnStatus: 'completed'
                      }
                    ],
                    status: 'ready'
                  }
                ]
              }
            ]
          }
        ],
        reviewReturns: [
          {
            allocated: 0,
            description: 'Lands at Mosshayne Farm, Exeter & Broadclyst',
            endDate: new Date('2022-05-06'),
            id: reviewReturn.id,
            issues: '',
            purposes: [
              {
                alias: null,
                code: '400',
                description: 'Spray Irrigation - Direct'
              }
            ],
            quantity: 0,
            returnId: reviewReturn.returnId,
            returnLog: {
              id: returnLog.id,
              periodEndDay: 31,
              periodEndMonth: 3,
              periodStartDay: 1,
              periodStartMonth: 4,
              returnId: returnLog.returnId
            },
            returnLogId: reviewReturn.returnLogId,
            returnReference: reviewReturn.returnReference,
            returnStatus: 'completed',
            reviewChargeElements: [
              {
                id: reviewChargeElement.id
              }
            ],
            startDate: new Date('2022-04-01'),
            underQuery: false
          }
        ],
        status: 'ready'
      })
    })
  })

  describe('when no matching review licence exists', () => {
    it('returns nothing', async () => {
      const result = await FetchReviewLicenceDal('dfa47d48-0c98-4707-a5b8-820eb16c1dfd')

      expect(result).toBeUndefined()
    })
  })
})
