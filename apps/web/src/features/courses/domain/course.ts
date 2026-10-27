import { CourseDto, CourseMetricsDto, SubjectDto } from '@unicen/shared';

export type Course = CourseDto;
export type Subject = SubjectDto;
export type CourseMetrics = CourseMetricsDto;

export interface CourseFilter {
  term?: string;
  semester?: number;
  capacityStatus?: string;
  search?: string;
}
