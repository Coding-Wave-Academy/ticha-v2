export const isAuthenticated = () => {
  return Boolean(localStorage.getItem("ticha_token"));
};

export const requireAuth = (navigate) => {
  if (!isAuthenticated()) {
    navigate("/signup");
    return false;
  }
  return true;
};
