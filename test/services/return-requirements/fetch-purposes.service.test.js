'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')

// Thing under test
const FetchPurposesService = require('../../../app/services/return-requirements/fetch-purposes.service.js')

describe('Return Requirements - Fetch Purposes service', () => {
  beforeEach(async () => {
    await DatabaseSupport.clean()

    await Promise.all([
      await PurposeHelper.add({ id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f', description: 'Heat Pump' }),
      await PurposeHelper.add({ id: '49088608-ee9f-491a-8070-6831240945ac', description: 'Horticultural Watering' }),
      await PurposeHelper.add({ id: '8290bb6a-4265-4cc8-b9bb-37cde1357d5d', description: 'Large Garden Watering' })
    ])
  })

  describe('when called', () => {
    it('returns a list of id of all of the purposes', async () => {
      const result = await FetchPurposesService.go()

      expect(result).to.equal([
        '14794d57-1acf-4c91-8b48-4b1ec68bfd6f',
        '49088608-ee9f-491a-8070-6831240945ac',
        '8290bb6a-4265-4cc8-b9bb-37cde1357d5d'
      ])
    })
  })
})
