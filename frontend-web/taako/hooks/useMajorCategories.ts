'use client'

import { useState, useEffect } from "react";
import { getMajorCategories } from "@/lib/category";
import { MajorCategories } from "@/types/category";

export function useMajorCategories() {
  const [majorCategories, setMajorCategories] = useState<MajorCategories[]>([]);
  const [majorCategoryId, setMajorCategoryId] = useState<number|null>(null);
  const [majorCategoryName, setMajorCategoryName] = useState<string|null>(null);
  const [majorLoading, setMajorLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setMajorLoading(true);
      try {
        const res = await getMajorCategories();
        setMajorCategories(res.result);
      } catch (err) {
        console.error(err);
      } finally{
        setMajorLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return {
    setMajorCategoryId, setMajorCategoryName,
    majorCategories, majorCategoryId, majorCategoryName,
    majorLoading,
  };
}