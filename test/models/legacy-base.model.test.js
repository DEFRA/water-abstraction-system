'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const LegacyBaseModel = require('../../app/models/legacy-base.model.js')

describe('Legacy Base model', () => {
  describe('.schema()', () => {
    describe('when the getter is not overridden', () => {
      class BadModel extends LegacyBaseModel {}

      it('throws an error when called', () => {
        expect(() => BadModel.query()).to.throw()
      })
    })

    describe('when the getter is overridden', () => {
      class GoodModel extends LegacyBaseModel {
        static get schema () {
          return 'water'
        }
      }

      it('does not throw an error when called', () => {
        expect(() => GoodModel.query()).not.to.throw()
      })
    })
  })
})
