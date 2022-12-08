'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const Region = require('../../app/models/region.model.js')

describe('Region model', () => {
  it('can successfully run a query', async () => {
    const result = await Region.query()

    expect(result).to.exist()
  })

  describe('Relationships', () => {
    describe('when linking to licences', () => {
      it('can successfully run a query', async () => {
        const result = await Region.query()
          .innerJoinRelated('licences')

        expect(result).to.exist()
      })
    })
  })
})
