'use strict'

/**
 * Model for review_charge_elements_returns
 * @module ReviewChargeElementReturnModel
 */

const BaseModel = require('./base.model.js')

class ReviewChargeElementReturnModel extends BaseModel {
  static get tableName() {
    return 'reviewChargeElementReturns'
  }
}

module.exports = ReviewChargeElementReturnModel
