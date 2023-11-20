import { TimeRangeEnum } from './timeRange.enum';
import { HttpException } from '@nestjs/common';

export function getTimeRangeStartAndEnd(timeRange: string) {
  const date = new Date();
  const startOfTime: Date = new Date();
  const endOfTime: Date = new Date();

  if (timeRange === TimeRangeEnum.DAY.toString()) {
    startOfTime.setHours(0, 0, 0, 0);
    endOfTime.setHours(23, 59, 59, 999);
  } else if (timeRange === TimeRangeEnum.WEEK.toString()) {
    startOfTime.setDate(date.getDate() - 7);
    endOfTime.setHours(23, 59, 59, 999);
  } else if (timeRange === TimeRangeEnum.MONTH.toString()) {
    startOfTime.setDate(date.getDate() - 30);
    endOfTime.setHours(23, 59, 59, 999);
  } else {
    throw new HttpException('Parameters allowed: day, week, month', 400);
  }

  return { startOfTime, endOfTime };
}
