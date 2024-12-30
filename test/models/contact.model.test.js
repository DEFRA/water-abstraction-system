'use strict'

// Test framework dependencies
const { describe, it, before, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const BillingAccountAddressHelper = require('../support/helpers/billing-account-address.helper.js')
const BillingAccountAddressModel = require('../../app/models/billing-account-address.model.js')
const CompanyContactHelper = require('../support/helpers/company-contact.helper.js')
const CompanyContactModel = require('../../app/models/company-contact.model.js')
const ContactHelper = require('../support/helpers/contact.helper.js')
const { closeConnection } = require('../support/database.js')
const LicenceDocumentRoleHelper = require('../support/helpers/licence-document-role.helper.js')
const LicenceDocumentRoleModel = require('../../app/models/licence-document-role.model.js')

// Thing under test
const ContactModel = require('../../app/models/contact.model.js')

describe('Contact model', () => {
  let testBillingAccountAddresses
  let testCompanyContacts
  let testLicenceDocumentRoles
  let testRecord

  before(async () => {
    // Test record
    testRecord = await ContactHelper.add()
    const { id: contactId } = testRecord

    // Link billing account addresses
    testBillingAccountAddresses = []
    for (let i = 0; i < 2; i++) {
      // NOTE: A constraint in the billing_account_addresses table means you cannot have 2 records with the same
      // billingAccountId and start date
      const startDate = i === 0 ? new Date(2023, 8, 4) : new Date(2023, 8, 3)
      const billingAccountAddress = await BillingAccountAddressHelper.add({ startDate, contactId })

      testBillingAccountAddresses.push(billingAccountAddress)
    }

    // Link company contacts
    testCompanyContacts = []
    for (let i = 0; i < 2; i++) {
      const companyContact = await CompanyContactHelper.add({ contactId })

      testCompanyContacts.push(companyContact)
    }

    // Link licence document roles
    testLicenceDocumentRoles = []
    for (let i = 0; i < 2; i++) {
      const licenceDocumentRole = await LicenceDocumentRoleHelper.add({ contactId })

      testLicenceDocumentRoles.push(licenceDocumentRole)
    }
  })

  after(async () => {
    await closeConnection()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ContactModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ContactModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing account addresses', () => {
      it('can successfully run a related query', async () => {
        const query = await ContactModel.query().innerJoinRelated('billingAccountAddresses')

        expect(query).to.exist()
      })

      it('can eager load the billing account addresses', async () => {
        const result = await ContactModel.query().findById(testRecord.id).withGraphFetched('billingAccountAddresses')

        expect(result).to.be.instanceOf(ContactModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billingAccountAddresses).to.be.an.array()
        expect(result.billingAccountAddresses[0]).to.be.an.instanceOf(BillingAccountAddressModel)
        expect(result.billingAccountAddresses).to.include(testBillingAccountAddresses[0])
        expect(result.billingAccountAddresses).to.include(testBillingAccountAddresses[1])
      })
    })

    describe('when linking to company contacts', () => {
      it('can successfully run a related query', async () => {
        const query = await ContactModel.query().innerJoinRelated('companyContacts')

        expect(query).to.exist()
      })

      it('can eager load the company contacts', async () => {
        const result = await ContactModel.query().findById(testRecord.id).withGraphFetched('companyContacts')

        expect(result).to.be.instanceOf(ContactModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.companyContacts).to.be.an.array()
        expect(result.companyContacts[0]).to.be.an.instanceOf(CompanyContactModel)
        expect(result.companyContacts).to.include(testCompanyContacts[0])
        expect(result.companyContacts).to.include(testCompanyContacts[1])
      })
    })

    describe('when linking to licence document roles', () => {
      it('can successfully run a related query', async () => {
        const query = await ContactModel.query().innerJoinRelated('licenceDocumentRoles')

        expect(query).to.exist()
      })

      it('can eager load the licence document roles', async () => {
        const result = await ContactModel.query().findById(testRecord.id).withGraphFetched('licenceDocumentRoles')

        expect(result).to.be.instanceOf(ContactModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceDocumentRoles).to.be.an.array()
        expect(result.licenceDocumentRoles[0]).to.be.an.instanceOf(LicenceDocumentRoleModel)
        expect(result.licenceDocumentRoles).to.include(testLicenceDocumentRoles[0])
        expect(result.licenceDocumentRoles).to.include(testLicenceDocumentRoles[1])
      })
    })
  })

  // NOTE: The test data we generate in these tests is in accordance with how a contact record could be populated. For
  // example, if the data source is 'wrls' and the contact type is 'person', then first name and last name is always
  // populated. We don't test what would happen if last name wasn't because analysis of the data confirms this would
  // never happen. See the method's documentation for more details.
  describe('$name', () => {
    let contactRecord

    beforeEach(() => {
      contactRecord = {
        contactType: null,
        dataSource: null,
        department: null,
        firstName: null,
        initials: null,
        lastName: null,
        middleInitials: null,
        salutation: null,
        suffix: null
      }
    })

    describe('when the contact was imported in NALD', () => {
      beforeEach(() => {
        contactRecord.dataSource = 'nald'
      })

      describe('and has a last name of "Villar"', () => {
        beforeEach(() => {
          contactRecord.lastName = 'Villar'
        })

        it('returns "Villar"', () => {
          testRecord = ContactModel.fromJson(contactRecord)

          expect(testRecord.$name()).to.equal('Villar')
        })

        describe('and the salutation "Mrs"', () => {
          beforeEach(() => {
            contactRecord.salutation = 'Mrs'
          })

          it('returns "Mrs Villar"', () => {
            testRecord = ContactModel.fromJson(contactRecord)

            expect(testRecord.$name()).to.equal('Mrs Villar')
          })

          describe('and the initial "J"', () => {
            beforeEach(() => {
              contactRecord.initials = 'J'
            })

            it('returns "Mrs J Villar"', () => {
              testRecord = ContactModel.fromJson(contactRecord)

              expect(testRecord.$name()).to.equal('Mrs J Villar')
            })
          })
        })

        describe('and a first name of "Margherita"', () => {
          beforeEach(() => {
            contactRecord.firstName = 'Margherita'
          })

          it('returns "Margherita Villar"', () => {
            testRecord = ContactModel.fromJson(contactRecord)

            expect(testRecord.$name()).to.equal('Margherita Villar')
          })

          describe('and the salutation "Mrs"', () => {
            beforeEach(() => {
              contactRecord.salutation = 'Mrs'
            })

            it('returns "Mrs Margherita Villar"', () => {
              testRecord = ContactModel.fromJson(contactRecord)

              expect(testRecord.$name()).to.equal('Mrs Margherita Villar')
            })

            describe('and the initial "J"', () => {
              beforeEach(() => {
                contactRecord.initials = 'J'
              })

              it('returns "Mrs J Villar"', () => {
                testRecord = ContactModel.fromJson(contactRecord)

                expect(testRecord.$name()).to.equal('Mrs J Villar')
              })
            })
          })
        })
      })
    })

    describe('when the contact was entered into WRLS', () => {
      beforeEach(() => {
        contactRecord.dataSource = 'wrls'
      })

      describe('and it is a department named "Humanoid Risk Assessment"', () => {
        beforeEach(() => {
          contactRecord.contactType = 'department'
          contactRecord.department = 'Humanoid Risk Assessment'
        })

        it('returns "Humanoid Risk Assessment"', () => {
          testRecord = ContactModel.fromJson(contactRecord)

          expect(testRecord.$name()).to.equal('Humanoid Risk Assessment')
        })
      })

      describe('and it is a "person"', () => {
        beforeEach(() => {
          contactRecord.contactType = 'person'
          contactRecord.firstName = 'Vincent'
          contactRecord.lastName = 'Anderson'
        })

        describe('with the name "Vincent Anderson"', () => {
          it('returns "Vincent Anderson"', () => {
            testRecord = ContactModel.fromJson(contactRecord)

            expect(testRecord.$name()).to.equal('Vincent Anderson')
          })
        })

        describe('and the salutation "Mr"', () => {
          beforeEach(() => {
            contactRecord.salutation = 'Mr'
          })

          it('returns "Mr Vincent Anderson"', () => {
            testRecord = ContactModel.fromJson(contactRecord)

            expect(testRecord.$name()).to.equal('Mr Vincent Anderson')
          })

          describe('and the middle initial "P"', () => {
            beforeEach(() => {
              contactRecord.middleInitials = 'P'
            })

            it('returns Mr V P Anderson', () => {
              testRecord = ContactModel.fromJson(contactRecord)

              expect(testRecord.$name()).to.equal('Mr V P Anderson')
            })

            describe('and the suffix "MBE"', () => {
              beforeEach(() => {
                contactRecord.suffix = 'MBE'
              })

              it('returns "Mr V P Anderson MBE"', () => {
                testRecord = ContactModel.fromJson(contactRecord)

                expect(testRecord.$name()).to.equal('Mr V P Anderson MBE')
              })
            })
          })
        })

        describe('and the middle initial "P"', () => {
          beforeEach(() => {
            contactRecord.middleInitials = 'P'
          })

          it('returns "V P Anderson"', () => {
            testRecord = ContactModel.fromJson(contactRecord)

            expect(testRecord.$name()).to.equal('V P Anderson')
          })

          describe('and the suffix "MBE"', () => {
            beforeEach(() => {
              contactRecord.suffix = 'MBE'
            })

            it('returns "V P Anderson MBE"', () => {
              testRecord = ContactModel.fromJson(contactRecord)

              expect(testRecord.$name()).to.equal('V P Anderson MBE')
            })
          })
        })
      })
    })
  })
})
