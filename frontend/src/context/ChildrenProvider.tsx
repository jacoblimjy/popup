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

  useEffect(() => {
    if (activeChild) {
      console.log("Problem")
      localStorage.setItem("activeChild", JSON.stringify(activeChild));
    }
  }, [activeChild]);

  const getChildrenList = async (refresh : boolean = false) => {
    if (localStorage.getItem("activeChild") && !refresh) {
      const activeChildFromStorage = JSON.parse(localStorage.getItem("activeChild") || "");
      setActiveChild(activeChildFromStorage);
    }
    try {
      const response = await ChildrenApi.getChildrenByUserId();
      console.log(response);
      setChildrenList(response.data);
      
      if (activeChild === null || !activeChild || refresh) {
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

