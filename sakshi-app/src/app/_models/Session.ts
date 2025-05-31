export interface ISessionInput {
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

export interface ISessionOutput {
  session_id: string;
  uid: string;
  status: 'completed' | 'active' | 'paused' | string;
  title: {
    session_title: string;
  };
  duration: number;
  _id: string;
  created_at: string;
  expires_at: string;
  completed_at?: string;
  phase_end_times: {
    'Initial Phase': string;
    'Intake Phase': string;
    'Exploratory Inquiry Phase': string;
    'Scenario Validation Phase': string;
    'Solution Retrieval Phase': string;
    'Intervention & Follow-Up Phase': string;
    'Progress Evaluation Phase': string;
    'Termination/Closure Phase': string;
    'Crisis Phase': string;
  };
  treatment_goals: string;
  client_expectations: string;
  session_notes?: string;
  termination_plan?: string;
  review_of_progress?: string;
  thank_you_note?: string;
  therapy_model?: string;
  metadata: Record<string, any>;
}
