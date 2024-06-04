'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const CreateBillRunValidator = require('../../app/validators/create-bill-run.validator.js')

describe('Create Bill Run validator', () => {
  describe('when valid data is provided', () => {
    it('returns validated data', async () => {
      const validData = {
        type: 'supplementary',
        scheme: 'sroc',
        region: '07ae7f3a-2677-4102-b352-cc006828948c',
        user: 'test.user@defra.gov.uk',
        financialYearEnding: 2023,
        previousBillRunId: '28a5fc2e-bdc9-4b48-96e7-5ee7b2f5d603'
      }

      const result = await CreateBillRunValidator.go(validData)

      expect(result.value).to.equal({
        type: 'supplementary',
        scheme: 'sroc',
        region: '07ae7f3a-2677-4102-b352-cc006828948c',
        user: 'test.user@defra.gov.uk',
        financialYearEnding: 2023,
        previousBillRunId: '28a5fc2e-bdc9-4b48-96e7-5ee7b2f5d603'
      })
    })

    describe('which does not include "financialYearEnding"', () => {
      it('returns validated data', async () => {
        const validData = {
          type: 'supplementary',
          scheme: 'sroc',
          region: '07ae7f3a-2677-4102-b352-cc006828948c',
          user: 'test.user@defra.gov.uk',
          previousBillRunId: '28a5fc2e-bdc9-4b48-96e7-5ee7b2f5d603'
        }

        const result = await CreateBillRunValidator.go(validData)

        expect(result.value).to.equal({
          type: 'supplementary',
          scheme: 'sroc',
          region: '07ae7f3a-2677-4102-b352-cc006828948c',
          user: 'test.user@defra.gov.uk',
          previousBillRunId: '28a5fc2e-bdc9-4b48-96e7-5ee7b2f5d603'
        })
      })
    })

    describe('which does not include "previousBillRunId"', () => {
      it('returns validated data', async () => {
        const validData = {
          type: 'supplementary',
          scheme: 'sroc',
          region: '07ae7f3a-2677-4102-b352-cc006828948c',
          user: 'test.user@defra.gov.uk',
          financialYearEnding: 2023
        }

        const result = await CreateBillRunValidator.go(validData)

        expect(result.value).to.equal({
          type: 'supplementary',
          scheme: 'sroc',
          region: '07ae7f3a-2677-4102-b352-cc006828948c',
          user: 'test.user@defra.gov.uk',
          financialYearEnding: 2023
        })
      })
    })
  })

  describe('when invalid data is provided', () => {
    describe('because "type" is missing', () => {
      it('returns an error', async () => {
        const invalidData = {
          scheme: 'sroc',
          region: '07ae7f3a-2677-4102-b352-cc006828948c',
          user: 'test.user@defra.gov.uk'
        }

        const result = await CreateBillRunValidator.go(invalidData)

        expect(result.error).to.not.be.empty()
      })
    })

    describe('because "scheme" is missing', () => {
      it('returns an error', async () => {
        const invalidData = {
          type: 'supplementary',
          region: '07ae7f3a-2677-4102-b352-cc006828948c',
          user: 'test.user@defra.gov.uk'
        }

        const result = await CreateBillRunValidator.go(invalidData)

        expect(result.error).to.not.be.empty()
      })
    })

    describe('because "region" is missing', () => {
      it('returns an error', async () => {
        const invalidData = {
          type: 'supplementary',
          scheme: 'sroc',
          user: 'test.user@defra.gov.uk'
        }

        const result = await CreateBillRunValidator.go(invalidData)

        expect(result.error).to.not.be.empty()
      })
    })

    describe('because "user" is missing', () => {
      it('returns an error', async () => {
        const invalidData = {
          type: 'supplementary',
          scheme: 'sroc',
          region: '07ae7f3a-2677-4102-b352-cc006828948c'
        }

        const result = await CreateBillRunValidator.go(invalidData)

        expect(result.error).to.not.be.empty()
      })
    })

    describe('because "type" has an invalid value', () => {
      it('returns an error', async () => {
        const invalidData = {
          type: 'INVALID',
          scheme: 'sroc',
          region: '07ae7f3a-2677-4102-b352-cc006828948c',
          user: 'test.user@defra.gov.uk'
        }

        const result = await CreateBillRunValidator.go(invalidData)

        expect(result.error).to.not.be.empty()
      })
    })

    describe('because "scheme" has an invalid value', () => {
      it('returns an error', async () => {
        const invalidData = {
          type: 'supplementary',
          scheme: 'INVALID',
          region: '07ae7f3a-2677-4102-b352-cc006828948c',
          user: 'test.user@defra.gov.uk'
        }

        const result = await CreateBillRunValidator.go(invalidData)

        expect(result.error).to.not.be.empty()
      })
    })

    describe('because "region" has an invalid value', () => {
      it('returns an error', async () => {
        const invalidData = {
          type: 'supplementary',
          scheme: 'sroc',
          region: 'INVALID',
          user: 'test.user@defra.gov.uk'
        }

        const result = await CreateBillRunValidator.go(invalidData)

        expect(result.error).to.not.be.empty()
      })
    })

    describe('because "user" has an invalid value', () => {
      it('returns an error', async () => {
        const invalidData = {
          type: 'supplementary',
          scheme: 'sroc',
          region: '07ae7f3a-2677-4102-b352-cc006828948c',
          user: 'INVALID'
        }

        const result = await CreateBillRunValidator.go(invalidData)

        expect(result.error).to.not.be.empty()
      })
    })

    describe('because "financialYearEnding" has an invalid value', () => {
      it('returns an error', async () => {
        const invalidData = {
          type: 'supplementary',
          scheme: 'sroc',
          region: '07ae7f3a-2677-4102-b352-cc006828948c',
          user: 'test.user@defra.gov.uk',
          financialYearEnding: 'INVALID'
        }

        const result = await CreateBillRunValidator.go(invalidData)

        expect(result.error).to.not.be.empty()
      })
    })
  })
})
