// File: api/conversation.ts

import { Platform } from 'react-native';

// --- IMPORTANT ---
// Replace this with your actual Render backend URL
const BASE_URL = 'https://social-backend-y1rg.onrender.com';
const API_URL = 'https://social-backend-y1rg.onrender.com/conversations';

// Error handling helper
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  return response.json();
};

/**
 * Fetches all active conversations for the logged-in user.
 * Corresponds to: GET /conversations
 */
export const getConversations = async (token: string) => {
  const response = await fetch(`${BASE_URL}/conversations`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

/**
 * Fetches all messages for a specific conversation with pagination.
 * Corresponds to: GET /conversations/:conversationId/messages
 */
export const getMessagesForConversation = async (conversationId: string, token: string, page = 1, limit = 30) => {
  const response = await fetch(`${BASE_URL}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

/**
 * Accepts a pending message request.
 * Corresponds to: POST /conversations/requests/:conversationId/accept
 */
export const acceptMessageRequest = async (conversationId: string, token: string) => {
    const response = await fetch(`${BASE_URL}/conversations/requests/${conversationId}/accept`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return handleResponse(response);
};

/**
 * Fetches all pending message requests for the user.
 * Corresponds to: GET /conversations/requests
 */
export const getMessageRequests = async (token: string) => {
    const response = await fetch(`${BASE_URL}/conversations/requests`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return handleResponse(response);
};


export const findOrCreateConversation = async (recipientId: string, token: string) => {
  console.log(`API: Calling startConversation for recipient: ${recipientId}`);
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ recipientId }), // Send recipientId in the body
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to start conversation');
  }

  return response.json();
};


/**
 * Sends a new message to a conversation.
 * Can be a simple text message or a shared content message.
 */
export const sendMessage = async (
  conversationId: string,
  payload: {
    content?: string; // For text messages
    sharedPostId?: string; // For shared posts
    sharedNewsId?: string; // For shared news
  },
  token: string
) => {
  const response = await fetch(`${BASE_URL}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};