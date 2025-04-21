import { useContext } from "react";
import { ChildrenContext } from "../context/ChildrenContext";

export const useChildrenList = () => {
  const context = useContext(ChildrenContext);
  if (!context) {
    throw new Error('useChildrenList must be used within an ChildrenProvider');
  }
  return context;
};