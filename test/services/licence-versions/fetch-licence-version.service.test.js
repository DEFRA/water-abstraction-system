'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
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
  let licenceVersionPurpose
  let point
  let purpose
  let source

  describe('when there is licence version', () => {
    before(async () => {
      licence = await LicenceHelper.add()

      licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id })

      // Add additional licence for the pagination array
      additionalLicenceVersionOne = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2023-01-01')
      })

      additionalLicenceVersionTwo = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2019-01-01')
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
      const result = await FetchLicenceVersionService.go(licenceVersion.id)

      expect(result).to.equal({
        licenceVersion: {
          administrative: null,
          createdAt: licenceVersion.createdAt,
          id: licenceVersion.id,
          licence: {
            id: licence.id,
            licenceRef: licence.licenceRef
          },
          licenceVersionPurposes: [
            {
              id: licenceVersionPurpose.id,
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
              ]
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
            id: licenceVersion.id,
            startDate: new Date('2022-01-01')
          },
          {
            id: additionalLicenceVersionOne.id,
            startDate: new Date('2023-01-01')
          }
        ]
      })
    })
  })
})
