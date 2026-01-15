'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceVersionHolderHelper = require('../../support/helpers/licence-version-holder.helper.js')
const LicenceVersionPurposeHelper = require('../../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposePointHelper = require('../../support/helpers/licence-version-purpose-point.helper.js')
const PointHelper = require('../../support/helpers/point.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const SourceHelper = require('../../support/helpers/source.helper.js')

// Thing under test
const FetchLicenceVersionService = require('../../../app/services/licence-versions/fetch-licence-version.service.js')

describe('Licence Versions - Fetch licence version service', () => {
  let additionalLicenceVersionOne
  let additionalLicenceVersionTwo
  let licence
  let licenceVersion
  let licenceVersionHolder
  let licenceVersionPurpose
  let point
  let purpose
  let source

  describe('when there is licence version', () => {
    before(async () => {
      licence = await LicenceHelper.add()

      licenceVersion = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2023-01-02'),
        endDate: null
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

      licenceVersionHolder = await LicenceVersionHolderHelper.add({
        licenceVersionId: licenceVersion.id
      })

      source = SourceHelper.select()
      point = await PointHelper.add({ sourceId: source.id })
      await LicenceVersionPurposePointHelper.add({
        licenceVersionPurposeId: licenceVersionPurpose.id,
        pointId: point.id
      })
    })

    it('returns the matching licence version and the pagination array (in order)', async () => {
      const result = await FetchLicenceVersionService.go(licenceVersion.id)

      expect(result).to.equal({
        licenceVersion: {
          administrative: null,
          applicationNumber: null,
          createdAt: licenceVersion.createdAt,
          endDate: null,
          id: licenceVersion.id,
          issueDate: null,
          licence: {
            id: licence.id,
            licenceRef: licence.licenceRef
          },
          licenceVersionHolder: {
            id: licenceVersionHolder.id,
            addressLine1: null,
            addressLine2: null,
            addressLine3: null,
            addressLine4: null,
            country: null,
            county: null,
            forename: null,
            holderType: 'organisation',
            initials: null,
            name: null,
            postcode: null,
            salutation: null,
            town: null
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
