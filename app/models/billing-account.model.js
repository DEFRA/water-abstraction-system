'use strict'

/**
 * Model for billing_accounts (crm_v2.invoice_accounts)
 * @module BillingAccountModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class BillingAccountModel extends BaseModel {
  static get tableName () {
    return 'billingAccounts'
  }

  static get relationMappings () {
    return {
      billingAccountAddresses: {
        relation: Model.HasManyRelation,
        modelClass: 'billing-account-address.model',
        join: {
          from: 'billingAccounts.id',
          to: 'billingAccountAddresses.billingAccountId'
        }
      },
      bills: {
        relation: Model.HasManyRelation,
        modelClass: 'bill.model',
        join: {
          from: 'billingAccounts.id',
          to: 'bills.billingAccountId'
        }
      },
      chargeVersions: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-version.model',
        join: {
          from: 'billingAccounts.id',
          to: 'chargeVersions.billingAccountId'
        }
      },
      company: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'company.model',
        join: {
          from: 'billingAccounts.companyId',
          to: 'companies.id'
        }
      }
    }
  }

  /**
   * Modifiers allow us to reuse logic in queries, eg. select the billing account and everything needed to display it in
   * the UI:
   *
   * ```javascript
   * return BillingAccountModel.query()
   *   .findById(billingAccountId)
   *   .modify('contactDetails')
   * ```
   *
   * See {@link https://vincit.github.io/objection.js/recipes/modifiers.html | Modifiers} for more details
   *
   * @returns {object}
   */
  static get modifiers () {
    return {
      // fetches all related records need to display contact name and address for the billing account
      contactDetails (query) {
        query
          .select([
            'id',
            'accountNumber'
          ])
          .withGraphFetched('company')
          .modifyGraph('company', (builder) => {
            builder.select([
              'id',
              'name',
              'type'
            ])
          })
          .withGraphFetched('billingAccountAddresses')
          // The current billing account address is denoted by the fact it is the only one with a null end date
          .modifyGraph('billingAccountAddresses', (builder) => {
            builder
              .select([
                'id'
              ])
              .whereNull('endDate')
              .withGraphFetched('address')
              .modifyGraph('address', (builder) => {
                builder
                  .select([
                    'id',
                    'address1',
                    'address2',
                    'address3',
                    'address4',
                    'address5',
                    'address6',
                    'postcode',
                    'country'
                  ])
              })
              .withGraphFetched('company')
              .modifyGraph('company', (builder) => {
                builder
                  .select([
                    'id',
                    'name',
                    'type'
                  ])
              })
              .withGraphFetched('contact')
              .modifyGraph('contact', (builder) => {
                builder
                  .select([
                    'id',
                    'contactType',
                    'dataSource',
                    'department',
                    'firstName',
                    'initials',
                    'lastName',
                    'middleInitials',
                    'salutation',
                    'suffix'
                  ])
              })
          })
      }
    }
  }

  /**
   * Determine the account name to use for the billing account
   *
   * > We recommend adding the `contactDetails` modifier to your query to support this determination
   *
   * The account name is dependent on a number of things. First, you need the 'current' billing account address record
   * linked to the billing account. If it has a company linked to it, the account name is the linked company name.
   *
   * If the billing account address does not have a company linked to it, then the name of the name of the company
   * linked directly to the billing account is used.
   *
   * @returns {string|null} the account name to use for the billing account or null if it cannot be determined
   */
  $accountName () {
    const currentBillingAccountAddress = this?.billingAccountAddresses?.[0]

    if (currentBillingAccountAddress?.company) {
      return currentBillingAccountAddress.company.name
    }

    return this.company?.name
  }

  /**
   * Determine the address lines to use for the billing account
   *
   * > We recommend adding the `contactDetails` modifier to your query to support this determination
   *
   * The address is dependent on a number of things. First, you need the 'current' billing account address record linked
   * to the billing account. Then we only care about the populated fields. So, once we've found the current billing
   * account address we filter out any null address parts.
   *
   * @returns {string[]} the address lines to use for the billing account
   */
  $addressLines () {
    const currentBillingAccountAddress = this?.billingAccountAddresses?.[0]

    // Guard clause in case modifier has not been used
    if (!currentBillingAccountAddress || currentBillingAccountAddress.address) {
      return []
    }

    const { address } = currentBillingAccountAddress

    const addressParts = [
      address.address1,
      address.address2,
      address.address3,
      address.address4,
      address.address5,
      address.address6,
      address.postcode,
      address.country
    ]

    return addressParts.filter((part) => {
      return part
    })
  }

  /**
   * Determine the contact name to use for the billing account
   *
   * > We recommend adding the `contactDetails` modifier to your query to support this determination
   *
   * The account name is dependent on a number of things. First, you need the 'current' billing account address record
   * linked to the billing account. If it has a contact linked to it, the contact name is the linked contact's name.
   *
   * @returns {string|null} the contact name to use for the billing account or null if it cannot be determined
   */
  $contactName () {
    const currentBillingAccountAddress = this?.billingAccountAddresses?.[0]

    if (currentBillingAccountAddress?.contact) {
      return currentBillingAccountAddress.contact.$name()
    }

    return null
  }
}

module.exports = BillingAccountModel
