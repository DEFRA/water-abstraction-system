'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')

// Thing under test
const LoadService = require('../../../../app/services/data/load/load.service.js')

describe('Load service', () => {
  let payload

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when the service is called', () => {
    describe('with an valid payload', () => {
      it('returns the generated IDs', async () => {
        const result = await LoadService.go(payload)

        expect(result).to.equal({})
      })
    })

    describe('with an invalid payload', () => {
      it('returns the generated IDs', async () => {
        await expect(LoadService.go(payload))
          .to
          .reject()
      })
    })

    describe('with an empty payload', () => {
      it('returns the generated IDs', async () => {
        const result = await LoadService.go(payload)

        expect(result).to.equal({})
      })
    })
  })
})
