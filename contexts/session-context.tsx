import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SessionParticipant {
  id: string;
  name: string;
  currentProduct: {
    id: string;
    name: string;
    image: string;
  } | null;
}

interface SessionContextType {
  isInSession: boolean;
  isInLiveView: boolean;
  sessionRoomId: string | null;
  sessionParticipants: SessionParticipant[];
  startSession: (roomId: string, participants: SessionParticipant[]) => void;
  enterLiveView: () => void;
  exitLiveView: () => void;
  endSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [isInSession, setIsInSession] = useState(false);
  const [isInLiveView, setIsInLiveView] = useState(false);
  const [sessionRoomId, setSessionRoomId] = useState<string | null>(null);
  const [sessionParticipants, setSessionParticipants] = useState<SessionParticipant[]>([]);

  const startSession = (roomId: string, participants: SessionParticipant[]) => {
    setIsInSession(true);
    setSessionRoomId(roomId);
    setSessionParticipants(participants);
    setIsInLiveView(false);
  };

  const enterLiveView = () => {
    setIsInLiveView(true);
  };

  const exitLiveView = () => {
    setIsInLiveView(false);
  };

  const endSession = () => {
    setIsInSession(false);
    setIsInLiveView(false);
    setSessionRoomId(null);
    setSessionParticipants([]);
  };

  return (
    <SessionContext.Provider
      value={{
        isInSession,
        isInLiveView,
        sessionRoomId,
        sessionParticipants,
        startSession,
        enterLiveView,
        exitLiveView,
        endSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};