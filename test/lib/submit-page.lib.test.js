'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SubmitPageLib = require('../../app/lib/submit-page.lib.js')

describe('SubmitPageLib', () => {
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
