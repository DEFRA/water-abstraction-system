'use strict'

/**
 * Validates data submitted for the `/notices` page
 * @module IndexValidator
 */

const Joi = require('joi').extend(require('@joi/date'))

const { leftPadZeroes } = require('../../presenters/base.presenter.js')

/**
 * Validates data submitted for the `/notices` page
 *
 * @param {object} filters - The filters from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(filters) {
  const { sentFromDay, sentFromMonth, sentFromYear, sentBy, sentToDay, sentToMonth, sentToYear } = filters

  const hasFromDate = sentFromDay || sentFromMonth || sentFromYear
  const hasToDate = sentToDay || sentToMonth || sentToYear
  const hasSentBy = !!sentBy

  const fields = {
    ...(hasFromDate && { fromFullDate: _fullDate(sentFromDay, sentFromMonth, sentFromYear) }),
    ...(hasToDate && { toFullDate: _fullDate(sentToDay, sentToMonth, sentToYear) }),
    ...(hasSentBy && { sentBy })
  }

  return _validate(fields)
}

function _fullDate(day, month, year) {
  if (year === undefined || year === null || year === '') {
    return new Date('Invalid Date')
  }

  const paddedMonth = month ? leftPadZeroes(month, 2) : null
  const paddedDay = day ? leftPadZeroes(day, 2) : null
  return new Date(`${year}-${paddedMonth}-${paddedDay}`)
}

function _validate(fields) {
  const schema = Joi.object({
    fromFullDate: Joi.date().iso().optional().max('now').messages({
      'date.base': 'Enter a valid from date',
      'date.format': 'Enter a valid from date',
      'date.max': "From date must be either today's date or in the past"
    }),
    toFullDate: Joi.date().iso().optional().max('now').messages({
      'date.base': 'Enter a valid to date',
      'date.format': 'Enter a valid to date',
      'date.max': "To date must be either today's date or in the past"
    }),
    sentBy: Joi.string().email().optional().messages({
      'string.email': 'Enter a valid email'
    })
  }).when(Joi.object({ fromFullDate: Joi.exist(), toFullDate: Joi.exist() }), {
    then: Joi.object({
      fromFullDate: Joi.date().iso().required().less(Joi.ref('toFullDate')).messages({
        'date.less': 'From date must be before to date'
      }),
      toFullDate: Joi.date().iso().required()
    })
  })

  return schema.validate(fields, { abortEarly: false, allowUnknown: true })
}

module.exports = {
  go
}
