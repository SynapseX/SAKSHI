export interface Session {
  sessionName?: string;
  sessionTime?: string;
  sessionDuration: number;
  treatmentGoals: string;
  clientExpectations: string;
  sessionNotes?: string;
  terminationPlan: string;
  reviewOfProgress?: string;
  thankYouNote?: string;
}
