import { z } from 'zod';

export const CaptureSourceSchema = z.enum([
  'share_sheet',
  'voice',
  'manual',
  'email',
  'screenshot',
]);
export type CaptureSource = z.infer<typeof CaptureSourceSchema>;

export const CaptureSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  rawContent: z.string(),
  source: CaptureSourceSchema,
  mediaUrl: z.string().url().nullable(),
  llmInput: z.record(z.unknown()).nullable(),
  llmOutput: z.record(z.unknown()).nullable(),
  llmModel: z.string().nullable(),
  llmCostCents: z.number().int().nonnegative().nullable(),
  processed: z.boolean(),
  createdAt: z.string().datetime(),
});
export type Capture = z.infer<typeof CaptureSchema>;
