import { createContext } from 'react';
import { DetailedChild } from '../types/UserTypes';

interface ChildrenContextType {
  childrenList: DetailedChild[] | null;
  activeChild: DetailedChild | null;
  getChildrenList: () => void;
  setActiveChild: (child: DetailedChild) => void;
}

export const ChildrenContext = createContext<ChildrenContextType | undefined>(undefined);