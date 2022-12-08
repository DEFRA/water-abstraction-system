'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const Licence = require('../../app/models/licence.model.js')

describe('Licence model', () => {
  it('can successfully run a query', async () => {
    const query = await Licence.query()

    expect(query).to.exist()
  })

  describe('Relationships', () => {
    describe('when linking to charge versions', () => {
      it('can successfully run a query', async () => {
        const query = await Licence.query()
          .innerJoinRelated('chargeVersions')

        expect(query).to.exist()
      })
    })

    describe('when linking to region', () => {
      it('can successfully run a query', async () => {
        const query = await Licence.query()
          .innerJoinRelated('region')

        expect(query).to.exist()
      })
    })
  })
})
