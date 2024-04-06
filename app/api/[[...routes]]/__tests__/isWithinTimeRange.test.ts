import { calculateHamAmount, findMatches, isWithinTimeRange } from "../../../helper";
import {describe, expect, it} from '@jest/globals';

describe('should pass', () => {
  it('should fail when it is yesterday', () => {
    const today = new Date()
    const dateToday = new Date()
    dateToday.setDate(dateToday.getDate() - 1)
    dateToday.setUTCHours(8)
    dateToday.setUTCMinutes(0)

    const actual = isWithinTimeRange(today, dateToday.toUTCString())
    const expected = false

    expect(actual).toBe(expected)
  })

  it('should fail when it is the next day', () => {
    const today = new Date()
    const dateToday = new Date()
    dateToday.setDate(dateToday.getDate() + 1)
    dateToday.setUTCHours(8)
    dateToday.setUTCMinutes(0)

    const actual = isWithinTimeRange(today, dateToday.toUTCString())
    const expected = false

    expect(actual).toBe(expected)
  })

  it('should pass when it is today after 08:00', () => {
    const today = new Date()
    const dateToday = new Date()
    dateToday.setUTCHours(8, 1)
    const actual = isWithinTimeRange(today, dateToday.toUTCString())
    const expected = true

    expect(actual).toBe(expected)
  })

  it('should fail when it is today but before 08:00', () => {
    const today = new Date()
    const dateToday = new Date()
    dateToday.setUTCHours(7, 59)
    
    const actual = isWithinTimeRange(today, dateToday.toUTCString())
    const expected = false

    expect(actual).toBe(expected)
  })

  it('PASS - before 8:00', () => {
    const dateToday = new Date()
    dateToday.setUTCHours(7, 59)
    
    const actual = isWithinTimeRange(dateToday, dateToday.toUTCString())
    const expected = true

    expect(actual).toBe(expected)
  })

  it('regex for ham', () => {
    const actual = calculateHamAmount("🍖")
    const expected = 1

    expect(actual).toBe(expected)
  })

  it('regex for ham multiplier', () => {
    const actual = calculateHamAmount("🍖x20")
    const expected = 200

    expect(actual).toBe(expected)
  })

  it.skip('regex for ham multiplier and extra hams', () => {
    const actual = calculateHamAmount("🍖🍖x20")
    const expected = 201

    expect(actual).toBe(expected)
  })

  it('regex for ham multiplier with spaces', () => {
    const actual = calculateHamAmount("🍖 x 10000")
    const expected = 100000

    expect(actual).toBe(expected)
  })

})