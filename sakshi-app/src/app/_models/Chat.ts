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
    app_response: string;
    critic_prompt: string;
}

export interface Chat {
    chatType: 'from' | 'to' | 'info';
    message: string;
    time: string;
    name?: string;
}
