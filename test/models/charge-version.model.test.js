'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ChargeVersion = require('../../app/models/charge-version.model.js')

describe('ChargeVersion model', () => {
  it('can successfully run a query', async () => {
    const query = await ChargeVersion.query()

    expect(query).to.exist()
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      it('can successfully run a query', async () => {
        const query = await ChargeVersion.query()
          .innerJoinRelated('licence')

        expect(query).to.exist()
      })
    })

    describe('when linking to charge element', () => {
      it('can successfully run a query', async () => {
        const query = await ChargeVersion.query()
          .innerJoinRelated('chargeElement')

        expect(query).to.exist()
      })
    })
  })
})
