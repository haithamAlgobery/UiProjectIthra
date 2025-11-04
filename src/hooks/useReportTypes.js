import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReportTypes, selectReportTypes, selectReportTypesLoading } from "@/src/features/reportTypesSlice";

export default function useReportTypes() {
  const dispatch = useDispatch();
  const items = useSelector(selectReportTypes);

  const loading = useSelector(selectReportTypesLoading);

  const loadTypes = useCallback(() => {
    return dispatch(fetchReportTypes()).unwrap();
  }, [dispatch]);

  return { items, loading, loadTypes };
}
