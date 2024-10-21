'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const PurposeValidator = require('../../../../app/validators/return-requirements/setup/purpose.validator.js')

describe('Return Requirements Setup - Purpose validator', () => {
  const validPurposeIds = [
    '14794d57-1acf-4c91-8b48-4b1ec68bfd6f',
    '49088608-ee9f-491a-8070-6831240945ac',
    '1d03c79b-da97-4838-a68c-ccb613d54367',
    '02036782-81d2-43be-b6af-bf20898653e1'
  ]

  let purposes

  describe('when valid data is provided', () => {
    describe('that has purpose IDs, aliases and descriptions', () => {
      beforeEach(() => {
        purposes = [
          {
            id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f',
            alias: 'Spray irrigation indiscreet',
            description: 'Spray irrigation - direct'
          },
          {
            id: '1d03c79b-da97-4838-a68c-ccb613d54367',
            alias: 'Trickle irrigation all over',
            description: 'Trickle irrigation'
          }
        ]
      })

      it('confirms the data is valid', () => {
        const result = PurposeValidator.go(purposes, validPurposeIds)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })

    describe('that has purpose IDs, descriptions, but only some aliases', () => {
      beforeEach(() => {
        purposes = [
          {
            id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f',
            alias: 'Spray irrigation indiscreet',
            description: 'Spray irrigation - direct'
          },
          {
            id: '1d03c79b-da97-4838-a68c-ccb613d54367',
            alias: '',
            description: 'Trickle irrigation'
          }
        ]
      })

      it('confirms the data is valid', () => {
        const result = PurposeValidator.go(purposes, validPurposeIds)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })

    describe('that has purpose IDs, descriptions, and no aliases', () => {
      beforeEach(() => {
        purposes = [
          { id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f', alias: '', description: 'Spray irrigation - direct' },
          { id: '1d03c79b-da97-4838-a68c-ccb613d54367', alias: '', description: 'Trickle irrigation' }
        ]
      })

      it('confirms the data is valid', () => {
        const result = PurposeValidator.go(purposes, validPurposeIds)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })

    describe('that has purpose IDs but no descriptions or aliases', () => {
      beforeEach(() => {
        purposes = [
          { id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f', alias: '' },
          { id: '1d03c79b-da97-4838-a68c-ccb613d54367', alias: '' }
        ]
      })

      it('confirms the data is valid', () => {
        const result = PurposeValidator.go(purposes, validPurposeIds)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when invalid data is provided', () => {
    describe('because it contains an invalid purpose id', () => {
      beforeEach(() => {
        purposes = [
          { id: 'c73399a6-2194-4d50-b4c8-c4fcf225c711', alias: '', description: 'Spray irrigation - direct' }
        ]
      })

      it('fails validation', () => {
        const result = PurposeValidator.go(purposes, validPurposeIds)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select any purpose for the requirements for returns')
      })
    })

    describe('because it does not contain a purpose id', () => {
      beforeEach(() => {
        purposes = [
          { alias: 'Spray irrigation indiscreet', description: 'Spray irrigation - direct' }
        ]
      })

      it('fails validation', () => {
        const result = PurposeValidator.go(purposes, validPurposeIds)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select any purpose for the requirements for returns')
      })
    })

    describe('because it contains an an alias that is too long', () => {
      beforeEach(() => {
        // Max is 100 characters. This is 101 characters
        purposes = [
          {
            id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f',
            alias: 'THGBk2GM85EyXB54SsfenU2yWiKjDuPTcJCrPfTsSzojNvj6ciVmI3PXJ2fisQgXWfSI4ZPIqV5GLPtR15qbcw3Hamoeit764Cojz',
            description: 'Spray irrigation - direct'
          }
        ]
      })

      it('fails validation', () => {
        const result = PurposeValidator.go(purposes, validPurposeIds)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Purpose description must be 100 characters or less')
      })
    })

    describe('because it is empty', () => {
      beforeEach(() => {
        purposes = []
      })

      it('fails validation', () => {
        const result = PurposeValidator.go(purposes, validPurposeIds)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select any purpose for the requirements for returns')
      })
    })
  })
})
