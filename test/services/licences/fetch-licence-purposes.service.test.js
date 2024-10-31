'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, before } = require('node:test')
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
const FetchLicencePurposesService = require('../../../app/services/licences/fetch-licence-purposes.service.js')

describe('Fetch Licence Purposes service', () => {
  let licence
  let licenceVersion
  let licenceVersionPurpose
  let point
  let purpose
  let source

  describe('when the licence has licence versions, licence version purposes, points, purposes, and sources', () => {
    before(async () => {
      licence = await LicenceHelper.add()

      licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id })

      purpose = await PurposeHelper.select()

      licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })

      source = await SourceHelper.select()
      point = await PointHelper.add({ sourceId: source.id })

      await LicenceVersionPurposePointHelper.add({
        licenceVersionPurposeId: licenceVersionPurpose.id,
        pointId: point.id
      })
    })

    it('returns the matching licence versions, licence version purposes, points, purposes, and sources', async () => {
      const result = await FetchLicencePurposesService.go(licence.id)

      expect(result).to.equal({
        id: licence.id,
        licenceRef: licence.licenceRef,
        licenceVersions: [
          {
            id: licenceVersion.id,
            startDate: licenceVersion.startDate,
            status: 'current',
            licenceVersionPurposes: [{
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 1,
              annualQuantity: null,
              dailyQuantity: null,
              hourlyQuantity: null,
              instantQuantity: null,
              points: [
                {
                  description: point.description,
                  id: point.id,
                  ngr1: point.ngr1,
                  ngr2: null,
                  ngr3: null,
                  ngr4: null,
                  source: {
                    description: source.description,
                    id: source.id
                  }
                }
              ],
              purpose: {
                description: purpose.description,
                id: purpose.id
              }
            }]
          }]
      })
    })
  })
})
