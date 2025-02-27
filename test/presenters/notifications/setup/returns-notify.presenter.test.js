'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')

// Thing under test
const ReturnsNotifyPresenterTest = require('../../../../app/presenters/notifications/setup/returns-notify.presenter.js')

describe('Notifications Setup - Returns Notify Presenter', () => {
  const referenceCode = 'TEST-123'

  let recipients
  let returnsPeriod
  let journey
  let testRecipients

  beforeEach(() => {
    journey = 'invitations'

    returnsPeriod = {
      periodEndDate: new Date('2025-01-28'),
      periodStartDate: new Date('2025-01-01'),
      returnDueDate: new Date('2025-04-28')
    }

    recipients = RecipientsFixture.recipients()

    testRecipients = [...Object.values(recipients)]
  })

  it('correctly transform the recipients into notifications', () => {
    const result = ReturnsNotifyPresenterTest.go(testRecipients, returnsPeriod, referenceCode, journey)

    expect(result).to.equal([
      {
        emailAddress: 'primary.user@important.com',
        options: {
          personalisation: {
            periodEndDate: '28 January 2025',
            periodStartDate: '1 January 2025',
            returnDueDate: '28 April 2025'
          },
          reference: 'TEST-123'
        },
        templateId: '2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f'
      },
      {
        emailAddress: 'returns.agent@important.com',
        options: {
          personalisation: {
            periodEndDate: '28 January 2025',
            periodStartDate: '1 January 2025',
            returnDueDate: '28 April 2025'
          },
          reference: 'TEST-123'
        },
        templateId: '41c45bd4-8225-4d7e-a175-b48b613b5510'
      },
      {
        options: {
          personalisation: {
            address_line_1: '1',
            address_line_2: 'Privet Drive',
            address_line_3: 'Little Whinging',
            address_line_4: 'Surrey',
            address_line_5: 'WD25 7LR',
            name: 'Mr H J Licence holder',
            periodEndDate: '28 January 2025',
            periodStartDate: '1 January 2025',
            returnDueDate: '28 April 2025'
          },
          reference: 'TEST-123'
        },
        templateId: '4fe80aed-c5dd-44c3-9044-d0289d635019'
      },
      {
        options: {
          personalisation: {
            address_line_1: '2',
            address_line_2: 'Privet Drive',
            address_line_3: 'Little Whinging',
            address_line_4: 'Surrey',
            address_line_5: 'WD25 7LR',
            name: 'Mr H J Returns to',
            periodEndDate: '28 January 2025',
            periodStartDate: '1 January 2025',
            returnDueDate: '28 April 2025'
          },
          reference: 'TEST-123'
        },
        templateId: '0e535549-99a2-44a9-84a7-589b12d00879'
      },
      {
        options: {
          personalisation: {
            address_line_1: '3',
            address_line_2: 'Privet Drive',
            address_line_3: 'Little Whinging',
            address_line_4: 'Surrey',
            address_line_5: 'WD25 7LR',
            name: 'Mr H J Licence holder with multiple licences',
            periodEndDate: '28 January 2025',
            periodStartDate: '1 January 2025',
            returnDueDate: '28 April 2025'
          },
          reference: 'TEST-123'
        },
        templateId: '4fe80aed-c5dd-44c3-9044-d0289d635019'
      }
    ])
  })

  describe('when the journey is for "invitations"', () => {
    beforeEach(() => {
      journey = 'invitations'
    })

    describe('when the notifications is an email', () => {
      describe('and the "contact_type" is for a "Primary user"', () => {
        beforeEach(() => {
          testRecipients = [recipients.primaryUser]
        })

        it('correctly transforms the recipient to a notification', () => {
          const result = ReturnsNotifyPresenterTest.go(testRecipients, returnsPeriod, referenceCode, journey)

          expect(result).to.equal([
            {
              emailAddress: 'primary.user@important.com',
              options: {
                personalisation: {
                  periodEndDate: '28 January 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                reference: 'TEST-123'
              },
              templateId: '2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f'
            }
          ])
        })
      })

      describe('and the "contact_type" is for a "Returns Agent"', () => {
        beforeEach(() => {
          testRecipients = [recipients.returnsAgent]
        })

        it('correctly transforms the recipient to a notification', () => {
          const result = ReturnsNotifyPresenterTest.go(testRecipients, returnsPeriod, referenceCode, journey)

          expect(result).to.equal([
            {
              emailAddress: 'returns.agent@important.com',
              options: {
                personalisation: {
                  periodEndDate: '28 January 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                reference: 'TEST-123'
              },
              templateId: '41c45bd4-8225-4d7e-a175-b48b613b5510'
            }
          ])
        })
      })

      describe('and the "contact_type" is for "both"', () => {
        beforeEach(() => {
          testRecipients = [{ ...recipients.primaryUser, contact_type: 'both' }]
        })

        it('correctly transforms the recipient to a notification', () => {
          const result = ReturnsNotifyPresenterTest.go(testRecipients, returnsPeriod, referenceCode, journey)

          expect(result).to.equal([
            {
              emailAddress: 'primary.user@important.com',
              options: {
                personalisation: {
                  periodEndDate: '28 January 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                reference: 'TEST-123'
              },
              templateId: '2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f'
            }
          ])
        })
      })
    })

    describe('when the notifications is a letter', () => {
      describe('and the "contact_type" is for a "Licence Holder"', () => {
        beforeEach(() => {
          testRecipients = [recipients.licenceHolder]
        })

        it('correctly transforms the recipient to a notification', () => {
          const result = ReturnsNotifyPresenterTest.go(testRecipients, returnsPeriod, referenceCode, journey)

          expect(result).to.equal([
            {
              options: {
                personalisation: {
                  address_line_1: '1',
                  address_line_2: 'Privet Drive',
                  address_line_3: 'Little Whinging',
                  address_line_4: 'Surrey',
                  address_line_5: 'WD25 7LR',
                  name: 'Mr H J Licence holder',
                  periodEndDate: '28 January 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                reference: 'TEST-123'
              },
              templateId: '4fe80aed-c5dd-44c3-9044-d0289d635019'
            }
          ])
        })
      })

      describe('and the "contact_type" is for a "Returns To"', () => {
        beforeEach(() => {
          testRecipients = [recipients.returnsTo]
        })

        it('correctly transforms the recipient to a notification', () => {
          const result = ReturnsNotifyPresenterTest.go(testRecipients, returnsPeriod, referenceCode, journey)

          expect(result).to.equal([
            {
              options: {
                personalisation: {
                  address_line_1: '2',
                  address_line_2: 'Privet Drive',
                  address_line_3: 'Little Whinging',
                  address_line_4: 'Surrey',
                  address_line_5: 'WD25 7LR',
                  name: 'Mr H J Returns to',
                  periodEndDate: '28 January 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                reference: 'TEST-123'
              },
              templateId: '0e535549-99a2-44a9-84a7-589b12d00879'
            }
          ])
        })
      })

      describe('and the "contact_type" is for "both"', () => {
        beforeEach(() => {
          testRecipients = [{ ...recipients.licenceHolder, contact_type: 'both' }]
        })

        it('correctly transforms the recipient to a notification', () => {
          const result = ReturnsNotifyPresenterTest.go(testRecipients, returnsPeriod, referenceCode, journey)

          expect(result).to.equal([
            {
              options: {
                personalisation: {
                  address_line_1: '1',
                  address_line_2: 'Privet Drive',
                  address_line_3: 'Little Whinging',
                  address_line_4: 'Surrey',
                  address_line_5: 'WD25 7LR',
                  name: 'Mr H J Licence holder',
                  periodEndDate: '28 January 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                reference: 'TEST-123'
              },
              templateId: '4fe80aed-c5dd-44c3-9044-d0289d635019'
            }
          ])
        })
      })
    })
  })

  describe('when the journey is for "reminders"', () => {
    beforeEach(() => {
      journey = 'reminders'
    })

    describe('when the notifications is an email', () => {
      describe('and the "contact_type" is for a "Primary user"', () => {
        beforeEach(() => {
          testRecipients = [recipients.primaryUser]
        })

        it('correctly transforms the recipient to a notification', () => {
          const result = ReturnsNotifyPresenterTest.go(testRecipients, returnsPeriod, referenceCode, journey)

          expect(result).to.equal([
            {
              emailAddress: 'primary.user@important.com',
              options: {
                personalisation: {
                  periodEndDate: '28 January 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                reference: 'TEST-123'
              },
              templateId: 'f1144bc7-8bdc-4e82-87cb-1a6c69445836'
            }
          ])
        })
      })

      describe('and the "contact_type" is for a "Returns Agent"', () => {
        beforeEach(() => {
          testRecipients = [recipients.returnsAgent]
        })

        it('correctly transforms the recipient to a notification', () => {
          const result = ReturnsNotifyPresenterTest.go(testRecipients, returnsPeriod, referenceCode, journey)

          expect(result).to.equal([
            {
              emailAddress: 'returns.agent@important.com',
              options: {
                personalisation: {
                  periodEndDate: '28 January 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                reference: 'TEST-123'
              },
              templateId: '038e1807-d1b5-4f09-a5a6-d7eee9030a7a'
            }
          ])
        })
      })

      describe('and the "contact_type" is for "both"', () => {
        beforeEach(() => {
          testRecipients = [{ ...recipients.primaryUser, contact_type: 'both' }]
        })

        it('correctly transforms the recipient to a notification', () => {
          const result = ReturnsNotifyPresenterTest.go(testRecipients, returnsPeriod, referenceCode, journey)

          expect(result).to.equal([
            {
              emailAddress: 'primary.user@important.com',
              options: {
                personalisation: {
                  periodEndDate: '28 January 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                reference: 'TEST-123'
              },
              templateId: 'f1144bc7-8bdc-4e82-87cb-1a6c69445836'
            }
          ])
        })
      })
    })

    describe('when the notifications is a letter', () => {
      describe('and the "contact_type" is for a "Licence Holder"', () => {
        beforeEach(() => {
          testRecipients = [recipients.licenceHolder]
        })

        it('correctly transforms the recipient to a notification', () => {
          const result = ReturnsNotifyPresenterTest.go(testRecipients, returnsPeriod, referenceCode, journey)

          expect(result).to.equal([
            {
              options: {
                personalisation: {
                  address_line_1: '1',
                  address_line_2: 'Privet Drive',
                  address_line_3: 'Little Whinging',
                  address_line_4: 'Surrey',
                  address_line_5: 'WD25 7LR',
                  name: 'Mr H J Licence holder',
                  periodEndDate: '28 January 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                reference: 'TEST-123'
              },
              templateId: 'c01c808b-094b-4a3a-ab9f-a6e86bad36ba'
            }
          ])
        })
      })

      describe('and the "contact_type" is for a "Returns To"', () => {
        beforeEach(() => {
          testRecipients = [recipients.returnsTo]
        })

        it('correctly transforms the recipient to a notification', () => {
          const result = ReturnsNotifyPresenterTest.go(testRecipients, returnsPeriod, referenceCode, journey)

          expect(result).to.equal([
            {
              options: {
                personalisation: {
                  address_line_1: '2',
                  address_line_2: 'Privet Drive',
                  address_line_3: 'Little Whinging',
                  address_line_4: 'Surrey',
                  address_line_5: 'WD25 7LR',
                  name: 'Mr H J Returns to',
                  periodEndDate: '28 January 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                reference: 'TEST-123'
              },
              templateId: 'e9f132c7-a550-4e18-a5c1-78375f07aa2d'
            }
          ])
        })
      })

      describe('and the "contact_type" is for "both"', () => {
        beforeEach(() => {
          testRecipients = [{ ...recipients.licenceHolder, contact_type: 'both' }]
        })

        it('correctly transforms the recipient to a notification', () => {
          const result = ReturnsNotifyPresenterTest.go(testRecipients, returnsPeriod, referenceCode, journey)

          expect(result).to.equal([
            {
              options: {
                personalisation: {
                  address_line_1: '1',
                  address_line_2: 'Privet Drive',
                  address_line_3: 'Little Whinging',
                  address_line_4: 'Surrey',
                  address_line_5: 'WD25 7LR',
                  name: 'Mr H J Licence holder',
                  periodEndDate: '28 January 2025',
                  periodStartDate: '1 January 2025',
                  returnDueDate: '28 April 2025'
                },
                reference: 'TEST-123'
              },
              templateId: 'c01c808b-094b-4a3a-ab9f-a6e86bad36ba'
            }
          ])
        })
      })
    })
  })
})
