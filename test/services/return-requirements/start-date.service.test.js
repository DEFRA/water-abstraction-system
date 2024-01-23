'use strict'

const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

const DatabaseHelper = require('../../support/helpers/database.helper.js')
const SessionHelper = require('../../support/helpers/session.helper.js')

const StartDateService = require('../../../app/services/return-requirements/start-date.service.js')

describe('Start Date Service', () => {
  let session

  beforeEach(async () => {
    await DatabaseHelper.clean()
    session = await SessionHelper.add({ data: { licence: { licenceRef: '01/ABC', startDate: '2023-01-01T00:00:00.000Z' } } })
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await StartDateService.go(session.id)

      expect(result.id).to.equal(session.id)
    })

    describe('without the optional error param', () => {
      it('returns page data for the view', async () => {
        const result = await StartDateService.go(session.id)

        expect(result.activeNavBar).to.exist()
        expect(result.pageTitle).to.exist()
        expect(result.licenceRef).to.exist()
        expect(result.dateFields).to.exist()

        expect(result.errorMessage).to.be.null()
      })
    })

    describe('with the optional error param', () => {
      const error = {
        details: [
          {
            message: 'Enter a real start date',
            invalidFields: ['day', 'month', 'year']
          }
        ]
      }
      const payload = {
        'start-date-day': '',
        'start-date-month': '',
        'start-date-year': ''
      }

      it('returns page data for the view including the error message', async () => {
        const result = await StartDateService.go(session.id, error, payload)

        expect(result.activeNavBar).to.exist()
        expect(result.pageTitle).to.exist()
        expect(result.licenceRef).to.exist()
        expect(result.dateFields).to.exist()

        expect(result.errorMessage).to.exist()
        expect(result.errorMessage.text).to.equal(error.details[0].message)
      })
    })
  })
})
