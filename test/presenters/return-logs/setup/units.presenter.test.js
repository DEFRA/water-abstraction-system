// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import UnitsPresenter from '../../../../app/presenters/return-logs/setup/units.presenter.js'

describe('Return Logs Setup - Units presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      returnReference: '012345'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = UnitsPresenter(session)

      expect(result).toEqual({
        backLink: { href: '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/reported', text: 'Back' },
        pageTitle: 'Which units were used?',
        pageTitleCaption: 'Return reference 012345',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        units: null
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the user has come from the "check" page', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('returns a link back to the "check" page', () => {
        const result = UnitsPresenter(session)

        expect(result.backLink.href).toEqual('/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/check')
      })
    })

    describe('when the user has come from the "abstractionVolumes" route', () => {
      it('returns a link back to the "Reported" page on', () => {
        const result = UnitsPresenter(session)

        expect(result.backLink.href).toEqual('/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/reported')
      })
    })

    describe('when the user has come from the "meterReadings" route', () => {
      beforeEach(() => {
        session.reported = 'meterReadings'
      })

      it('returns a link back to the "Start reading" page on', () => {
        const result = UnitsPresenter(session)

        expect(result.backLink.href).toEqual(
          '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/start-reading'
        )
      })
    })
  })

  describe('the "units" property', () => {
    describe('when the user has previously selected "Cubic Metres" as the reported type', () => {
      beforeEach(() => {
        session.units = 'cubicMetres'
      })

      it('returns the "units" property populated to re-select the option', () => {
        const result = UnitsPresenter(session)

        expect(result.units).toEqual('cubicMetres')
      })
    })

    describe('when the user has previously selected "Litres" as the reported type', () => {
      beforeEach(() => {
        session.units = 'litres'
      })

      it('returns the "units" property populated to re-select the option', () => {
        const result = UnitsPresenter(session)

        expect(result.units).toEqual('litres')
      })
    })

    describe('when the user has previously selected "Megalitres" as the reported type', () => {
      beforeEach(() => {
        session.units = 'megalitres'
      })

      it('returns the "units" property populated to re-select the option', () => {
        const result = UnitsPresenter(session)

        expect(result.units).toEqual('megalitres')
      })
    })

    describe('when the user has previously selected "Gallons" as the reported type', () => {
      beforeEach(() => {
        session.units = 'gallons'
      })

      it('returns the "units" property populated to re-select the option', () => {
        const result = UnitsPresenter(session)

        expect(result.units).toEqual('gallons')
      })
    })
  })
})
