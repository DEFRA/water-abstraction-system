'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const LegacyDbSnakeCaseMappersLib = require('../../app/lib/legacy-db-snake-case-mappers.lib.js')

// NOTE: Ideally, we would have liked to spy on the Objection snakeCase and camelCase methods to confirm they are or are
// not being called depending on the circumstance. But all our attempts with Sinon failed (a common issue we have when
// testing with Objection.js)
describe('Legacy DB Snake Case Mappers lib', () => {
  describe('#legacyDbSnakeCaseMappers', () => {
    // We always pass in these options. See knexfile.application.js and how legacyDbSnakeCaseMappers() is called
    const options = { underscoreBeforeDigits: true }

    describe('when called', () => {
      it('returns an object containing knex wrapIdentifier() and postProcessResponse() hooks', (options) => {
        const result = LegacyDbSnakeCaseMappersLib.legacyDbSnakeCaseMappers()

        expect(result).to.include('wrapIdentifier')
        expect(result).to.include('postProcessResponse')
      })
    })

    describe('when the postProcessResponse() hook it creates is used', () => {
      const dbResult = [
        {
          address_line_1: '10 Downing Street',
          purpose: 'Residence of the prime minster',
          is_occupied: true,
          section_127_Agreement: false,
          crm_v2: 'I am really a schema disguised as a table column :-)'
        }
      ]

      it('handles the knex db result object as expected', () => {
        const identifierMapping = LegacyDbSnakeCaseMappersLib.legacyDbSnakeCaseMappers(options)
        const result = identifierMapping.postProcessResponse(dbResult)

        expect(result).to.equal([
          {
            addressLine1: '10 Downing Street',
            purpose: 'Residence of the prime minster',
            isOccupied: true,
            section127Agreement: false,
            crm_v2: 'I am really a schema disguised as a table column :-)'
          }
        ])
      })
    })

    describe('when the wrapIdentifier() hook it creates is used', () => {
      function origWrap(identifier) {
        return identifier
      }

      describe('and passed the identifier "addressLine1"', () => {
        it('returns "address_line_1"', () => {
          const identifierMapping = LegacyDbSnakeCaseMappersLib.legacyDbSnakeCaseMappers(options)
          const result = identifierMapping.wrapIdentifier('addressLine1', origWrap)

          expect(result).to.equal('address_line_1')
        })
      })

      describe('and passed the identifier "purpose"', () => {
        it('returns "purpose"', () => {
          const identifierMapping = LegacyDbSnakeCaseMappersLib.legacyDbSnakeCaseMappers(options)
          const result = identifierMapping.wrapIdentifier('purpose', origWrap)

          expect(result).to.equal('purpose')
        })
      })

      describe('and passed the identifier "isOccupied"', () => {
        it('returns "is_occupied"', () => {
          const identifierMapping = LegacyDbSnakeCaseMappersLib.legacyDbSnakeCaseMappers(options)
          const result = identifierMapping.wrapIdentifier('isOccupied', origWrap)

          expect(result).to.equal('is_occupied')
        })
      })

      describe('and passed the identifier "section127Agreement"', () => {
        it('returns "section_127_agreement"', () => {
          const identifierMapping = LegacyDbSnakeCaseMappersLib.legacyDbSnakeCaseMappers(options)
          const result = identifierMapping.wrapIdentifier('section127Agreement', origWrap)

          expect(result).to.equal('section_127_agreement')
        })
      })

      describe('and passed the identifier "crm_v2"', () => {
        it('returns "crm_v2" (it does no formatting)', () => {
          const identifierMapping = LegacyDbSnakeCaseMappersLib.legacyDbSnakeCaseMappers(options)
          const result = identifierMapping.wrapIdentifier('crm_v2', origWrap)

          expect(result).to.equal('crm_v2')
        })
      })

      describe('and passed the identifier "foo_v2"', () => {
        it('returns "foo_v_2" (confirmation on crm_v2 is special!)', () => {
          const identifierMapping = LegacyDbSnakeCaseMappersLib.legacyDbSnakeCaseMappers(options)
          const result = identifierMapping.wrapIdentifier('foo_v2', origWrap)

          expect(result).to.equal('foo_v_2')
        })
      })
    })
  })
})
