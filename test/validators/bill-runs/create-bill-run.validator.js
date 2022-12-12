'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const CreateBillRunValidator = require('../../../app/validators/bill-runs/create-bill-run.validator.js')

describe('Create Bill Run validator', () => {
  describe('when valid data is provided', () => {
    it('returns validated data', async () => {
      const validData = {
        type: 'supplementary',
        scheme: 'sroc',
        previousBillRunId: '28a5fc2e-bdc9-4b48-96e7-5ee7b2f5d603'
      }

      const result = await CreateBillRunValidator.go(validData)

      expect(result).to.equal({
        type: 'supplementary',
        scheme: 'sroc',
        previousBillRunId: '28a5fc2e-bdc9-4b48-96e7-5ee7b2f5d603'
      })
    })

    describe('which does not include `previousBillRunId`', () => {
      it('returns validated data', async () => {
        const validData = {
          type: 'supplementary',
          scheme: 'sroc'
        }

        const result = await CreateBillRunValidator.go(validData)

        expect(result).to.equal({
          type: 'supplementary',
          scheme: 'sroc'
        })
      })
    })
  })

  describe('when invalid data is provided', () => {
    it('returns a promise that rejects', async () => {
      const invalidData = { }

      await expect(CreateBillRunValidator.go(invalidData)).to.reject()
    })
  })
})
