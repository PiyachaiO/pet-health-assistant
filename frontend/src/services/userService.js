import api from './api'; // Assuming you have a configured axios instance in api.js

/**
 * Fetches all users from the server.
 * @returns {Promise<Array>} A promise that resolves to an array of user objects.
 */
export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    // Log the error or handle it as needed
    console.error('Error fetching users:', error);
    // Re-throw the error to be caught by the calling component
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

/**
 * Creates a new user.
 * @param {object} userData - The data for the new user (e.g., { name, email }).
 * @returns {Promise<object>} A promise that resolves to the newly created user object.
 */
export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

/**
 * Updates an existing user by their ID.
 * @param {string|number} id - The ID of the user to update.
 * @param {object} userData - The updated data for the user.
 * @returns {Promise<object>} A promise that resolves to the updated user object.
 */
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

/**
 * Deletes a user by their ID.
 * @param {string|number} id - The ID of the user to delete.
 * @returns {Promise<void>} A promise that resolves when the user is successfully deleted.
 */
export const deleteUser = async (id) => {
  try {
    await api.delete(`/users/${id}`);
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};