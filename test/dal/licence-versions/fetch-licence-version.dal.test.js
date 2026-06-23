'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AddressHelper = require('../../support/helpers/address.helper.js')
const CompanyHelper = require('../../support/helpers/company.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposePointHelper = require('../../support/helpers/licence-version-purpose-point.helper.js')
const PointHelper = require('../../support/helpers/point.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const SourceHelper = require('../../support/helpers/source.helper.js')

// Thing under test
const FetchLicenceVersionDal = require('../../../app/dal/licence-versions/fetch-licence-version.dal.js')

describe('Licence Versions - Fetch licence version dal', () => {
  let additionalLicenceVersionOne
  let additionalLicenceVersionTwo
  let address
  let company
  let licence
  let licenceVersion
  let licenceVersionPurpose
  let point
  let purpose
  let source

  describe('when there is licence version', () => {
    before(async () => {
      licence = await LicenceHelper.add()

      address = await AddressHelper.add()

      company = await CompanyHelper.add()

      licenceVersion = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2023-01-02'),
        endDate: null,
        addressId: address.id,
        companyId: company.id
      })

      // Add additional licence for the pagination array
      additionalLicenceVersionOne = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-01')
      })

      additionalLicenceVersionTwo = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2019-01-01'),
        endDate: new Date('2022-12-30')
      })

      purpose = PurposeHelper.select()

      licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })

      source = SourceHelper.select()
      point = await PointHelper.add({ sourceId: source.id })
      await LicenceVersionPurposePointHelper.add({
        licenceVersionPurposeId: licenceVersionPurpose.id,
        pointId: point.id
      })
    })

    it('returns the matching licence version and the pagination array (in order)', async () => {
      const result = await FetchLicenceVersionDal.go(licenceVersion.id)

      expect(result).to.equal({
        licenceVersion: {
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
          administrative: null,
          applicationNumber: null,
          company: {
            id: company.id,
            name: 'Example Trading Ltd'
          },
          createdAt: licenceVersion.createdAt,
          endDate: null,
          id: licenceVersion.id,
          issueDate: null,
          licence: {
            id: licence.id,
            licenceRef: licence.licenceRef
          },
          licenceVersionPurposes: [
            {
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 1,
              annualQuantity: null,
              dailyQuantity: null,
              hourlyQuantity: null,
              instantQuantity: null,
              licenceVersionPurposePoints: [
                {
                  abstractionMethod: null
                }
              ],
              points: [
                {
                  bgsReference: null,
                  category: null,
                  depth: null,
                  description: 'WELL AT WELLINGTON',
                  hydroInterceptDistance: null,
                  hydroOffsetDistance: null,
                  hydroReference: null,
                  id: point.id,
                  locationNote: null,
                  ngr1: point.ngr1,
                  ngr2: null,
                  ngr3: null,
                  ngr4: null,
                  note: null,
                  primaryType: null,
                  secondaryType: null,
                  source: {
                    description: source.description,
                    id: source.id,
                    sourceType: source.sourceType
                  },
                  wellReference: null
                }
              ],
              purpose: {
                description: purpose.description,
                id: purpose.id
              }
            }
          ],
          modLogs: [],
          startDate: licenceVersion.startDate
        },
        licenceVersionsForPagination: [
          {
            id: additionalLicenceVersionTwo.id,
            startDate: new Date('2019-01-01')
          },
          {
            id: additionalLicenceVersionOne.id,
            startDate: new Date('2023-01-01')
          },
          {
            id: licenceVersion.id,
            startDate: new Date('2023-01-02')
          }
        ]
      })
    })
  })
})
