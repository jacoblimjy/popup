export interface Child {
  child_name: string;
  age: number;
  education_level: number;
}

export interface DetailedChild extends Child {
  child_id : number;
  user_id : number;
  date_created : string;
}

export interface User {
  userId: number;
  username: string;
  email: string;
  role_id: number;
}