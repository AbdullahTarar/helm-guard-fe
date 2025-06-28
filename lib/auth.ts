export const checkGitHubAuthStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/status', {
      method: 'GET',
      credentials: 'include' // Important for session cookies
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.authenticated || false;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
};