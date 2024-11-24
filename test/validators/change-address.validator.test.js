'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ChangeAddressValidator = require('../../app/validators/change-address.validator.js')

describe('Create Bill Run validator', () => {
  const completeAddress = {
    id: '752446c0-a649-4383-967c-4e4fb6e13dde',
    addressLine1: 'Building 12',
    addressLine2: 'SCP Headquarters',
    addressLine3: 'East campus',
    addressLine4: '227 Roundly Rd',
    town: 'Leeds',
    county: 'West Yorkshire',
    country: 'United Kingdom',
    postcode: 'LS8 4HS',
    uprn: 97564,
    source: 'ea-address-facade'
  }
  const completeAgentCompany = {
    id: 'aa0dd66a-6f38-4ea6-b2e1-9639cb51c792',
    type: 'organisation',
    organisationType: 'limitedCompany',
    name: 'SCP',
    companyNumber: 'OE008471'
  }
  const completeContact = {
    id: '9969a9e6-c440-4065-ba2c-16566cb59575',
    type: 'person',
    salutation: 'Mrs',
    firstName: 'Margherita',
    middleInitials: 'OE008471',
    lastName: 'Villar',
    suffix: 'MBE',
    department: 'Humanoid Risk Assessment',
    source: 'wrls',
    isTest: false
  }

  let data

  describe('when valid data is provided', () => {
    describe('and it is the minimalist valid data allowed', () => {
      beforeEach(() => {
        data = {
          address: {}
        }
      })

      it('confirms the data is valid', () => {
        const result = ChangeAddressValidator.go(data)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })

    describe('which includes only a valid address', () => {
      beforeEach(() => {
        data = {
          address: {
            ...completeAddress
          }
        }
      })

      it('confirms the data is valid', () => {
        const result = ChangeAddressValidator.go(data)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
        expect(result.value.address.id).to.equal(data.address.id)
      })
    })

    describe('which includes a minimal address and a valid agent company', () => {
      beforeEach(() => {
        data = {
          agentCompany: {
            ...completeAgentCompany
          },
          address: {}
        }
      })

      it('confirms the data is valid', () => {
        const result = ChangeAddressValidator.go(data)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
        expect(result.value.agentCompany.id).to.equal(data.agentCompany.id)
      })
    })

    describe('which includes a minimal address and a valid contact', () => {
      beforeEach(() => {
        data = {
          contact: {
            ...completeContact
          },
          address: {}
        }
      })

      it('confirms the data is valid', () => {
        const result = ChangeAddressValidator.go(data)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
        expect(result.value.contact.id).to.equal(data.contact.id)
      })
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no "address" is provided', () => {
      beforeEach(() => {
        data = {
          agentCompany: {},
          contact: {}
        }
      })

      it('returns an error', () => {
        const result = ChangeAddressValidator.go(data)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('"address" is required')
      })
    })

    describe('and the issue is in the agent company', () => {
      beforeEach(() => {
        data = {
          agentCompany: {
            ...completeAgentCompany
          },
          address: {}
        }
      })

      describe('because "type" is unrecognised', () => {
        beforeEach(() => {
          data.agentCompany.type = 'INVALID'
        })

        it('returns an error', () => {
          const result = ChangeAddressValidator.go(data)

          expect(result.value).to.exist()
          expect(result.error).to.exist()
          expect(result.error.details[0].message).startsWith('"agentCompany.type" must be one of')
        })
      })

      describe('because "organisationType" is unrecognised', () => {
        beforeEach(() => {
          data.agentCompany.organisationType = 'INVALID'
        })

        it('returns an error', () => {
          const result = ChangeAddressValidator.go(data)

          expect(result.value).to.exist()
          expect(result.error).to.exist()
          expect(result.error.details[0].message).startsWith('"agentCompany.organisationType" must be one of')
        })
      })
    })

    describe('and it is an issue in the contact', () => {
      beforeEach(() => {
        data = {
          contact: {
            ...completeContact
          },
          address: {}
        }
      })

      describe('because "type" is unrecognised', () => {
        beforeEach(() => {
          data.contact.type = 'INVALID'
        })

        it('returns an error', () => {
          const result = ChangeAddressValidator.go(data)

          expect(result.value).to.exist()
          expect(result.error).to.exist()
          expect(result.error.details[0].message).startsWith('"contact.type" must be one of')
        })
      })

      describe('because "source" is unrecognised', () => {
        beforeEach(() => {
          data.contact.source = 'INVALID'
        })

        it('returns an error', () => {
          const result = ChangeAddressValidator.go(data)

          expect(result.value).to.exist()
          expect(result.error).to.exist()
          expect(result.error.details[0].message).startsWith('"contact.source" must be one of')
        })
      })
    })
  })
})
