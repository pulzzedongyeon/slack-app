export const setAuthToken = (token) => localStorage.setItem('authToken', token);
export const getAuthToken = () => localStorage.getItem('authToken');

export const setUserInfo = (user_info) => localStorage.setItem('user_info', JSON.stringify(user_info));
export const getUserInfo = () => JSON.parse(localStorage.getItem('user_info'));

export const removeAuthToken = () => localStorage.clear();