'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ExpandedError = require('../../../../app/errors/expanded.error.js')

// Things we need to stub
const GenerateBillRunService = require('../../../../app/services/data/mock/generate-bill-run.service.js')

// Thing under test
const MockService = require('../../../../app/services/data/mock/mock.service.js')

describe('Mock service', () => {
  const billRunId = 'f55c824b-a3bb-4db1-a77a-bc264cad5a11'

  afterEach(() => {
    Sinon.restore()
  })

  describe('if the call succeeds', () => {
    describe("and the mock type is 'bill-run'", () => {
      let generateBillRunServiceStub

      const expectedResult = { billRun: billRunId }

      beforeEach(async () => {
        generateBillRunServiceStub = Sinon.stub(GenerateBillRunService, 'go').resolves(expectedResult)
      })

      it('calls the appropriate generate mock data service', async () => {
        await MockService.go('bill-run', billRunId)

        expect(generateBillRunServiceStub.called).to.be.true()
      })

      it('returns the expected data', async () => {
        const result = await MockService.go('bill-run', billRunId)

        expect(result).to.equal(expectedResult)
      })
    })
  })

  describe('if the call fails', () => {
    describe('because no type was provided', () => {
      it('throws an error', async () => {
        const error = await expect(MockService.go()).to.reject()

        expect(error).to.be.an.error()
        expect(error).to.be.an.instanceOf(ExpandedError)
        expect(error.message).to.equal('Both type and ID are required for the mocking')
        expect(error.type).to.be.undefined()
        expect(error.id).to.be.undefined()
      })
    })

    describe('because no id was provided', () => {
      it('throws an error', async () => {
        const error = await expect(MockService.go('bill-run')).to.reject()

        expect(error).to.be.an.error()
        expect(error).to.be.an.instanceOf(ExpandedError)
        expect(error.message).to.equal('Both type and ID are required for the mocking')
        expect(error.type).to.equal('bill-run')
        expect(error.id).to.be.undefined()
      })
    })

    describe('because an invalid type was provided', () => {
      it('throws an error', async () => {
        const error = await expect(MockService.go('INVALID_TYPE', billRunId)).to.reject()

        expect(error).to.be.an.error()
        expect(error).to.be.an.instanceOf(ExpandedError)
        expect(error.message).to.equal('Mocking is not supported for this type')
        expect(error.type).to.equal('INVALID_TYPE')
        expect(error.id).to.equal(billRunId)
      })
    })
  })
})
