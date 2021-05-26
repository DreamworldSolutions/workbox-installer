const LOCAL_STORAGE_KEY = "loggedIn"

export const login = () => {
  localStorage.setItem(LOCAL_STORAGE_KEY, true);
}

export const logout = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY)
}

export const isLoggedIn = () => {
  return !!localStorage.getItem(LOCAL_STORAGE_KEY);
}