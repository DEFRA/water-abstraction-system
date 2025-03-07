'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitSingleVolumeService = require('../../../../app/services/return-logs/setup/submit-single-volume.service.js')

describe('Return Logs Setup - Submit Single Volume service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      data: {
        returnReference: '12345',
        units: 'litres'
      }
    }

    session = await SessionHelper.add(sessionData)
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(async () => {
        payload = { singleVolume: 'yes', singleVolumeQuantity: '1000' }
      })

      it('saves the submitted option', async () => {
        await SubmitSingleVolumeService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.singleVolume).to.equal('yes')
        expect(refreshedSession.singleVolumeQuantity).to.equal(1000)
      })

      describe('and the user has previously selected "yes" to a single volume being provided', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitSingleVolumeService.go(session.id, payload)

          expect(result).to.equal({ singleVolume: 'yes' })
        })
      })

      describe('and the user has previously selected "no" to a single volume being provided', () => {
        beforeEach(async () => {
          payload = { singleVolume: 'no' }
        })

        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitSingleVolumeService.go(session.id, payload)

          expect(result).to.equal({ singleVolume: 'no' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitSingleVolumeService.go(session.id, payload)

        expect(result).to.equal(
          {
            activeNavBar: 'search',
            backLink: `/system/return-logs/setup/${session.id}/meter-provided`,
            pageTitle: 'Is it a single volume?',
            returnReference: '12345',
            singleVolume: null,
            singleVolumeQuantity: null,
            units: 'litres'
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitSingleVolumeService.go(session.id, payload)

          expect(result.error).to.equal({
            message: "Select if it's a single volume",
            radioFormElement: { text: "Select if it's a single volume" },
            volumeInputFormElement: null
          })
        })
      })

      describe('because the user entered an invalid volume', () => {
        beforeEach(() => {
          payload.singleVolume = 'yes'
          payload.singleVolumeQuantity = '-1'
        })

        it('includes an error for the input form element', async () => {
          const result = await SubmitSingleVolumeService.go(session.id, payload)

          expect(result.error).to.equal({
            message: 'Enter a total figure',
            radioFormElement: null,
            volumeInputFormElement: { text: 'Enter a total figure' }
          })
        })
      })
    })
  })
})
