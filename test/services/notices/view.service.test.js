'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers

// Thing under test
const ViewService = require('../../../app/services/notices/view.service.js')

describe('Notices - Index Notices service', () => {
  afterEach(() => {})

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewService.go()

      expect(result).to.equal({})
    })
  })
})
