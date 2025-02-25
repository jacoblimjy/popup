const getUserId = () => {
  const user = localStorage.getItem('user');
  if (!user) {
    throw new Error('user not found in localStorage');
  }
  return JSON.parse(localStorage.getItem("user")!).userId;
}

const formatDate = (date: string) : string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

export {
  getUserId,
  formatDate,
}