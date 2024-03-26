'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const SessionHelper = require('../../support/helpers/session.helper.js')

// Things we need to stub
const FetchPointsService = require('../../../app/services/return-requirements/fetch-points.service.js')

// Thing under test
const SelectPointsService = require('../../../app/services/return-requirements/points.service.js')

describe('Select Points service', () => {
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()

    session = await SessionHelper.add({
      data: {
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          currentVersionStartDate: '2023-01-01T00:00:00.000Z',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Turbo Kid',
          startDate: '2022-04-01T00:00:00.000Z'
        }
      }
    })

    Sinon.stub(FetchPointsService, 'go').resolves([
      {
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
      },
      {
        NGR1_EAST: '68083',
        NGR2_EAST: 'null',
        NGR3_EAST: 'null',
        NGR4_EAST: 'null',
        LOCAL_NAME: 'BEWL WATER RESERVOIR',
        NGR1_NORTH: '33604',
        NGR1_SHEET: 'TQ',
        NGR2_NORTH: 'null',
        NGR2_SHEET: 'null',
        NGR3_NORTH: 'null',
        NGR3_SHEET: 'null',
        NGR4_NORTH: 'null',
        NGR4_SHEET: 'null'
      }
    ])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await SelectPointsService.go(session.id)

      expect(result.id).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await SelectPointsService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licencePoints: [
          'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)',
          'At National Grid Reference TQ 68083 33604 (BEWL WATER RESERVOIR)'
        ],
        licenceRef: '01/ABC',
        pageTitle: 'Select the points for the requirements for returns'
      }, { skip: ['id'] })
    })
  })
})
