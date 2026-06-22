import { useMemo } from "react";
import { formatDateNumeric } from "../utils/Utils";

export const useTimeFrame = (timeframe) => {
  //   let startDate; //date you want to start filtering from
  //   let endDate; //data filter will

  const endDate = useMemo(() => {
    return formatDateNumeric(new Date());
  }, []);

  const startDate = useMemo(() => {
    const todaysDate = new Date();
    let daysAgo;
    if (timeframe === "Weekly") {
      daysAgo = new Date(todaysDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "Monthly") {
      daysAgo = new Date(todaysDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      daysAgo = new Date();
    }
    return formatDateNumeric(daysAgo);
  }, [timeframe]);

  return {
    startDate,
    endDate,
  };
};
