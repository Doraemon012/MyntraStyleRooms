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
  selectedWardrobeId: string | null;
  sessionParticipants: SessionParticipant[];
  presenterName: string;
  isMuted: boolean;
  startSession: (roomId: string, participants: SessionParticipant[], isHost?: boolean, wardrobeId?: string) => void;
  enterLiveView: () => void;
  exitLiveView: () => void;
  endSession: () => void;
  toggleMute: () => void;
  setPresenter: (name: string) => void;
  setSelectedWardrobe: (wardrobeId: string | null) => void;
  addParticipant: (participant: SessionParticipant) => void;
  removeParticipant: (participantId: string) => void;
  setParticipantProduct: (participantId: string, product: { id: string; name: string; image: string } | null) => void;
  followingUserId?: string | null;
  setFollowingUser: (userId: string | null) => void;
  setParticipants: (participants: SessionParticipant[]) => void;
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
  const [selectedWardrobeId, setSelectedWardrobeId] = useState<string | null>(null);
  const [sessionParticipants, setSessionParticipants] = useState<SessionParticipant[]>([]);
  const [presenterName, setPresenterName] = useState('Jasmine');
  const [isMuted, setIsMuted] = useState(false);

  const startSession = (roomId: string, participants: SessionParticipant[], isHostSession?: boolean, wardrobeId?: string) => {
    console.log('🚀 Starting session in context:', { roomId, participants: participants.length, isHostSession, wardrobeId });
    setIsInSession(true);
    setIsHost(isHostSession || false);
    setSessionRoomId(roomId);
    setSelectedWardrobeId(wardrobeId || null);
    setSessionParticipants(participants);
    setIsInLiveView(false);
    console.log('✅ Session context updated:', { isInSession: true, isHost: isHostSession, sessionRoomId: roomId });
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
    setSelectedWardrobeId(null);
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

  const setSelectedWardrobe = (wardrobeId: string | null) => {
    setSelectedWardrobeId(wardrobeId);
  };

  const addParticipant = (participant: SessionParticipant) => {
    setSessionParticipants(prev => {
      const exists = prev.some(p => p.id === participant.id);
      if (exists) return prev;
      return [...prev, participant];
    });
  };

  const removeParticipant = (participantId: string) => {
    setSessionParticipants(prev => prev.filter(p => p.id !== participantId));
  };

  const setParticipantProduct = (participantId: string, product: { id: string; name: string; image: string } | null) => {
    console.log('🔄 Setting participant product:', { participantId, product });
    setSessionParticipants(prev => {
      const updated = prev.map(p => p.id === participantId ? { ...p, currentProduct: product } : p);
      console.log('🔄 Updated participants:', updated.map(p => ({ id: p.id, name: p.name, hasProduct: !!p.currentProduct })));
      return updated;
    });
  };

  const [followingUserId, setFollowingUserId] = useState<string | null>(null);
  const setFollowingUser = (userId: string | null) => setFollowingUserId(userId);

  const setParticipants = (participants: SessionParticipant[]) => {
    console.log('🔄 Setting participants in context:', participants.map(p => `${p.name} (${p.id})`));
    console.log('🔄 Participants details:', participants);
    setSessionParticipants(participants);
  };

  return (
    <SessionContext.Provider
      value={{
        isInSession,
        isInLiveView,
        isHost,
        sessionRoomId,
        selectedWardrobeId,
        sessionParticipants,
        presenterName,
        isMuted,
        startSession,
        enterLiveView,
        exitLiveView,
        endSession,
        toggleMute,
        setPresenter,
        setSelectedWardrobe,
        addParticipant,
        removeParticipant,
        setParticipantProduct,
        followingUserId,
        setFollowingUser,
        setParticipants,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};