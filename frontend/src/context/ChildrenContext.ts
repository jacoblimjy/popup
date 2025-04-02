import { createContext } from 'react';
import { DetailedChild } from '../types/UserTypes';

interface ChildrenContextType {
  childrenList: DetailedChild[] | null;
  activeChild: DetailedChild | null;
  getChildrenList: (refresh? : boolean) => void;
  setActiveChild: (child: DetailedChild | null) => void;
}

export const ChildrenContext = createContext<ChildrenContextType | undefined>(undefined);