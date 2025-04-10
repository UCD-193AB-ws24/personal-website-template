"use client";

import { createContext, ReactNode, useContext } from "react";

interface PublishContextData {
  isPublish: boolean;
}

export const PublishContext = createContext<PublishContextData>({
  isPublish: false,
});

export function usePublishContext(): PublishContextData {
  const publishContext = useContext(PublishContext);
  return publishContext;
}

interface PublishContextProviderProps {
  isPublish: boolean;
  children: ReactNode;
}

export default function PublishContextProvider({
  isPublish,
  children,
}: PublishContextProviderProps) {
  return (
    <PublishContext.Provider value={{ isPublish }}>
      {children}
    </PublishContext.Provider>
  );
}
