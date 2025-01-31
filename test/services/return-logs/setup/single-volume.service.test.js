'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SingleVolumeService = require('../../../../app/services/return-logs/setup/single-volume.service.js')

describe('Return Logs Setup - Single Volume service', () => {
  let session

  before(async () => {
    session = await SessionHelper.add({
      data: {
        returnReference: '012345',
        units: 'cubic-metres'
      }
    })
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await SingleVolumeService.go(session.id)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await SingleVolumeService.go(session.id)

      expect(result).to.equal(
        {
          activeNavBar: 'search',
          backLink: `/system/return-logs/setup/${session.id}/meter-provided`,
          pageTitle: 'Is it a single volume?',
          returnReference: '012345',
          singleVolume: null,
          singleVolumeQuantity: null,
          units: 'cubic metres'
        },
        { skip: ['sessionId'] }
      )
    })
  })
})
