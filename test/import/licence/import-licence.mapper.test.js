'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Helpers
const fixtureLicence = require('./fixtures/licences/licence.js')
const fixtureAgreements = require('./fixtures/licences/agreements.js')

// Thing under test
const ImportLicenceMapper = require('../../../app/import/licence/import-licence.mapper.js')

describe.only('Import Licence Mapper', () => {
  let licence

  beforeEach(() => {
    licence = {
      licence: fixtureLicence,
      ...fixtureAgreements
    }
  })

  describe('when provided with a import licence', () => {
    it('correctly maps the data to the licence', () => {
      const result = ImportLicenceMapper.go(licence)

      expect(result).to.equal({
        agreements: [
          {
            agreementCode: 'S127',
            endDate: null,
            startDate: '2005-06-03'
          }
        ]
      })
    })
  })
})
