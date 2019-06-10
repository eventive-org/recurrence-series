let moment = require("moment");
if ("default" in moment) {
  moment = moment["default"];
}
import Series from "../src/index";
import { RRule } from "rrule";
const MockDate = require("mockdate");

beforeAll(() => {
  MockDate.set(moment('2019-05-01T03:00:00.000Z').toDate());
});

afterAll(() => {
  MockDate.reset();
});

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
  });
  it('constructor with options', () => {
    const options = {
      maxRepeats: 100,
      length: 20
    }
    const series = new Series([], options);
    expect(series.getEvents()).toEqual([]);
    expect(series.getOptions()).toEqual(options);
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
  it.only('keeps same events with time zones', () => {
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
      dtstart: moment("2019-04-30T20:00:00.000Z").toDate(),
      until: moment("2019-05-01T20:00:00.000Z").toDate(),
      tzid: "America/Los_Angeles"
    });
    const series = new Series(events);
    series.setRecurrence(rrule.toString());
    expect(series.getEvents()).toEqual(events);
    expect(series.getCreated()).toEqual([]);
    expect(series.getUpdated()).toEqual([]);
    expect(series.getDeleted()).toEqual([]);
  });
});
describe('split', () => {
  it('split in two', () => {
    const events = [
      {
        start: moment('2019-05-01T03:00:00.000Z').toDate(),
        end: moment('2019-05-01T04:00:00.000Z').toDate()
      },
      {
        start: moment('2019-05-02T03:00:00.000Z').toDate(),
        end: moment('2019-05-02T04:00:00.000Z').toDate()
      },
      {
        start: moment('2019-05-03T03:00:00.000Z').toDate(),
        end: moment('2019-05-03T04:00:00.000Z').toDate()
      }
    ];
    const rrule = new RRule({
      freq: RRule.DAILY,
      interval: 1,
      dtstart: moment("2019-05-01T03:00:00.000Z").toDate(),
      until: moment("2019-05-02T03:00:00.000Z").toDate()
    });
    const series = new Series(events);
    const { past, future } = series.split(moment("2019-05-02T03:00:00.000Z").toDate());
    expect(past.getEvents()).toEqual([events[0]]);
    expect(past.getCreated().length).toEqual(0);
    expect(past.getUpdated().length).toEqual(0);
    expect(past.getDeleted().length).toEqual(0);
    expect(future.getEvents()).toEqual([events[1], events[2]]);
    expect(future.getCreated().length).toEqual(0);
    expect(future.getUpdated().length).toEqual(0);
    expect(future.getDeleted().length).toEqual(0);
  });
});
