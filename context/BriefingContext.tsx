import React, { createContext, useContext } from 'react';

interface BriefingContextValue {
  badgeCount: number;
  openBriefing: () => void;
}

const BriefingContext = createContext<BriefingContextValue>({
  badgeCount: 0,
  openBriefing: () => {},
});

export const BriefingProvider = BriefingContext.Provider;

export function useBriefing() {
  return useContext(BriefingContext);
}
