import { TimeRangeDto } from './dtos/timerange.dto';
import { TimeRangeEnum } from './timeRange.enum';

export function getTimeRangeStartAndEnd(timeRange: string): TimeRangeDto {
	const date = new Date();
	const startOfTime: Date = new Date();
	const endOfTime: Date = new Date();
	let isTimeRangeCorrect: boolean = true;

	timeRange = timeRange.toUpperCase().trim();

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
		isTimeRangeCorrect = false;
	}

	const dto: TimeRangeDto = new TimeRangeDto();
	dto.startOfTime = startOfTime;
	dto.endOfTime = endOfTime;
	dto.isTimeRangeCorrect = isTimeRangeCorrect;

	return dto;
}
