import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createReport, selectReportCreating, selectReportError } from "@/src/features/reportsSlice";

export default function useReports() {
  const dispatch = useDispatch();
  const creating = useSelector(selectReportCreating);
  const error = useSelector(selectReportError);

  const sendReport = useCallback((payload) => {
    return dispatch(createReport(payload)).unwrap();
  }, [dispatch]);

  return { creating, error, sendReport };
}
