import { ReactNode, useEffect, useState } from "react";
import { DetailedChild } from "../types/UserTypes";
import { ChildrenContext } from "./ChildrenContext";
import ChildrenApi from "../api/ChildrenApi";

export const ChildrenProvider = ({ children }: { children: ReactNode }) => {
  const [childrenList, setChildrenList] = useState<DetailedChild[] | null>(null);
  const [activeChild, setActiveChild] = useState<DetailedChild | null>(null);

  useEffect(() => {
    getChildrenList();
  }, []);

  const getChildrenList = async () => {
    try {
      const response = await ChildrenApi.getChildrenByUserId();
      console.log(response);
      setChildrenList(response);
      if (activeChild === null || !activeChild) {
        setActiveChild(response[0]);
      } else {
        setActiveChild(response.find((child : DetailedChild) => child.child_id === activeChild?.child_id));
      }

    } catch(e) {
      console.log("Failed to get children list",e);
    }
  }

  return (
    <ChildrenContext.Provider value={{ childrenList, getChildrenList, activeChild, setActiveChild }}>
      {children}
    </ChildrenContext.Provider>
  );
};

