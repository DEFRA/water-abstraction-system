'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const MockService = require('../../../../app/services/data/mock/mock.service.js')

const billRunId = 'f55c824b-a3bb-4db1-a77a-bc264cad5a11'

describe('Mock service', () => {
  describe('if the call succeeds', () => {
    it('returns the expected data', async () => {
      const result = await MockService.go('bill-run', billRunId)

      expect(result).to.equal({ billRun: billRunId })
    })
  })

  describe('if the call fails', () => {
    describe('because no type was provided', () => {
      it('throws an error', async () => {
        const error = await expect(MockService.go()).to.reject()

        expect(error).to.be.an.error()
        expect(error.message).to.equal('Nothing')
      })
    })

    describe('because no id was provided', () => {
      it('throws an error', async () => {
        const error = await expect(MockService.go('bill-run')).to.reject()

        expect(error).to.be.an.error()
        expect(error.message).to.equal('Nothing')
      })
    })

    describe('because an invalid type was provided', () => {
      it('throws an error', async () => {
        const error = await expect(MockService.go('INVALID_TYPE', billRunId)).to.reject()

        expect(error).to.be.an.error()
        expect(error.message).to.equal('Dunno')
      })
    })
  })
})
