import Series from "../src/index";
import * as moment from "moment";

describe("constructor", () => {
  it("empty constructor", () => {
    const series = new Series();
    expect(series.getEvents()).toEqual([]);
  });
  it("constructor with events in it", () => {
    const events = [
      {
          start_time: moment("2019-05-01T03:00:00.000Z").toDate(),
          end_time: moment("2019-05-01T03:00:00.000Z").toDate()
      },
      {
          start_time: moment("2019-05-01T03:00:00.000Z").toDate(),
          end_time: moment("2019-05-01T03:00:00.000Z").toDate()
      }
    ];
    const series = new Series(events);
    expect(series.getEvents()).toEqual(events);
  });
})
