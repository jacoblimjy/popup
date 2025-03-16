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

const formatDetailedDate = (date: string) : string => {
  const dateObj = new Date(date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('en-US', { month: 'long' });
  const year = dateObj.getFullYear();
  const daySuffix = (day : number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  return `${day}${daySuffix(day)} ${month} ${year}`;
}

export {
  getUserId,
  formatDate,
  formatDetailedDate
}