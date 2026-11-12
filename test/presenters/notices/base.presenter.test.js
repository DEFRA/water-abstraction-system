// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import RecipientsFixture from 'water-abstraction-engine/test/fixtures/recipients.fixture.js'

// Thing under test
import * as BasePresenter from '../../../src/presenters/notices/base.presenter.js'

describe('Notices - Base presenter', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('#addressToCSV()', () => {
    let address

    describe('when there is an address', () => {
      describe('and all the address lines are present', () => {
        beforeEach(() => {
          address = RecipientsFixture.returnsNoticeLicenceHolder().contact

          address.address3 = 'The Cupboard Under the Stairs'
        })

        it('returns a fixed array of 7 strings with all the address lines', () => {
          const result = BasePresenter.addressToCSV(address)

          expect(result).toHaveLength(7)
          expect(result).toEqual([
            'Returnsholder',
            '4',
            'Privet Drive',
            'The Cupboard Under the Stairs',
            'Little Whinging',
            'Surrey',
            'WD25 7LR'
          ])
        })
      })

      describe('and some address lines are missing', () => {
        beforeEach(() => {
          address = RecipientsFixture.returnsNoticeLicenceHolder().contact

          delete address.address6
        })

        it('returns a fixed array of 7 strings with some of the address lines, and missing strings at the end of the array', () => {
          const result = BasePresenter.addressToCSV(address)

          expect(result).toHaveLength(7)
          expect(result).toEqual(['Returnsholder', '4', 'Privet Drive', 'Little Whinging', 'WD25 7LR', '', ''])
        })
      })

      describe('and all the address lines are missing', () => {
        beforeEach(() => {
          address = RecipientsFixture.returnsNoticeLicenceHolder().contact

          address.address1 = null
          address.address2 = null
          address.address3 = null
          address.address4 = null
          address.address5 = null
          address.address6 = null
          address.postcode = null
        })

        it('returns a fixed array of 7 strings with the contact name as address line 1, and the "INVALID ADDRESS" message', () => {
          const result = BasePresenter.addressToCSV(address)

          expect(result).toHaveLength(7)
          expect(result).toEqual([
            'Returnsholder',
            'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
            '',
            '',
            '',
            '',
            ''
          ])
        })
      })
    })

    describe('when there is no address', () => {
      beforeEach(() => {
        address = null
      })

      it('returns a fixed array of 7 empty strings', () => {
        const result = BasePresenter.addressToCSV(address)

        expect(result).toHaveLength(7)
        expect(result).toEqual(['', '', '', '', '', '', ''])
      })
    })
  })

  describe('#returnsPeriodText', () => {
    let returnsPeriod

    beforeEach(() => {
      returnsPeriod = {
        dueDate: '2025-11-28T00:00:00.000Z',
        endDate: '2025-10-31T00:00:00.000Z',
        name: 'allYear',
        startDate: '2024-11-01T00:00:00.000Z',
        summer: 'false'
      }
    })

    describe('when the return period name is "allYear"', () => {
      it('should return the correct text', () => {
        const result = BasePresenter.returnsPeriodText(returnsPeriod)

        expect(result).toEqual('Winter and all year annual 1 November 2024 to 31 October 2025')
      })
    })

    describe('when the return period name is "summer"', () => {
      beforeEach(() => {
        returnsPeriod.name = 'summer'
      })

      it('should return the correct text', () => {
        const result = BasePresenter.returnsPeriodText(returnsPeriod)

        expect(result).toEqual('Summer annual 1 November 2024 to 31 October 2025')
      })
    })

    describe('when the return period name is "Quarterly"', () => {
      beforeEach(() => {
        returnsPeriod.name = 'Quarterly'
      })

      it('should return the correct text', () => {
        const result = BasePresenter.returnsPeriodText(returnsPeriod)

        expect(result).toEqual('Quarterly 1 November 2024 to 31 October 2025')
      })
    })
  })
})
