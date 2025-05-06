// export interface Message {
//     id: number;
//     name: string;
//     message: string;
//     time: string;
//     avatar?: string;
//     unread: boolean;
//     selected?: boolean;
//     status: 'sent' | 'received' | 'read';
// }

export interface ChatResponse {
    timestamp: string;
    therapist_response: string;
    user_response ?: string;
}

export interface PromptResponse {
    timestamp: string;
    follow_up_question: string;
}

export interface Chat {
    chatType: 'from' | 'to' | 'info';
    message: string;
    time: string;
    name?: string;
}

export interface AudioResponse {
  status: string;
  path: string;
}
