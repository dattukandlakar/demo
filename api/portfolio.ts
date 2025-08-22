// api/portfolio.ts

import { API_BASE } from './user';

export interface CreatePortfolioRequest {
  logo?: string; // image URI
  description: string;
  link: string; // Required by backend
  title: string; // Required by backend
}

export interface PortfolioResponse {
  success: boolean;
  message: string;
  body?: any;
  portfolio?: any;
}

/**
 * Creates a new portfolio item
 * Endpoint: POST /user/portfolio/
 * Formdata: { logo: file, description: string, link: string }
 */
export async function createPortfolio(
  token: string,
  portfolioData: CreatePortfolioRequest
): Promise<PortfolioResponse> {
  try {
    const formData = new FormData();

    // Add required fields
    formData.append('description', portfolioData.description);
    formData.append('title', portfolioData.title); // Required by backend
    formData.append('link', portfolioData.link); // Required by backend

    // Add logo file if provided
    if (portfolioData.logo) {
      // Determine file extension and MIME type
      let fileExtension = 'jpg';
      let mimeType = 'image/jpeg';
      const uriParts = portfolioData.logo.split('.');
      
      if (uriParts.length > 1) {
        fileExtension = uriParts[uriParts.length - 1].toLowerCase();
        switch (fileExtension) {
          case 'png':
            mimeType = 'image/png';
            break;
          case 'jpg':
          case 'jpeg':
            mimeType = 'image/jpeg';
            break;
          case 'heic':
            mimeType = 'image/heic';
            break;
          default:
            mimeType = 'image/jpeg';
        }
      }

      const logoFile = {
        uri: portfolioData.logo,
        type: mimeType,
        name: `portfolio_logo_${Date.now()}.${fileExtension}`,
      };

      formData.append('logo', logoFile as any);
    }

    console.log('--- PORTFOLIO API DEBUG: Sending portfolio creation request');

    const response = await fetch(`${API_BASE}/user/portfolio/`, {
      method: 'POST',
      headers: {
        'token': token,
        // Don't set Content-Type for multipart/form-data - let browser set boundary
      },
      body: formData,
    });

    console.log('--- PORTFOLIO API DEBUG: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('--- PORTFOLIO API DEBUG: Error response:', errorText);
      throw new Error(errorText || `HTTP ${response.status}: Failed to create portfolio`);
    }

    const result = await response.json();
    console.log('--- PORTFOLIO API DEBUG: Success response:', result);

    return {
      success: true,
      message: 'Portfolio created successfully',
      body: result.body || result,
      portfolio: result.portfolio || result.body || result,
    };

  } catch (error: any) {
    console.error('--- PORTFOLIO API DEBUG: Create portfolio error:', error);
    return {
      success: false,
      message: error.message || 'Failed to create portfolio',
    };
  }
}

/**
 * Gets all portfolio items for a user
 * Endpoint: GET /user/portfolio/
 */
export async function getUserPortfolio(token: string): Promise<PortfolioResponse> {
  try {
    console.log('--- PORTFOLIO API DEBUG: Fetching user portfolio');

    const response = await fetch(`${API_BASE}/user/portfolio/`, {
      method: 'GET',
      headers: {
        'token': token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('--- PORTFOLIO API DEBUG: Fetch error response:', errorText);
      throw new Error(errorText || `HTTP ${response.status}: Failed to fetch portfolio`);
    }

    const result = await response.json();
    console.log('--- PORTFOLIO API DEBUG: Fetch success response:', result);

    return {
      success: true,
      message: 'Portfolio fetched successfully',
      body: result.body || result,
      portfolio: result.portfolio || result.body || result,
    };

  } catch (error: any) {
    console.error('--- PORTFOLIO API DEBUG: Fetch portfolio error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch portfolio',
    };
  }
}

/**
 * Deletes a portfolio item
 * Endpoint: DELETE /user/portfolio/:id
 */
export async function deletePortfolio(
  token: string,
  portfolioId: string
): Promise<PortfolioResponse> {
  try {
    console.log('--- PORTFOLIO API DEBUG: Sending portfolio delete request');

    const response = await fetch(`${API_BASE}/user/portfolio/${portfolioId}`, {
      method: 'DELETE',
      headers: {
        'token': token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('--- PORTFOLIO API DEBUG: Delete error response:', errorText);
      throw new Error(errorText || `HTTP ${response.status}: Failed to delete portfolio`);
    }

    const result = await response.json();
    console.log('--- PORTFOLIO API DEBUG: Delete success response:', result);

    return {
      success: true,
      message: 'Portfolio deleted successfully',
      body: result.body || result,
    };

  } catch (error: any) {
    console.error('--- PORTFOLIO API DEBUG: Delete portfolio error:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete portfolio',
    };
  }
}

/**
 * Updates an existing portfolio item (if supported by backend)
 * Endpoint: PUT /user/portfolio/:id
 */
export async function updatePortfolio(
  token: string,
  portfolioId: string,
  portfolioData: CreatePortfolioRequest
): Promise<PortfolioResponse> {
  try {
    const formData = new FormData();

    // Add required fields
    formData.append('description', portfolioData.description);
    formData.append('title', portfolioData.title); // Required by backend
    formData.append('link', portfolioData.link); // Required by backend

    // Add logo file if provided
    if (portfolioData.logo) {
      let fileExtension = 'jpg';
      let mimeType = 'image/jpeg';
      const uriParts = portfolioData.logo.split('.');
      
      if (uriParts.length > 1) {
        fileExtension = uriParts[uriParts.length - 1].toLowerCase();
        switch (fileExtension) {
          case 'png':
            mimeType = 'image/png';
            break;
          case 'jpg':
          case 'jpeg':
            mimeType = 'image/jpeg';
            break;
          case 'heic':
            mimeType = 'image/heic';
            break;
          default:
            mimeType = 'image/jpeg';
        }
      }

      const logoFile = {
        uri: portfolioData.logo,
        type: mimeType,
        name: `portfolio_logo_${Date.now()}.${fileExtension}`,
      };

      formData.append('logo', logoFile as any);
    }

    console.log('--- PORTFOLIO API DEBUG: Sending portfolio update request');

    const response = await fetch(`${API_BASE}/user/portfolio/${portfolioId}`, {
      method: 'PUT',
      headers: {
        'token': token,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('--- PORTFOLIO API DEBUG: Update error response:', errorText);
      throw new Error(errorText || `HTTP ${response.status}: Failed to update portfolio`);
    }

    const result = await response.json();
    console.log('--- PORTFOLIO API DEBUG: Update success response:', result);

    return {
      success: true,
      message: 'Portfolio updated successfully',
      body: result.body || result,
      portfolio: result.portfolio || result.body || result,
    };

  } catch (error: any) {
    console.error('--- PORTFOLIO API DEBUG: Update portfolio error:', error);
    return {
      success: false,
      message: error.message || 'Failed to update portfolio',
    };
  }
}
