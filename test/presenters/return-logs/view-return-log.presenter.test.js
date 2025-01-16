'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewPresenter = require('../../../app/presenters/return-logs/view-return-log.presenter.js')

describe('View Return Log presenter', () => {
  const data = {
    returnId: 'RETURN_ID',
    licenceNumber: 'LICENCE_NUMBER',
    receivedDate: '2023-11-06',
    startDate: '2022-11-01',
    endDate: '2023-10-31',
    dueDate: '2023-11-28',
    frequency: 'month',
    isNil: false,
    status: 'completed',
    versionNumber: 1,
    isCurrent: true,
    reading: {
      type: null,
      method: null,
      units: null,
      totalFlag: false,
      total: null,
      totalCustomDates: false,
      totalCustomDateStart: null,
      totalCustomDateEnd: null
    },
    meters: [],
    requiredLines: null,
    lines: [
      {
        startDate: '2022-04-30',
        endDate: '2022-04-30',
        quantity: 111,
        timePeriod: 'month',
        readingType: 'measured'
      },
      {
        startDate: '2022-05-31',
        endDate: '2022-05-31',
        quantity: 222,
        timePeriod: 'month',
        readingType: 'measured'
      },
      {
        startDate: '2022-06-30',
        endDate: '2022-06-30',
        quantity: 333,
        timePeriod: 'month',
        readingType: 'measured'
      },
      {
        startDate: '2022-07-31',
        endDate: '2022-07-31',
        quantity: 444,
        timePeriod: 'month',
        readingType: 'measured'
      },
      {
        startDate: '2022-08-31',
        endDate: '2022-08-31',
        quantity: 555,
        timePeriod: 'month',
        readingType: 'measured'
      },
      {
        startDate: '2022-09-30',
        endDate: '2022-09-30',
        quantity: 666,
        timePeriod: 'month',
        readingType: 'measured'
      },
      {
        startDate: '2023-01-31',
        endDate: '2023-01-31',
        quantity: 777,
        timePeriod: 'month',
        readingType: 'measured'
      },
      {
        startDate: '2023-02-28',
        endDate: '2023-02-28',
        quantity: 888,
        timePeriod: 'month',
        readingType: 'measured'
      },
      {
        startDate: '2023-05-31',
        endDate: '2023-05-31',
        quantity: 999,
        timePeriod: 'month',
        readingType: 'measured'
      },
      {
        startDate: '2023-06-30',
        endDate: '2023-06-30',
        quantity: 1010,
        timePeriod: 'month',
        readingType: 'measured'
      },
      {
        startDate: '2023-07-31',
        endDate: '2023-07-31',
        quantity: 1111,
        timePeriod: 'month',
        readingType: 'measured'
      },
      {
        startDate: '2023-08-31',
        endDate: '2023-08-31',
        quantity: 1212,
        timePeriod: 'month',
        readingType: 'measured'
      },
      {
        startDate: '2023-09-30',
        endDate: '2023-09-30',
        quantity: 1313,
        timePeriod: 'month',
        readingType: 'measured'
      },
      {
        startDate: '2023-10-31',
        endDate: '2023-10-31',
        quantity: 1414,
        timePeriod: 'month',
        readingType: 'measured'
      }
    ],
    metadata: {
      nald: {
        periodEndDay: '31',
        periodEndMonth: '10',
        periodStartDay: '1',
        periodStartMonth: '4'
      },
      isFinal: false,
      version: 1,
      isSummer: true,
      isUpload: false,
      purposes: [
        {
          alias: 'PURPOSE_ALIAS',
          primary: {
            code: 'I',
            description: 'Industrial, Commercial And Public Services'
          },
          tertiary: {
            code: '400',
            description: 'Spray Irrigation - Direct'
          },
          secondary: {
            code: 'GOF',
            description: 'Golf Courses'
          }
        }
      ],
      isCurrent: true,
      description: 'DESCRIPTION',
      isTwoPartTariff: true
    },
    versions: [
      {
        versionNumber: 1,
        email: 'imported@from.nald',
        createdAt: '2023-12-18T00:56:23.000Z',
        isCurrent: true
      }
    ],
    isUnderQuery: false
  }

  describe('the "description" property', () => {
    describe('when data is provided', () => {
      it('returns the description from the metadata', () => {
        const result = ViewPresenter.go(data)

        expect(result.description).to.equal('DESCRIPTION')
      })
    })
  })

  describe('the "purposes" property', () => {
    describe('when data is provided', () => {
      it('returns an array of purposes', () => {
        const result = ViewPresenter.go(data)

        expect(result.purposes).to.be.an.array()
      })
    })
  })

  describe('the "returnPeriod" property', () => {
    describe('when data is provided', () => {
      it('returns the return period from the metadata', () => {
        const result = ViewPresenter.go(data)

        expect(result.returnPeriod).to.equal('1 November 2022 to 31 October 2023')
      })
    })
  })

  describe('the "abstractionPeriod property', () => {
    describe('when data is provided', () => {
      it('returns the abstraction period from the metadata', () => {
        const result = ViewPresenter.go(data)

        expect(result.abstractionPeriod).to.equal('1 April to 31 October')
      })
    })
  })
})
