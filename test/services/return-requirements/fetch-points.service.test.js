'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const PermitLicenceHelper = require('../../support/helpers/permit-licence.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const FetchPointsService = require('../../../app/services/return-requirements/fetch-points.service.js')

describe('Return Requirements - Fetch Points service', () => {
  let licence
  let region

  beforeEach(async () => {
    region = RegionHelper.select()

    // Create the initial licenceId
    licence = await LicenceHelper.add({
      regionId: region.id
    })

    await PermitLicenceHelper.add({
      licenceRef: licence.licenceRef,
      licenceDataValue: {
        data: {
          current_version: {
            purposes: [{
              purposePoints: [
                {
                  point_detail: {
                    NGR1_EAST: '69212',
                    NGR2_EAST: 'null',
                    NGR3_EAST: 'null',
                    NGR4_EAST: 'null',
                    LOCAL_NAME: 'RIVER MEDWAY AT YALDING INTAKE',
                    NGR1_NORTH: '50394',
                    NGR1_SHEET: 'TQ',
                    NGR2_NORTH: 'null',
                    NGR2_SHEET: 'null',
                    NGR3_NORTH: 'null',
                    NGR3_SHEET: 'null',
                    NGR4_NORTH: 'null',
                    NGR4_SHEET: 'null'
                  }
                },
                {
                  point_detail: {
                    NGR1_EAST: '6520',
                    NGR2_EAST: 'null',
                    NGR3_EAST: 'null',
                    NGR4_EAST: 'null',
                    LOCAL_NAME: 'POINT A, ADDINGTON SANDPITS',
                    NGR1_NORTH: '5937',
                    NGR1_SHEET: 'TQ',
                    NGR2_NORTH: 'null',
                    NGR2_SHEET: 'null',
                    NGR3_NORTH: 'null',
                    NGR3_SHEET: 'null',
                    NGR4_NORTH: 'null',
                    NGR4_SHEET: 'null'
                  }
                }
              ]
            }]
          }
        }
      }
    })
  })

  describe('when called', () => {
    it('returns result', async () => {
      const results = await FetchPointsService.go(licence.id)

      expect(results[0]).to.equal({
        NGR1_EAST: '6520',
        NGR2_EAST: 'null',
        NGR3_EAST: 'null',
        NGR4_EAST: 'null',
        LOCAL_NAME: 'POINT A, ADDINGTON SANDPITS',
        NGR1_NORTH: '5937',
        NGR1_SHEET: 'TQ',
        NGR2_NORTH: 'null',
        NGR2_SHEET: 'null',
        NGR3_NORTH: 'null',
        NGR3_SHEET: 'null',
        NGR4_NORTH: 'null',
        NGR4_SHEET: 'null'
      })

      expect(results[1]).to.equal({
        NGR1_EAST: '69212',
        NGR2_EAST: 'null',
        NGR3_EAST: 'null',
        NGR4_EAST: 'null',
        LOCAL_NAME: 'RIVER MEDWAY AT YALDING INTAKE',
        NGR1_NORTH: '50394',
        NGR1_SHEET: 'TQ',
        NGR2_NORTH: 'null',
        NGR2_SHEET: 'null',
        NGR3_NORTH: 'null',
        NGR3_SHEET: 'null',
        NGR4_NORTH: 'null',
        NGR4_SHEET: 'null'
      })
    })
  })
})
