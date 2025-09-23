import React, { createContext, ReactNode, useContext, useState } from 'react';

interface SessionParticipant {
  id: string;
  name: string;
  avatar: string;
  isMuted: boolean;
  currentProduct: {
    id: string;
    name: string;
    image: string;
  } | null;
}

interface SessionContextType {
  isInSession: boolean;
  isInLiveView: boolean;
  isHost: boolean;
  sessionRoomId: string | null;
  sessionParticipants: SessionParticipant[];
  presenterName: string;
  isMuted: boolean;
  startSession: (roomId: string, participants: SessionParticipant[], isHost?: boolean) => void;
  enterLiveView: () => void;
  exitLiveView: () => void;
  endSession: () => void;
  toggleMute: () => void;
  setPresenter: (name: string) => void;
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
  const [isHost, setIsHost] = useState(false);
  const [sessionRoomId, setSessionRoomId] = useState<string | null>(null);
  const [sessionParticipants, setSessionParticipants] = useState<SessionParticipant[]>([]);
  const [presenterName, setPresenterName] = useState('Jasmine');
  const [isMuted, setIsMuted] = useState(false);

  const startSession = (roomId: string, participants: SessionParticipant[], isHostSession?: boolean) => {
    setIsInSession(true);
    setIsHost(isHostSession || false);
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
    setIsHost(false);
    setSessionRoomId(null);
    setSessionParticipants([]);
    setPresenterName('Jasmine');
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const setPresenter = (name: string) => {
    setPresenterName(name);
  };

  return (
    <SessionContext.Provider
      value={{
        isInSession,
        isInLiveView,
        isHost,
        sessionRoomId,
        sessionParticipants,
        presenterName,
        isMuted,
        startSession,
        enterLiveView,
        exitLiveView,
        endSession,
        toggleMute,
        setPresenter,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};