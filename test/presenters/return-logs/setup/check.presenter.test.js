'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const CheckPresenter = require('../../../../app/presenters/return-logs/setup/check.presenter.js')

describe('Return Logs Setup - Check presenter', () => {
  let session

  beforeEach(() => {
    session = {
      endDate: '2005-03-31T00:00:00.000Z',
      id: 'e840675e-9fb9-4ce1-bf0a-d140f5c57f47',
      journey: 'enter-return',
      meterMake: 'Test meter make',
      meterProvided: 'yes',
      meterSerialNumber: '098765',
      periodEndDay: 31,
      periodEndMonth: 12,
      periodStartDay: 1,
      periodStartMonth: 1,
      purposes: ['Evaporative Cooling'],
      receivedDate: '2025-01-31T00:00:00.000Z',
      reported: 'abstraction-volumes',
      returnReference: '1234',
      returnsFrequency: 'month',
      siteDescription: 'POINT A, TEST SITE DESCRIPTION',
      startDate: '2004-04-01T00:00:00.000Z',
      twoPartTariff: false,
      units: 'megalitres'
    }
  })

  describe('when provided with a populated session', () => {
    it('correctly presents the data', () => {
      const result = CheckPresenter.go(session)

      expect(result).to.equal({
        abstractionPeriod: '1 January to 31 December',
        links: {
          cancel: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/cancel',
          meterDetails: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/meter-provided',
          nilReturn: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/submission',
          received: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/received',
          reported: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/reported',
          units: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/units'
        },
        meterMake: 'Test meter make',
        meterProvided: 'yes',
        meterSerialNumber: '098765',
        nilReturn: 'No',
        note: {
          actions: [
            {
              href: 'note',
              text: 'Add a note'
            }
          ],
          text: 'No notes added'
        },
        pageTitle: 'Check details and enter new volumes or readings',
        purposes: 'Evaporative Cooling',
        returnReceivedDate: '31 January 2025',
        reportingFigures: 'Volumes',
        returnPeriod: '1 April 2004 to 31 March 2005',
        returnReference: '1234',
        siteDescription: 'POINT A, TEST SITE DESCRIPTION',
        tableTitle: 'Summary of monthly abstraction volumes',
        tariff: 'Standard',
        units: 'Megalitres'
      })
    })

    describe('and the "Enter a nil return" route has been selected', () => {
      beforeEach(() => {
        session.journey = 'nil-return'
      })

      it('correctly presents the data', () => {
        const result = CheckPresenter.go(session)

        expect(result).to.equal({
          abstractionPeriod: '1 January to 31 December',
          links: {
            cancel: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/cancel',
            meterDetails: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/meter-provided',
            nilReturn: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/submission',
            received: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/received',
            reported: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/reported',
            units: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/units'
          },
          nilReturn: 'Yes',
          note: {
            actions: [
              {
                href: 'note',
                text: 'Add a note'
              }
            ],
            text: 'No notes added'
          },
          pageTitle: 'Check details and enter new volumes or readings',
          purposes: 'Evaporative Cooling',
          returnReceivedDate: '31 January 2025',
          returnPeriod: '1 April 2004 to 31 March 2005',
          returnReference: '1234',
          siteDescription: 'POINT A, TEST SITE DESCRIPTION',
          tariff: 'Standard'
        })
      })
    })
  })

  describe('the "note" property', () => {
    describe('when the user has added a note', () => {
      beforeEach(() => {
        session.note = {
          content: 'Note attached to requirement'
        }
      })

      it('returns text with the note content and the change and delete a note action', () => {
        const result = CheckPresenter.go(session)

        expect(result.note).to.equal({
          actions: [
            {
              href: 'note',
              text: 'Change'
            },
            {
              href: 'delete-note',
              text: 'Delete'
            }
          ],
          text: 'Note attached to requirement'
        })
      })
    })

    describe('when the user has not added a note', () => {
      it('returns text with "No notes added" and the add a note action', () => {
        const result = CheckPresenter.go(session)

        expect(result.note).to.equal({
          actions: [
            {
              href: 'note',
              text: 'Add a note'
            }
          ],
          text: 'No notes added'
        })
      })
    })
  })

  describe('the "purposes" property', () => {
    describe('when there is a single purpose', () => {
      beforeEach(() => {
        session.purposes = ['Evaporative Cooling']
      })

      it('returns the description of the purpose', () => {
        const result = CheckPresenter.go(session)

        expect(result.purposes).to.equal('Evaporative Cooling')
      })
    })

    describe('when there are multiple purposes', () => {
      beforeEach(() => {
        session.purposes = ['Evaporative Cooling', 'Trickle Irrigation - Storage']
      })

      it('returns the descriptions as a comma separated string', () => {
        const result = CheckPresenter.go(session)

        expect(result.purposes).to.equal('Evaporative Cooling, Trickle Irrigation - Storage')
      })
    })
  })

  describe('the "reportingFigures" property', () => {
    describe('when the user has used meter readings', () => {
      beforeEach(() => {
        session.reported = 'meter-readings'
      })

      it('returns the method of gathering the figures as "Meter readings"', () => {
        const result = CheckPresenter.go(session)

        expect(result.reportingFigures).to.equal('Meter readings')
      })
    })

    describe('when the user has used volumes', () => {
      beforeEach(() => {
        session.reported = 'abstraction-volumes'
      })

      it('returns the method of gathering the figures as "Volumes"', () => {
        const result = CheckPresenter.go(session)

        expect(result.reportingFigures).to.equal('Volumes')
      })
    })
  })

  describe('the "tableTitle" property', () => {
    beforeEach(() => {
      session.returnsFrequency = 'month'
    })

    it('returns the frequency in the title', () => {
      const result = CheckPresenter.go(session)

      expect(result.tableTitle).to.contain('monthly')
    })

    describe('when the values are reported using "abstraction-volumes"', () => {
      beforeEach(() => {
        session.reported = 'abstraction-volumes'
      })

      it('returns "abstraction volumes" in the title', () => {
        const result = CheckPresenter.go(session)

        expect(result.tableTitle).to.equal('Summary of monthly abstraction volumes')
      })
    })

    describe('when the reporting method is not "abstraction-volumes"', () => {
      beforeEach(() => {
        session.reported = 'meter-readings'
      })

      it('returns "meter readings" in the title', () => {
        const result = CheckPresenter.go(session)

        expect(result.tableTitle).to.equal('Summary of monthly meter readings')
      })
    })
  })

  describe('the "tariff" property', () => {
    describe('when the tariff is "Two-part"', () => {
      beforeEach(() => {
        session.twoPartTariff = true
      })

      it('returns the tariff as "Two-part"', () => {
        const result = CheckPresenter.go(session)

        expect(result.tariff).to.equal('Two-part')
      })
    })

    describe('when the tariff is "Standard"', () => {
      beforeEach(() => {
        session.twoPartTariff = false
      })

      it('returns the tariff as "Standard"', () => {
        const result = CheckPresenter.go(session)

        expect(result.tariff).to.equal('Standard')
      })
    })
  })

  describe('the "units" property', () => {
    describe('when the user has used cubic metres', () => {
      beforeEach(() => {
        session.units = 'cubic-metres'
      })

      it('returns the unit of measurement as "Cubic metres"', () => {
        const result = CheckPresenter.go(session)

        expect(result.units).to.equal('Cubic metres')
      })
    })

    describe('when the user has used litres', () => {
      beforeEach(() => {
        session.units = 'litres'
      })

      it('returns the unit of measurement as "Litres"', () => {
        const result = CheckPresenter.go(session)

        expect(result.units).to.equal('Litres')
      })
    })

    describe('when the user has used megalitres', () => {
      beforeEach(() => {
        session.units = 'megalitres'
      })

      it('returns the unit of measurement as "Megalitres"', () => {
        const result = CheckPresenter.go(session)

        expect(result.units).to.equal('Megalitres')
      })
    })

    describe('when the user has used gallons', () => {
      beforeEach(() => {
        session.units = 'gallons'
      })

      it('returns the unit of measurement as "Gallons"', () => {
        const result = CheckPresenter.go(session)

        expect(result.units).to.equal('Gallons')
      })
    })
  })
})
