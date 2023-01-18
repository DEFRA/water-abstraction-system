'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const GeneralLib = require('../../app/lib/general.lib.js')

describe('RequestLib', () => {
  describe('#timestampForPostgres', () => {
    let clock
    let testDate

    beforeEach(() => {
      testDate = new Date(2015, 9, 21, 20, 31, 57)

      clock = Sinon.useFakeTimers(testDate)
    })

    afterEach(() => {
      clock.restore()
      Sinon.restore()
    })

    it('returns the current date and time as an ISO string', () => {
      const result = GeneralLib.timestampForPostgres()

      expect(result).to.equal('2015-10-21T20:31:57.000Z')
    })
  })
})
