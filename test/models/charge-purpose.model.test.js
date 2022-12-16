'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ChargePurpose = require('../../app/models/charge-purpose.model.js')

describe('Charge Purpose model', () => {
  it('can successfully run a query', async () => {
    const query = await ChargePurpose.query()

    expect(query).to.exist()
  })

  describe('Relationships', () => {
    describe('when linking to charge element', () => {
      it('can successfully run a query', async () => {
        const query = await ChargePurpose.query()
          .innerJoinRelated('chargeElement')

        expect(query).to.exist()
      })
    })
  })
})
