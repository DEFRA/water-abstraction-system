'use strict'

/**
 * Fetches the company contact data needed for the view '/company-contacts/{id}' pages
 * @module FetchCompanyContactService
 */

const CompanyContactModel = require('../../models/company-contact.model.js')
const { db } = require('../../../db/db.js')

/**
 * Fetches the company contact data needed for the view '/company-contacts/{id}' pages
 *
 * @param {string} companyContactId - The company contact id
 *
 * @returns {Promise<CompanyContactModel>} the company contacts for the customer and the pagination object
 */
async function go(companyContactId) {
  return _fetch(companyContactId)
}

async function _fetch(companyContactId) {
  return CompanyContactModel.query()
    .alias('cc')
    .select([
      'cc.id',
      'cc.companyId',
      'cc.abstractionAlerts',
      CompanyContactModel.query()
        .alias('sub_cc')
        .countDistinct('sub_cc.id')
        .innerJoin('licence_document_roles AS ldr', 'ldr.company_id', 'sub_cc.company_id')
        .whereColumn('sub_cc.company_id', 'cc.companyId')
        .where('sub_cc.abstraction_alerts', true)
        .andWhere((builder) => {
          builder.whereNull('ldr.end_date').orWhere('ldr.end_date', '>', db.raw('NOW()'))
        })
        .as('abstractionAlertsCount')
    ])
    .where('cc.id', companyContactId)
    .withGraphFetched('contact')
    .modifyGraph('contact', (contactBuilder) => {
      contactBuilder.select([
        'id',
        'salutation',
        'firstName',
        'middleInitials',
        'lastName',
        'initials',
        'contactType',
        'suffix',
        'department',
        'email'
      ])
    })
    .first()
}

module.exports = {
  go
}
