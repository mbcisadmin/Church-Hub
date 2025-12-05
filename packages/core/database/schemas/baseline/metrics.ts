import { z } from 'zod';

// Only fields actually used in applications
export const MetricSchema = z.object({
  Metric_ID: z.number(),
  Metric_Title: z.string(),
  Is_Headcount: z.boolean().nullable(),
});

export type Metric = z.infer<typeof MetricSchema>;

export const MetricMeta = {
  table: 'Metrics',
  type: 'baseline',
  usedBy: ['apps-platform']
};
