export const getUserId = () => {
  const user = localStorage.getItem('user');
  if (!user) {
    throw new Error('user not found in localStorage');
  }
  return JSON.parse(localStorage.getItem("user")!).userId;
}