'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitNoteService = require('../../../../app/services/return-logs/setup/submit-note.service.js')

describe('Return Logs Setup - Submit Note service', () => {
  const user = { username: 'carol.shaw@atari.com' }

  let payload
  let session
  let yarStub

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { returnReference: '1234' } })

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('that is a new note', () => {
        beforeEach(() => {
          payload = { note: 'A new note related to return logs' }
        })

        it('saves the submitted value', async () => {
          await SubmitNoteService.go(session.id, payload, user, yarStub)

          const refreshedSession = await session.$query()

          expect(refreshedSession.note).to.equal({
            content: 'A new note related to return logs',
            userEmail: 'carol.shaw@atari.com'
          })
        })

        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitNoteService.go(session.id, payload, user, yarStub)

          expect(result).to.equal({})
        })

        it('sets the notification message to "Added"', async () => {
          await SubmitNoteService.go(session.id, payload, user, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Added', text: 'Note added' })
        })
      })

      describe('that is an updated note', () => {
        beforeEach(async () => {
          await session.$query().patch({
            data: {
              note: {
                content: 'A old note related to return requirement',
                userEmail: 'carol.shaw@atari.com'
              }
            }
          })

          payload = { note: 'An updated note related to return requirement' }
        })

        it('saves the submitted value', async () => {
          await SubmitNoteService.go(session.id, payload, user, yarStub)

          const refreshedSession = await session.$query()

          expect(refreshedSession.note).to.equal({
            content: 'An updated note related to return requirement',
            userEmail: 'carol.shaw@atari.com'
          })
        })

        it('returns the journey to redirect the page', async () => {
          const result = await SubmitNoteService.go(session.id, payload, user, yarStub)

          expect(result).to.equal({})
        })

        it('sets the notification message to "Updated"', async () => {
          await SubmitNoteService.go(session.id, payload, user, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', text: 'Note updated' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view', async () => {
        const result = await SubmitNoteService.go(session.id, payload, user, yarStub)

        expect(result).to.equal({
          activeNavBar: 'search',
          backLink: {
            href: `/system/return-logs/setup/${session.id}/check`,
            text: 'Back'
          },
          error: {
            errorList: [
              {
                href: '#note',
                text: 'Enter details'
              }
            ],
            note: {
              text: 'Enter details'
            }
          },
          note: null,
          pageTitle: 'Add a note',
          caption: 'Return reference 1234',
          sessionId: session.id
        })
      })

      describe('because the user has not entered anything', () => {
        it('includes an error for the input element', async () => {
          const result = await SubmitNoteService.go(session.id, payload, user, yarStub)

          expect(result.error).to.equal({
            errorList: [
              {
                href: '#note',
                text: 'Enter details'
              }
            ],
            note: {
              text: 'Enter details'
            }
          })
        })
      })

      describe('because the user has entered a note more than 500 characters', () => {
        beforeEach(() => {
          payload = {
            note: `Lorem ipsum dolor sit amet consectetur adipiscing elit
              Lorem ipsum dolor sit amet consectetur adipiscing elit
              Lorem ipsum dolor sit amet consectetur adipiscing elit
              Lorem ipsum dolor sit amet consectetur adipiscing elit
              Lorem ipsum dolor sit amet consectetur adipiscing elit
              Lorem ipsum dolor sit amet consectetur adipiscing elit
              Lorem ipsum dolor sit amet consectetur adipiscing elit
              Lorem ipsum dolor sit amet consectetur adipiscing elit
              Lorem ipsum dolor sit amet consectetur adipiscing elit
              Lorem ipsum dolor sit amet consectetur adipiscing elit
              Lorem ipsum dolor sit amet consectetur adipiscing elit`
          }
        })

        it('includes an error for the input element', async () => {
          const result = await SubmitNoteService.go(session.id, payload, user, yarStub)

          expect(result.error).to.equal({
            errorList: [
              {
                href: '#note',
                text: 'Enter no more than 500 characters'
              }
            ],
            note: {
              text: 'Enter no more than 500 characters'
            }
          })
        })
      })
    })
  })
})
