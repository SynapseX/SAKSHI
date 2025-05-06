export interface Session {
  name?: string;
  sessionTime?: string;
  sessionDuration: number;
  treatmentGoals: string;
  clientExpectations: string;
  sessionNotes?: string;
  terminationPlan: string;
  reviewOfProgress?: string;
  thankYouNote?: string;
}
