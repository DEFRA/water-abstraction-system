'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('__SESSION_HELPER_PATH__')

// Thing under test
const __MODULE_NAME__ = require('__REQUIRE_PATH__')

describe('__DESCRIBE_LABEL__', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {}
    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('continues the journey', async () => {
      const result = await __MODULE_NAME__.go(session.id)

      expect(result).to.equal({})
    })
  })

  describe('when validation fails', () => {
    it('returns page data for the view, with errors', async () => {
      const result = await __MODULE_NAME__.go(session.id)

      expect(result).to.equal({})
    })
  })
})
