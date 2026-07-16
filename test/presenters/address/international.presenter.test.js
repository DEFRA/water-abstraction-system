// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import { countryLookup } from '../../../app/presenters/address/base-address.presenter.js'

// Thing under test
import InternationalPresenter from '../../../app/presenters/address/international.presenter.js'

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
    const result = InternationalPresenter(session)

    expect(result).toEqual({
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
        const result = InternationalPresenter(session)

        expect(result.addressLine1).toEqual(null)
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.address.addressLine1 = 'Fake Farm'
      })

      it('returns the set value', () => {
        const result = InternationalPresenter(session)

        expect(result.addressLine1).toEqual('Fake Farm')
      })
    })
  })

  describe('the "addressLine2" property', () => {
    describe('when the property has not been set', () => {
      it('returns null', () => {
        const result = InternationalPresenter(session)

        expect(result.addressLine2).toEqual(null)
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.address.addressLine2 = '1 Fake Street'
      })

      it('returns the set value', () => {
        const result = InternationalPresenter(session)

        expect(result.addressLine2).toEqual('1 Fake Street')
      })
    })
  })

  describe('the "addressLine3" property', () => {
    describe('when the property has not been set', () => {
      it('returns null', () => {
        const result = InternationalPresenter(session)

        expect(result.addressLine3).toEqual(null)
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.address.addressLine3 = 'Fake Village'
      })

      it('returns the set value', () => {
        const result = InternationalPresenter(session)

        expect(result.addressLine3).toEqual('Fake Village')
      })
    })
  })

  describe('the "addressLine4" property', () => {
    describe('when the property has not been set', () => {
      it('returns null', () => {
        const result = InternationalPresenter(session)

        expect(result.addressLine4).toEqual(null)
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.address.addressLine4 = 'Fake City'
      })

      it('returns the set value', () => {
        const result = InternationalPresenter(session)

        expect(result.addressLine4).toEqual('Fake City')
      })
    })
  })

  describe('the "country" property', () => {
    describe('when the property has not been set', () => {
      it('returns the list of countries with the "Select a country" option selected', () => {
        const result = InternationalPresenter(session)

        expect(result.country).toEqual(countryLookup())
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.address.country = 'France'
      })

      it('returns the list of countries with the matching country selected', () => {
        const result = InternationalPresenter(session)

        expect(result.country).toEqual(countryLookup('France'))
      })
    })
  })

  describe('the "pageTitleCaption" property', () => {
    describe('when the property has not been configured', () => {
      it('returns null', () => {
        const result = InternationalPresenter(session)

        expect(result.pageTitleCaption).toEqual(null)
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.pageTitleCaption = 'Super awesome caption'
      })

      it('returns the set value', () => {
        const result = InternationalPresenter(session)

        expect(result.pageTitleCaption).toEqual('Super awesome caption')
      })
    })
  })

  describe('the "postcode" property', () => {
    describe('when the property has not been set', () => {
      it('returns null', () => {
        const result = InternationalPresenter(session)

        expect(result.postcode).toEqual(null)
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.address.postcode = 'SW1A 1AA'
      })

      it('returns the set value', () => {
        const result = InternationalPresenter(session)

        expect(result.postcode).toEqual('SW1A 1AA')
      })
    })
  })
})
