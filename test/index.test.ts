import Series from "../src/index";
import * as moment from "moment";
import { RRule } from "rrule";

describe('constructor', () => {
  it('empty constructor', () => {
    const series = new Series()
    expect(series.getEvents()).toEqual([])
  })
  it('constructor with events in it', () => {
    const events = [
      {
        start: moment('2019-05-01T03:00:00.000Z').toDate(),
        end: moment('2019-05-01T03:00:00.000Z').toDate()
      },
      {
        start: moment('2019-05-01T03:00:00.000Z').toDate(),
        end: moment('2019-05-01T03:00:00.000Z').toDate()
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
        start: moment('2019-05-01T03:00:00.000Z').toDate(),
        end: moment('2019-05-01T03:00:00.100Z').toDate()
      },
      {
        start: moment('2019-05-01T03:00:00.000Z').toDate(),
        end: moment('2019-05-01T03:00:00.100Z').toDate()
      }
    ]
    const series = new Series(events)
    series.setLength(100)
    expect(series.getEvents()).toEqual(events)
    expect(series.getUpdated()).toEqual([])
  })
  it('set length to be different', () => {
    const events = [
      {
        start: moment('2019-05-01T03:00:00.000Z').toDate(),
        end: moment('2019-05-01T03:00:00.100Z').toDate()
      },
      {
        start: moment('2019-05-01T03:00:00.100Z').toDate(),
        end: moment('2019-05-01T03:00:00.500Z').toDate()
      }
    ]
    const series = new Series(events);
    series.setLength(100)
    expect(series.getEvents()).toMatchInlineSnapshot(`
Array [
  Object {
    "end": 2019-05-01T03:00:00.100Z,
    "start": 2019-05-01T03:00:00.000Z,
  },
  Object {
    "end": 2019-05-01T03:00:00.200Z,
    "start": 2019-05-01T03:00:00.100Z,
  },
]
`);
    expect(series.getUpdated()).toEqual([
      series.getEvents()[1]
    ]);
  })
});
describe('setRecurrence', () => {
  it('keeps same events', () => {
    const events = [
      {
        start: moment('2019-05-01T03:00:00.000Z').toDate(),
        end: moment('2019-05-01T04:00:00.000Z').toDate()
      },
      {
        start: moment('2019-05-02T03:00:00.000Z').toDate(),
        end: moment('2019-05-02T04:00:00.000Z').toDate()
      }
    ];
    const rrule = new RRule({
      freq: RRule.DAILY,
      interval: 1,
      dtstart: moment("2019-05-01T03:00:00.000Z").toDate(),
      until: moment("2019-05-02T03:00:00.000Z").toDate()
    });
    const series = new Series(events);
    series.setRecurrence(rrule.toString());
    expect(series.getEvents()).toEqual(events);
    expect(series.getCreated()).toEqual([]);
    expect(series.getUpdated()).toEqual([]);
    expect(series.getDeleted()).toEqual([]);
  });
  it('adds an event', () => {
    const events = [
      {
        start: moment('2019-05-01T03:00:00.000Z').toDate(),
        end: moment('2019-05-01T04:00:00.000Z').toDate()
      },
      {
        start: moment('2019-05-02T03:00:00.000Z').toDate(),
        end: moment('2019-05-02T04:00:00.000Z').toDate()
      }
    ];
    const rrule = new RRule({
      freq: RRule.DAILY,
      interval: 1,
      dtstart: moment("2019-05-01T03:00:00.000Z").toDate(),
      until: moment("2019-05-03T03:00:00.000Z").toDate()
    });
    const series = new Series(events);
    series.setRecurrence(rrule.toString());
    expect(series.getEvents().length).toEqual(3);
    expect(series.getCreated().length).toEqual(1);
    expect(series.getUpdated()).toEqual([]);
    expect(series.getDeleted()).toEqual([]);
    expect(series.getEvents().slice(0, 2)).toEqual(events);
    expect(series.getEvents()[2]).toEqual({
      start: moment('2019-05-03T03:00:00.000Z').toDate(),
      end: moment('2019-05-03T04:00:00.000Z').toDate()
    });
  });
  it('removes an event', () => {
    const events = [
      {
        start: moment('2019-05-01T03:00:00.000Z').toDate(),
        end: moment('2019-05-01T04:00:00.000Z').toDate()
      },
      {
        start: moment('2019-05-02T03:00:00.000Z').toDate(),
        end: moment('2019-05-02T04:00:00.000Z').toDate()
      }
    ];
    const rrule = new RRule({
      freq: RRule.DAILY,
      interval: 1,
      dtstart: moment("2019-05-01T03:00:00.000Z").toDate(),
      until: moment("2019-05-01T03:00:00.000Z").toDate()
    });
    const series = new Series(events);
    series.setRecurrence(rrule.toString());
    expect(series.getEvents().length).toEqual(1);
    expect(series.getCreated().length).toEqual(0);
    expect(series.getUpdated().length).toEqual(0);
    expect(series.getDeleted().length).toEqual(1);
    expect(series.getEvents()[0]).toEqual(events[0]);
    expect(series.getDeleted()[0]).toEqual(events[1]);
  });
});
