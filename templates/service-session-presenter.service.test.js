'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('')

// Thing under test
const __MODULENAME__ = require('__REQUIRE_PATH__')

describe('__DESCRIBE_LABEL__', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {}
    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await __MODULENAME__.go(session.id)

      expect(result).to.equal({})
    })
  })
})
