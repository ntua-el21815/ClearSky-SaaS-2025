// MOCKED login service (δεν απαιτεί backend)
export async function loginWithCredentials(email, password) {
    return {
      token: 'mock-token-123',
      user: {
        id: 1,
        name: 'Mock User',
        email,
        role: 'institution' // άλλαξε σε 'instructor' ή 'institution' για testing
      }
    };
  }
  
  export async function loginWithGoogleToken(id_token) {
    return {
      token: 'mock-google-token',
      user: {
        id: 2,
        name: 'Google User',
        email: 'google@example.com',
        role: 'instructor' // άλλαξε αν χρειάζεται
      }
    };
  }