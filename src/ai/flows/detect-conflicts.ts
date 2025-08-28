'use server';

/**
 * @fileOverview Implements conflict detection for appointment scheduling.
 *
 * - detectConflicts - A function that detects potential scheduling conflicts based on user input.
 * - DetectConflictsInput - The input type for the detectConflicts function.
 * - DetectConflictsOutput - The return type for the detectConflicts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectConflictsInputSchema = z.object({
  appointmentDateTime: z
    .string()
    .describe('The date and time the user wants to schedule an appointment.'),
  existingAppointments: z
    .string()
    .describe(
      'A list of the users existing appointments, including date and time.'
    ),
  patientSchedule: z
    .string()
    .describe(
      'The patients usual schedule, including work, personal commitments, etc.'
    ),
});
export type DetectConflictsInput = z.infer<typeof DetectConflictsInputSchema>;

const DetectConflictsOutputSchema = z.object({
  hasConflicts: z
    .boolean()
    .describe(
      'Whether or not there are potential scheduling conflicts based on the input data.'
    ),
  conflictDetails: z
    .string()
    .describe(
      'A description of the scheduling conflicts and why the selected time might not work.'
    ),
});
export type DetectConflictsOutput = z.infer<typeof DetectConflictsOutputSchema>;

export async function detectConflicts(
  input: DetectConflictsInput
): Promise<DetectConflictsOutput> {
  return detectConflictsFlow(input);
}

const detectConflictsPrompt = ai.definePrompt({
  name: 'detectConflictsPrompt',
  input: {schema: DetectConflictsInputSchema},
  output: {schema: DetectConflictsOutputSchema},
  prompt: `You are an AI assistant that helps patients detect scheduling conflicts.

You will receive the following information:

Appointment Date and Time: {{{appointmentDateTime}}}
Existing Appointments: {{{existingAppointments}}}
Patient Schedule: {{{patientSchedule}}}

Based on this information, determine if there are any potential scheduling conflicts. If there are, explain the conflicts in detail.

Consider things like overlapping appointments, conflicts with the patients usual schedule, and any other potential issues.

Set the hasConflicts field to true if there are conflicts, and false if there are not.
Populate the conflictDetails field with a detailed explanation of the conflicts.
`,
});

const detectConflictsFlow = ai.defineFlow(
  {
    name: 'detectConflictsFlow',
    inputSchema: DetectConflictsInputSchema,
    outputSchema: DetectConflictsOutputSchema,
  },
  async input => {
    const {output} = await detectConflictsPrompt(input);
    return output!;
  }
);
