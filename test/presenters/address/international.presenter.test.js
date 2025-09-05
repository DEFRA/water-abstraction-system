'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { countryLookup } = require('../../../app/presenters/address/base-address.presenter.js')

// Thing under test
const InternationalPresenter = require('../../../app/presenters/address/international.presenter.js')

describe('Address - International Presenter', () => {
  let session

  beforeEach(async () => {
    session = {
      id: 'fecd5f15-bacf-4b3d-bdcd-ef279a97b061',
      addressJourney: {
        activeNavBar: 'manage',
        address: {},
        backLink: {
          href: '/system/notices/setup/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/contact-type',
          text: 'Back'
        },
        redirectUrl: '/system/notices/setup/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/add-recipient'
      }
    }
  })

  it('correctly presents the data', () => {
    const result = InternationalPresenter.go(session)

    expect(result).to.equal({
      activeNavBar: 'manage',
      addressLine1: null,
      addressLine2: null,
      addressLine3: null,
      addressLine4: null,
      backLink: {
        href: '/system/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/postcode',
        text: 'Back'
      },
      country: countryLookup(),
      pageTitle: 'Enter the international address',
      pageTitleCaption: null,
      postcode: null
    })
  })

  describe('the "addressLine1" property', () => {
    describe('when the property has not been set', () => {
      it('returns null', () => {
        const result = InternationalPresenter.go(session)

        expect(result.addressLine1).to.equal(null)
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.address.addressLine1 = 'Fake Farm'
      })

      it('returns the set value', () => {
        const result = InternationalPresenter.go(session)

        expect(result.addressLine1).to.equal('Fake Farm')
      })
    })
  })

  describe('the "addressLine2" property', () => {
    describe('when the property has not been set', () => {
      it('returns null', () => {
        const result = InternationalPresenter.go(session)

        expect(result.addressLine2).to.equal(null)
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.address.addressLine2 = '1 Fake Street'
      })

      it('returns the set value', () => {
        const result = InternationalPresenter.go(session)

        expect(result.addressLine2).to.equal('1 Fake Street')
      })
    })
  })

  describe('the "addressLine3" property', () => {
    describe('when the property has not been set', () => {
      it('returns null', () => {
        const result = InternationalPresenter.go(session)

        expect(result.addressLine3).to.equal(null)
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.address.addressLine3 = 'Fake Village'
      })

      it('returns the set value', () => {
        const result = InternationalPresenter.go(session)

        expect(result.addressLine3).to.equal('Fake Village')
      })
    })
  })

  describe('the "addressLine4" property', () => {
    describe('when the property has not been set', () => {
      it('returns null', () => {
        const result = InternationalPresenter.go(session)

        expect(result.addressLine4).to.equal(null)
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.address.addressLine4 = 'Fake City'
      })

      it('returns the set value', () => {
        const result = InternationalPresenter.go(session)

        expect(result.addressLine4).to.equal('Fake City')
      })
    })
  })

  describe('the "country" property', () => {
    describe('when the property has not been set', () => {
      it('returns the list of countries with the "Select a country" option selected', () => {
        const result = InternationalPresenter.go(session)

        expect(result.country).to.equal(countryLookup())
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.address.country = 'France'
      })

      it('returns the list of countries with the matching country selected', () => {
        const result = InternationalPresenter.go(session)

        expect(result.country).to.equal(countryLookup('France'))
      })
    })
  })

  describe('the "pageTitleCaption" property', () => {
    describe('when the property has not been configured', () => {
      it('returns null', () => {
        const result = InternationalPresenter.go(session)

        expect(result.pageTitleCaption).to.equal(null)
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.pageTitleCaption = 'Super awesome caption'
      })

      it('returns the set value', () => {
        const result = InternationalPresenter.go(session)

        expect(result.pageTitleCaption).to.equal('Super awesome caption')
      })
    })
  })

  describe('the "postcode" property', () => {
    describe('when the property has not been set', () => {
      it('returns null', () => {
        const result = InternationalPresenter.go(session)

        expect(result.postcode).to.equal(null)
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.address.postcode = 'SW1A 1AA'
      })

      it('returns the set value', () => {
        const result = InternationalPresenter.go(session)

        expect(result.postcode).to.equal('SW1A 1AA')
      })
    })
  })
})
