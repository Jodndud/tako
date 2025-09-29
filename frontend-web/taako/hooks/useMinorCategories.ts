import { useState } from "react";
import { getMinorCategories } from "@/lib/category";
import { MinorCategories } from "@/types/category";

export function useMinorCategories() {
  const [minorCategories, setMinorCategories] = useState<MinorCategories[]>([]);
  const [minorCategoryId, setMinorCategoryId] = useState<number|null>(null);
  const [minorCategoryName, setMinorCategoryName] = useState<string|null>(null);
  const [minorLoading, setMinorLoading] = useState(true);

  const handleGetMinorCategories = async (majorId:number) => {
    setMinorLoading(true)
    try{
      const res = await getMinorCategories(majorId);
      // console.log(res)
      setMinorCategories(res.result);
    }catch(err){
      console.error(err);
    } finally{
      setMinorLoading(false);
    }
  }

  return {
    handleGetMinorCategories, setMinorCategoryId, setMinorCategoryName,
    minorCategories, minorCategoryId, minorCategoryName,
    minorLoading,
  };
}