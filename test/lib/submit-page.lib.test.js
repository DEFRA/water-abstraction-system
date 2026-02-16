'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SubmitPageLib = require('../../app/lib/submit-page.lib.js')

describe('SubmitPageLib', () => {
  let payload

  describe.only('#clearFilters()', () => {
    const filterKey = 'filterToClear'

    let yarStub

    beforeEach(() => {
      yarStub = {
        clear: Sinon.stub().returns()
      }
    })

    afterEach(() => {
      Sinon.restore()
    })

    describe('when called with the instruction to clear filters', () => {
      before(() => {
        payload = { clearFilters: 'reset' }
      })

      it('clears the specified filter object from the session and returns TRUE', () => {
        const result = SubmitPageLib.clearFilters(payload, yarStub, filterKey)

        expect(yarStub.clear.calledWith(filterKey)).to.be.true()
        expect(result).to.be.true()
      })
    })

    describe('when there is no instruction to clear filters', () => {
      before(() => {
        payload = {}
      })

      it('leaves the specified filter object untouched and returns FALSE', () => {
        const result = SubmitPageLib.clearFilters(payload, yarStub, filterKey)

        expect(yarStub.clear.called).to.be.false()
        expect(result).to.be.false()
      })
    })
  })

  describe('#handleOneOptionSelected()', () => {
    const key = 'propertyToCheck'

    let payload

    describe('when the payload is empty', () => {
      before(() => {
        payload = {}
      })

      it('adds the key to the payload as an empty array', () => {
        SubmitPageLib.handleOneOptionSelected(payload, key)

        expect(payload).to.equal({ propertyToCheck: [] })
      })
    })

    describe('when the payload contains a string', () => {
      before(() => {
        payload = { propertyToCheck: 'checkBoxValue' }
      })

      it('returns the key in the payload with the string converted to an array', () => {
        SubmitPageLib.handleOneOptionSelected(payload, key)

        expect(payload).to.equal({ propertyToCheck: ['checkBoxValue'] })
      })
    })

    describe('when the payload contains an array', () => {
      before(() => {
        payload = { propertyToCheck: ['checkBoxValue', 'anotherCheckBoxValue'] }
      })

      it('does not alter the payload', () => {
        SubmitPageLib.handleOneOptionSelected(payload, key)

        expect(payload).to.equal({ propertyToCheck: ['checkBoxValue', 'anotherCheckBoxValue'] })
      })
    })
  })
})
