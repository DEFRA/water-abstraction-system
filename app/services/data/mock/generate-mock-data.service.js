'use strict'

/**
 * Generates mock data for use in the other generators
 * @module GenerateMockDataService
 */

const ADDRESS_FIRST_LINES = [
  'Fake Street',
  'Fake Avenue',
  'Fake Road',
  'Fake Court',
  'Fake Crescent'
]

const ADDRESS_SECOND_LINES = [
  'Fakesville',
  'Faketown',
  'Fakechester'
]

const FIRST_NAMES = [
  'Stuart',
  'Alan',
  'Rebecca',
  'Jason',
  'Mandy',
  'Chris'
]

const LAST_NAMES = [
  'Adair',
  'Cruikshanks',
  'Ransome',
  'Claxton',
  'White',
  'Barrett'
]

function go () {
  return {
    address: _generateAddress(),
    name: _generateName()
  }
}

function _generateAddress () {
  return [
    _randomDigit() + ' ' + _pickRandomElement(ADDRESS_FIRST_LINES),
    _pickRandomElement(ADDRESS_SECOND_LINES),
    _generatePostcode()
  ]
}

function _generateName () {
  return `${_pickRandomElement(FIRST_NAMES)} ${_pickRandomElement(LAST_NAMES)}`
}

function _generatePostcode () {
  return `${_randomLetter()}${_randomLetter()}${_randomDigit()}${_randomDigit()} ${_randomDigit()}${_randomLetter()}${_randomLetter()}`
}

function _randomDigit () {
  return Math.floor(Math.random() * 9) + 1
}

function _randomLetter () {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26))
}

function _pickRandomElement (array) {
  return array[Math.floor(Math.random() * array.length)]
}

module.exports = {
  go
}
