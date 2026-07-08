// Thing under test
import MultipleEntriesPresenter from '../../../../app/presenters/return-logs/setup/multiple-entries.presenter.js'

describe('Return Logs Setup - Multiple Entries presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      returnReference: '012345',
      lines: [
        { startDate: new Date('2023-04-01').toISOString(), endDate: new Date('2023-04-30').toISOString() },
        { startDate: new Date('2023-05-01').toISOString(), endDate: new Date('2023-05-31').toISOString() }
      ],
      returnsFrequency: 'month',
      reported: 'abstractionVolumes'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = MultipleEntriesPresenter(session)

      expect(result).toEqual({
        backLink: { href: '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/check', text: 'Back' },
        endDate: '1 May 2023',
        frequency: 'monthly',
        lineCount: 2,
        measurementType: 'volumes',
        multipleEntries: null,
        pageTitle: 'Enter multiple monthly volumes',
        pageTitleCaption: 'Return reference 012345',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        startDate: '1 April 2023'
      })
    })
  })

  describe('the "measurementType" property', () => {
    describe('when the user has previously selected "abstractionVolumes" as the reported type', () => {
      beforeEach(() => {
        session.reported = 'abstractionVolumes'
      })

      it('returns "measurementType" back as "volumes"', () => {
        const result = MultipleEntriesPresenter(session)

        expect(result.measurementType).toEqual('volumes')
      })
    })

    describe('when the user has previously selected "meterReadings" as the reported type', () => {
      beforeEach(() => {
        session.reported = 'meterReadings'
      })

      it('returns "measurementType" back as "readings"', () => {
        const result = MultipleEntriesPresenter(session)

        expect(result.measurementType).toEqual('readings')
      })
    })
  })

  describe('the "frequency" property', () => {
    describe('when the return frequency is "day"', () => {
      beforeEach(() => {
        session.returnsFrequency = 'day'
      })

      it('returns "frequency" back as "daily"', () => {
        const result = MultipleEntriesPresenter(session)

        expect(result.frequency).toEqual('daily')
      })
    })

    describe('when the return frequency is "week"', () => {
      beforeEach(() => {
        session.returnsFrequency = 'week'
      })

      it('returns "frequency" back as "weekly"', () => {
        const result = MultipleEntriesPresenter(session)

        expect(result.frequency).toEqual('weekly')
      })
    })

    describe('when the return frequency is "month"', () => {
      beforeEach(() => {
        session.returnsFrequency = 'month'
      })

      it('returns "frequency" back as "monthly"', () => {
        const result = MultipleEntriesPresenter(session)

        expect(result.frequency).toEqual('monthly')
      })
    })
  })

  describe('the "multipleEntries" property', () => {
    describe('when the user has previously entered "multiple entries"', () => {
      beforeEach(() => {
        session.multipleEntries = '1,2,3,4,5,6,7,8,9,10,11,12'
      })

      it('returns the "multipleEntries" property populated', () => {
        const result = MultipleEntriesPresenter(session)

        expect(result.multipleEntries).toEqual('1,2,3,4,5,6,7,8,9,10,11,12')
      })
    })
  })
})
