'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Helpers
const fixtureAgreements = require('../fixtures/licences/agreements.js')

// Thing under test
const LicenceAgreementsMapper = require('../../../../app/import/licence/mappers/agreements.mapper.js')

describe.only('Import Licence Agreements Mapper', () => {
  let agreements

  beforeEach(() => {
    agreements = fixtureAgreements
  })

  describe('when provided with a import licence', () => {
    it('correctly maps the data to the licence', () => {
      const result = LicenceAgreementsMapper.go(agreements.tptAgreements, agreements.s130Agreements)

      expect(result).to.equal([
        {
          agreementCode: 'S127',
          endDate: null,
          startDate: '2005-06-03'
        }
      ])
    })
  })
})
