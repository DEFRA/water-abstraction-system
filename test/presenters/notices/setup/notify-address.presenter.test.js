'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const NotifyAddressPresenter = require('../../../../app/presenters/notices/setup/notify-address.presenter.js')

describe('Notices - Setup - Notify Address presenter', () => {
  let contact

  beforeEach(() => {
    // NOTE: To remove some setup duplication, we start with a fully populated address and then amend accordingly in the
    // tests
    contact = {
      // Name
      name: 'Mr J H Watson',
      // Address
      address1: 'Sherlock Holmes Consulting Detective',
      address2: '221b Baker Street',
      address3: 'Regents Park',
      address4: 'Westminster',
      address5: 'London',
      address6: 'Central London',
      postcode: 'NW1 6XE',
      country: 'England'
    }
  })

  describe('when all possible address fields are populated', () => {
    beforeEach(() => {
      // By setting the country to a Crown Dependency, we ensure that it is included forcing the maximum number of
      // possible address parts
      contact.country = 'JERSEY'
    })

    it('condenses the middle address parts', () => {
      const result = NotifyAddressPresenter.go(contact)

      expect(result).to.equal({
        address_line_1: 'Mr J H Watson',
        address_line_2: 'Sherlock Holmes Consulting Detective',
        address_line_3: '221b Baker Street',
        address_line_4: 'Regents Park, Westminster',
        address_line_5: 'London, Central London',
        address_line_6: 'JERSEY',
        address_line_7: 'NW1 6XE'
      })
    })
  })

  describe('when some address fields are not populated', () => {
    beforeEach(() => {
      contact.address3 = null
      contact.address4 = null
      contact.address6 = null
    })

    it('excludes them from the result', () => {
      const result = NotifyAddressPresenter.go(contact)

      expect(result).to.equal({
        address_line_1: 'Mr J H Watson',
        address_line_2: 'Sherlock Holmes Consulting Detective',
        address_line_3: '221b Baker Street',
        address_line_4: 'London',
        address_line_5: 'NW1 6XE'
      })
    })
  })

  describe('when "addressLine1" is not populated', () => {
    // NOTE: This test was to ensure that _addressLine1() can handle addressLine1 not being populated.
    beforeEach(() => {
      contact.address1 = null
    })

    it('excludes it from the result', () => {
      const result = NotifyAddressPresenter.go(contact)

      expect(result).to.equal({
        address_line_1: 'Mr J H Watson',
        address_line_2: '221b Baker Street',
        address_line_3: 'Regents Park',
        address_line_4: 'Westminster',
        address_line_5: 'London',
        address_line_6: 'Central London',
        address_line_7: 'NW1 6XE'
      })
    })
  })

  describe('when the derived name and "addressLine1" are the same', () => {
    beforeEach(() => {
      contact.name = 'Sherlock Holmes Consulting Detective'
    })

    it('removes the duplication from the result', () => {
      const result = NotifyAddressPresenter.go(contact)

      expect(result).to.equal({
        address_line_1: 'Sherlock Holmes Consulting Detective',
        address_line_2: '221b Baker Street',
        address_line_3: 'Regents Park',
        address_line_4: 'Westminster',
        address_line_5: 'London',
        address_line_6: 'Central London',
        address_line_7: 'NW1 6XE'
      })
    })
  })

  describe('when the contact has a UK address', () => {
    describe('and "country" is populated', () => {
      describe('and it is one in the United Kingdom', () => {
        it('excludes "country" in the result', () => {
          const result = NotifyAddressPresenter.go(contact)

          expect(result).to.equal({
            address_line_1: 'Mr J H Watson',
            address_line_2: 'Sherlock Holmes Consulting Detective',
            address_line_3: '221b Baker Street',
            address_line_4: 'Regents Park',
            address_line_5: 'Westminster, London',
            address_line_6: 'Central London',
            address_line_7: 'NW1 6XE'
          })
        })
      })

      describe('and it is one of the Crown Dependents', () => {
        beforeEach(() => {
          contact.country = 'JERSEY'
        })

        it('includes "country" in the result _before_ the postcode', () => {
          const result = NotifyAddressPresenter.go(contact)

          expect(result).to.equal({
            address_line_1: 'Mr J H Watson',
            address_line_2: 'Sherlock Holmes Consulting Detective',
            address_line_3: '221b Baker Street',
            address_line_4: 'Regents Park, Westminster',
            address_line_5: 'London, Central London',
            address_line_6: 'JERSEY',
            address_line_7: 'NW1 6XE'
          })
        })
      })
    })

    describe('and "country" is not populated', () => {
      beforeEach(() => {
        contact.country = null
      })

      it('ensures "postcode" is the last address line', () => {
        const result = NotifyAddressPresenter.go(contact)

        expect(result).to.equal({
          address_line_1: 'Mr J H Watson',
          address_line_2: 'Sherlock Holmes Consulting Detective',
          address_line_3: '221b Baker Street',
          address_line_4: 'Regents Park',
          address_line_5: 'Westminster, London',
          address_line_6: 'Central London',
          address_line_7: 'NW1 6XE'
        })
      })
    })
  })

  describe('when the contact has an international address', () => {
    beforeEach(() => {
      contact = {
        // Name
        name: 'Professor J H Moriarty',
        // Address
        address1: 'Mathematical Computer Consulting',
        address2: 'Gasthaus Zwirgi',
        address3: 'Rychenbach Falls',
        address4: 'Scheideggstrasse 451',
        address5: 'Meiringen',
        address6: null,
        postcode: '3860 Schattenhalb',
        country: 'Switzerland'
      }
    })

    describe('and "postcode" is populated', () => {
      it('includes "country" in the result _after_ the postcode', () => {
        const result = NotifyAddressPresenter.go(contact)

        expect(result).to.equal({
          address_line_1: 'Professor J H Moriarty',
          address_line_2: 'Mathematical Computer Consulting',
          address_line_3: 'Gasthaus Zwirgi',
          address_line_4: 'Rychenbach Falls',
          address_line_5: 'Scheideggstrasse 451, Meiringen',
          address_line_6: '3860 Schattenhalb',
          address_line_7: 'Switzerland'
        })
      })
    })

    describe('and "postcode" is not populated', () => {
      beforeEach(() => {
        contact.postcode = null
      })

      it('ensures "country" is the last address line', () => {
        const result = NotifyAddressPresenter.go(contact)

        expect(result).to.equal({
          address_line_1: 'Professor J H Moriarty',
          address_line_2: 'Mathematical Computer Consulting',
          address_line_3: 'Gasthaus Zwirgi',
          address_line_4: 'Rychenbach Falls',
          address_line_5: 'Scheideggstrasse 451',
          address_line_6: 'Meiringen',
          address_line_7: 'Switzerland'
        })
      })
    })
  })

  describe('when the contact has an invalid address', () => {
    describe('because the "postcode" is missing', () => {
      beforeEach(() => {
        contact.postcode = null
      })

      describe('as well as the "country"', () => {
        beforeEach(() => {
          contact.country = null
        })

        it('returns all populated address parts plus an "INVALID" message', () => {
          const result = NotifyAddressPresenter.go(contact)

          expect(result).to.equal({
            address_line_1: 'Mr J H Watson',
            address_line_2: 'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
            address_line_3: 'Sherlock Holmes Consulting Detective',
            address_line_4: '221b Baker Street',
            address_line_5: 'Regents Park',
            address_line_6: 'Westminster',
            address_line_7: 'London',
            address_line_8: 'Central London'
          })
        })
      })

      describe('and "country" is in the UK', () => {
        it('returns all populated address parts plus an "INVALID" message', () => {
          const result = NotifyAddressPresenter.go(contact)

          expect(result).to.equal({
            address_line_1: 'Mr J H Watson',
            address_line_2: 'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
            address_line_3: 'Sherlock Holmes Consulting Detective',
            address_line_4: '221b Baker Street',
            address_line_5: 'Regents Park',
            address_line_6: 'Westminster',
            address_line_7: 'London',
            address_line_8: 'Central London',
            address_line_9: 'England'
          })
        })
      })

      describe('and the country is a Crown Dependency', () => {
        beforeEach(() => {
          contact.country = 'JERSEY'
        })

        it('returns all populated address parts plus an "INVALID" message', () => {
          const result = NotifyAddressPresenter.go(contact)

          expect(result).to.equal({
            address_line_1: 'Mr J H Watson',
            address_line_2: 'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
            address_line_3: 'Sherlock Holmes Consulting Detective',
            address_line_4: '221b Baker Street',
            address_line_5: 'Regents Park',
            address_line_6: 'Westminster',
            address_line_7: 'London',
            address_line_8: 'Central London',
            address_line_9: 'JERSEY'
          })
        })
      })
    })

    describe('because the postcode is not a valid UK postcode (country is UK or Crown Dependent)', () => {
      beforeEach(() => {
        contact.postcode = '80802'
      })

      it('returns all populated address parts plus an "INVALID" message', () => {
        const result = NotifyAddressPresenter.go(contact)

        expect(result).to.equal({
          address_line_1: 'Mr J H Watson',
          address_line_2: 'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
          address_line_3: 'Sherlock Holmes Consulting Detective',
          address_line_4: '221b Baker Street',
          address_line_5: 'Regents Park',
          address_line_6: 'Westminster',
          address_line_7: 'London',
          address_line_8: 'Central London',
          address_line_9: '80802',
          address_line_10: 'England'
        })
      })
    })

    describe('because the address contains a line that starts with a special character', () => {
      beforeEach(() => {
        contact.address2 = '(Admin) 221b Baker Street'
      })

      it('returns all populated address parts plus an "INVALID" message', () => {
        const result = NotifyAddressPresenter.go(contact)

        expect(result).to.equal({
          address_line_1: 'Mr J H Watson',
          address_line_2: 'INVALID ADDRESS - A line starts with special character',
          address_line_3: 'Sherlock Holmes Consulting Detective',
          address_line_4: '(Admin) 221b Baker Street',
          address_line_5: 'Regents Park',
          address_line_6: 'Westminster',
          address_line_7: 'London',
          address_line_8: 'Central London',
          address_line_9: 'NW1 6XE',
          address_line_10: 'England'
        })
      })
    })
  })
})
