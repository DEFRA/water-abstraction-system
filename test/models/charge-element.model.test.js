'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ChargeElement = require('../../app/models/charge-element.model.js')

describe('Charge Element model', () => {
  it('can successfully run a query', async () => {
    const query = await ChargeElement.query()

    expect(query).to.exist()
  })

  describe('Relationships', () => {
    describe('when linking to charge version', () => {
      it('can successfully run a query', async () => {
        const query = await ChargeElement.query()
          .innerJoinRelated('chargeVersion')

        expect(query).to.exist()
      })
    })
  })
})
