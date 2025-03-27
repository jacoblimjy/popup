import { AttemptedQuestion, AttemptedQuestionResponse } from "./types/AttemptTypes";

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

const formatAttemptSetTimestamp = (date: string): string => {
  console.log(date)
  const dateObj = new Date(date); // Automatically converts to local time

  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('en-US', { month: 'long' });
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';

  const formattedHours = hours % 12 || 12; // Convert to 12-hour format
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  const daySuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return `${day}${daySuffix(day)} ${month} ${year} | ${formattedHours}:${formattedMinutes}${ampm}`;
};


const formatAttemptedQuestions = (questions : AttemptedQuestionResponse[]) => {
  const formattedQuestions : AttemptedQuestion[] = questions.map(({distractors, ...rest}) => ({
    ...rest,
    options: insertAnswerAtRandomIndex(
      distractors,
      rest.correct_answer
    ),
  }));
  return formattedQuestions;
}

const insertAnswerAtRandomIndex = (options: string[], correctAnswer: string) => {
  const randomIndex = Math.floor(Math.random() * options.length);
  const newArray = [...options];
  newArray.splice(randomIndex, 0, correctAnswer);
  return newArray;
};

const topics = {
  1: "Use a Rule to Make a Word",
  2: "Complete a Word Pair",
  3: "Anagram in a Sentence",
  4: "Word Ladders",
};

const difficulty_levels = {
  1: "Easy",
  2: "Medium",
  3: "Hard"
};

const getMinutes = (milliseconds: number) => {
  return `${Math.floor(milliseconds / 60000)}`;
};

const getSeconds = (milliseconds: number) => {
  const secs = Math.floor((milliseconds % 60000) / 1000);
  return secs < 10 ? `0${secs}` : `${secs}`;
};

const formatTime = (milliseconds: number) => {
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = getMinutes(milliseconds % 3600000);
  const seconds = getSeconds(milliseconds);
  return `${hours}:${minutes.padStart(2, '0')}:${seconds}`;
};

let handleSessionTimeout: (() => void) | null = null;

export const setSessionTimeoutHandler = (handler: () => void) => {
  handleSessionTimeout = handler;
};

export const getSessionTimeoutHandler = () => {
  return handleSessionTimeout;
};

export {
  getUserId,
  formatDate,
  formatDetailedDate,
  topics,
  difficulty_levels,
  getMinutes,
  getSeconds,
  formatTime,
  insertAnswerAtRandomIndex,
  formatAttemptedQuestions,
  formatAttemptSetTimestamp,
}