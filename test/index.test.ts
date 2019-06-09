import Series from '../src/index'
import * as moment from 'moment'

describe('constructor', () => {
  it('empty constructor', () => {
    const series = new Series()
    expect(series.getEvents()).toEqual([])
  })
  it('constructor with events in it', () => {
    const events = [
      {
        start_time: moment('2019-05-01T03:00:00.000Z').toDate(),
        end_time: moment('2019-05-01T03:00:00.000Z').toDate()
      },
      {
        start_time: moment('2019-05-01T03:00:00.000Z').toDate(),
        end_time: moment('2019-05-01T03:00:00.000Z').toDate()
      }
    ]
    const series = new Series(events)
    expect(series.getEvents()).toEqual(events)
  })
})
describe('setLength', () => {
  it('set length to the same', () => {
    const events = [
      {
        start_time: moment('2019-05-01T03:00:00.000Z').toDate(),
        end_time: moment('2019-05-01T03:00:00.100Z').toDate()
      },
      {
        start_time: moment('2019-05-01T03:00:00.000Z').toDate(),
        end_time: moment('2019-05-01T03:00:00.100Z').toDate()
      }
    ]
    const series = new Series(events)
    series.setLength(100)
    expect(series.getEvents()).toEqual(events)
    expect(series.getUpdatedEvents()).toEqual([])
  })
  it('set length to be different', () => {
    const events = [
      {
        start_time: moment('2019-05-01T03:00:00.000Z').toDate(),
        end_time: moment('2019-05-01T03:00:00.100Z').toDate()
      },
      {
        start_time: moment('2019-05-01T03:00:00.100Z').toDate(),
        end_time: moment('2019-05-01T03:00:00.500Z').toDate()
      }
    ]
    const series = new Series(events)
    series.setLength(100)
    expect(series.getEvents()).toMatchInlineSnapshot(`
Array [
  Object {
    "end_time": 2019-05-01T03:00:00.100Z,
    "start_time": 2019-05-01T03:00:00.000Z,
  },
  Object {
    "end_time": 2019-05-01T03:00:00.200Z,
    "start_time": 2019-05-01T03:00:00.100Z,
  },
]
`);
    expect(series.getUpdatedEvents()).toEqual([
      series.getEvents()[1]
    ]);
  })
});
