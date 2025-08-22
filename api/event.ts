// social/api/event.ts

const API_BASE = 'https://social-backend-y1rg.onrender.com'; // Updated to match your curl command

export async function fetchEvents( queryString = '') {
  // Add a cache-busting parameter
  const url = `${API_BASE}/event/getAllEvents${queryString ? '?' + queryString + '&' : '?'}_=${Date.now()}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
     
    },
    cache: 'no-store', // This helps in some environments
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.body || data;
}

export async function bookTicket(token: string, eventId: string, ticketData: { 
  ticketTypeId: string; 
  name: string; 
  email: string; 
  phone?: string;
}) {
  const res = await fetch(`${API_BASE}/event/bookTicket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'token': token,
    },
    body: JSON.stringify({
      eventId,
      ...ticketData
    }),
  });
  
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  
  return data.body || data;
}

export async function createTicket(token: string, ticketData: { name: string; price: string; remTicket: number }) {
  
  const res = await fetch(`${API_BASE}/event/createTicket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'token': token,
    },
    body: JSON.stringify(ticketData),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  
  return data.body.ticketId || data.body.id || data.body._id;
}

export async function createEvent(token: string, eventData: any) {
  const formData = new FormData();
 

  formData.append('title', eventData.title);
  formData.append('description', eventData.description);
  formData.append('shortDescription', eventData.shortDescription);
  formData.append('date', eventData.date);
  formData.append('time', eventData.time);
  formData.append('location', eventData.location);
  if (eventData.banner) {
    formData.append('banner', eventData.banner);
  }
  formData.append('organizer', eventData.organizer);
  formData.append('organizerId', eventData.organizerId);
  formData.append('isPaid', eventData.isPaid.toString());
  formData.append('isOnline', eventData.isOnline.toString());
  formData.append('onlineEventLink', eventData.onlineEventLink || '');
  formData.append('category', eventData.category);
  formData.append('ticketTypes', JSON.stringify(eventData.ticketTypes));
  formData.append('maxAttendees', eventData.maxAttendees.toString());
  formData.append('attendees', JSON.stringify(eventData.attendees));
  // Ensure tags and speakers are always sent as JSON strings, even if empty
  // Send tags and speakers as JSON strings (matching Postman format)
  formData.append('tags', JSON.stringify(eventData.tags || []));
  formData.append('speakers', JSON.stringify(eventData.speakers || []));
  formData.append('createdBy', eventData.createdBy);
  formData.append('likes', JSON.stringify(eventData.likes));
  formData.append('bookmarks', JSON.stringify(eventData.bookmarks));


  const res = await fetch(`${API_BASE}/event/createEvent`, { 
    method: 'POST',
    headers: {
      'token': token, 
    },
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
} 


export async function fetchEventById(token: string, eventId: string) {
  const res = await fetch(`${API_BASE}/event/${eventId}`, {
    method: 'GET',
    headers: {'token': token}
  }
  );
  if (!res.ok) throw new Error(await res.text());
  const { body } = await res.json();  
  return body;
}

export async function fetchUserBookedEvents(token: string) {
  const res = await fetch(`${API_BASE}/event/getUserBookedEvents`, {
    method: 'GET',
    headers: {
      token: token,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(await res.text());
  const response = await res.json();
  return response.body || response;
}



export async function downloadTicket(
  token: string,
  eventId: string,
  attendeeEmail: string,
  onProgress?: (progress: number) => void
) {
  const url = `${API_BASE}/event/ticket/${eventId}/${encodeURIComponent(attendeeEmail)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'token': token, // Ensure this header name matches what your API expects (e.g., 'Authorization', 'x-access-token')
        'Accept': 'application/pdf', // Explicitly tell the server you expect PDF
      },
      // You might need to add a cache control header if the server is aggressive with caching
      // cache: 'no-store',
    });


    if (!response.ok) {
      const errorText = await response.text(); // Get raw error text for more info
      throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorText.substring(0, 200)}...`);
    }

    // Attempt to clone the response before converting to blob
    // This allows you to read it as text for debugging if blob fails
    const clonedResponse = response.clone();

    // Directly convert to blob
    const blob = await response.blob();


    if (blob.size === 0) {
      // Try to read as text if blob is empty, might reveal server message
      const textFromClonedResponse = await clonedResponse.text();
      // You might want to throw an error here or return null and handle it upstream
      throw new Error('Downloaded ticket data is empty (0 bytes).');
    }

    // Report completion
    if (onProgress) {
      onProgress(100);
    }

    return blob;
  } catch (error) {
    // Rethrow to be handled by handleDownloadTicket's catch block
    throw error;
  }
}