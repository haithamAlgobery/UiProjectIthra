// src/hooks/useViewBatcher.ts
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendViewsBatch, clearViews } from "../features/viewSlice";
import type { RootState } from "../store/store";

export default function useViewBatcher(batchSize = 10, interval = 20000) {
  const dispatch = useDispatch();
  const viewedIds = useSelector((s: RootState) => s.views.viewedIds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!viewedIds.length) return;

    if (viewedIds.length >= batchSize) {
      dispatch(sendViewsBatch(viewedIds));
      dispatch(clearViews());
      return;
    }

    clearTimeout(timerRef.current!);
    timerRef.current = setTimeout(() => {
      dispatch(sendViewsBatch(viewedIds));
      dispatch(clearViews());
    }, interval);

    return () => clearTimeout(timerRef.current!);
  }, [viewedIds.join("|")]);

  useEffect(() => {
    const handleUnload = () => {
      if (!viewedIds.length) return;
      const payload = JSON.stringify({ contentIds: viewedIds });
      if (navigator.sendBeacon) navigator.sendBeacon("/view/bulk", payload);
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [viewedIds]);
}
