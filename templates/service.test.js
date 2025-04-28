'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const __FETCH_NAME__ = require('__FETCH_PATH__')

// Thing under test
const __MODULENAME__ = require('__REQUIRE_PATH__')

describe('__DESCRIBE_LABEL__', () => {
  let session

  beforeEach(async () => {
    Sinon.stub(__FETCH_NAME__, 'go').resolves({})
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await __MODULENAME__.go(session.id)

      expect(result).to.equal({})
    })
  })
})
