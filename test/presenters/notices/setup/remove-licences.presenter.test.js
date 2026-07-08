'use strict'

// Test helpers
const { generateNoticeReferenceCode, generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const RemoveLicencesPresenter = require('../../../../app/presenters/notices/setup/remove-licences.presenter.js')

describe('Notices - Setup - Remove Licences presenter', () => {
  const licences = []
  let referenceCode
  let session

  beforeEach(() => {
    referenceCode = generateNoticeReferenceCode('RINV-')

    session = {
      id: generateUUID(),
      referenceCode
    }
  })

  it('correctly presents the data', () => {
    const result = RemoveLicencesPresenter(licences, session)

    expect(result).toEqual({
      backLink: {
        href: `/system/notices/setup/${session.id}/check`,
        text: 'Back'
      },
      hint: 'Separate the licences numbers with a comma or new line.',
      pageTitle: 'Enter the licence numbers to remove from the mailing list',
      pageTitleCaption: `Notice ${referenceCode}`,
      removeLicences: []
    })
  })
})
