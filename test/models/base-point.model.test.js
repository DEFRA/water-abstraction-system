'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const BasePointModel = require('../../app/models/base-point.model.js')

describe('Base Point model', () => {
  let testRecord

  describe('$describe', () => {
    describe('when the instance represents a "point" (1 grid reference)', () => {
      beforeEach(() => {
        testRecord = BasePointModel.fromJson({ ngr1: 'ST 58212 72697' })
      })

      describe('and it has a supplementary description', () => {
        beforeEach(() => {
          testRecord.description = 'Head office'
        })

        it('returns a "point" description including the supplementary', () => {
          const result = testRecord.$describe()

          expect(result).to.equal('At National Grid Reference ST 58212 72697 (Head office)')
        })
      })

      describe('and it does not have a supplementary description', () => {
        it('returns just the "point" description', () => {
          const result = testRecord.$describe()

          expect(result).to.equal('At National Grid Reference ST 58212 72697')
        })
      })
    })

    describe('when the instance represents a "reach" (2 grid references)', () => {
      beforeEach(() => {
        testRecord = BasePointModel.fromJson({ ngr1: 'ST 58212 72697', ngr2: 'ST 58151 72683' })
      })

      describe('and it has a supplementary description', () => {
        beforeEach(() => {
          testRecord.description = 'Head office'
        })

        it('returns a "reach" description including the supplementary', () => {
          const result = testRecord.$describe()

          expect(result).to.equal('Between National Grid References ST 58212 72697 and ST 58151 72683 (Head office)')
        })
      })

      describe('and it does not have a supplementary description', () => {
        it('returns just the "reach" description', () => {
          const result = testRecord.$describe()

          expect(result).to.equal('Between National Grid References ST 58212 72697 and ST 58151 72683')
        })
      })
    })

    describe('when the instance represents an "area" (4 grid references)', () => {
      beforeEach(() => {
        testRecord = BasePointModel.fromJson({
          ngr1: 'ST 58212 72697', ngr2: 'ST 58151 72683', ngr3: 'ST 58145 72727', ngr4: 'ST 58222 72744'
        })
      })

      describe('and it has a supplementary description', () => {
        beforeEach(() => {
          testRecord.description = 'Head office'
        })

        it('returns an "area" description including the supplementary', () => {
          const result = testRecord.$describe()

          expect(result).to.equal('Within the area formed by the straight lines running between National Grid References ST 58212 72697 ST 58151 72683 ST 58145 72727 and ST 58222 72744 (Head office)')
        })
      })

      describe('and it does not have a supplementary description', () => {
        it('returns just the "area" description', () => {
          const result = testRecord.$describe()

          expect(result).to.equal('Within the area formed by the straight lines running between National Grid References ST 58212 72697 ST 58151 72683 ST 58145 72727 and ST 58222 72744')
        })
      })
    })
  })
})
