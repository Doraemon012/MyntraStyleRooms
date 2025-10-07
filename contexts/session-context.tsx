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
  // Voice call state
  isInVoiceCall: boolean;
  voiceCallParticipants: string[];
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
  // Voice call methods
  setVoiceCallState: (isInCall: boolean) => void;
  addVoiceCallParticipant: (userId: string) => void;
  removeVoiceCallParticipant: (userId: string) => void;
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
  // Voice call state
  const [isInVoiceCall, setIsInVoiceCall] = useState(false);
  const [voiceCallParticipants, setVoiceCallParticipants] = useState<string[]>([]);

  const startSession = (roomId: string, participants: SessionParticipant[], isHostSession?: boolean, wardrobeId?: string) => {
    console.log('🚀 Starting session in context:', { roomId, participants: participants.length, isHostSession, wardrobeId });
    console.log('🚀 Participants being set:', participants.map(p => `${p.name} (${p.id})`));
    
    // Remove duplicates based on participant ID
    const uniqueParticipants = participants.filter((participant, index, self) => 
      index === self.findIndex(p => p.id === participant.id)
    );
    
    console.log('🚀 Unique participants after deduplication:', uniqueParticipants.map(p => `${p.name} (${p.id})`));
    
    setIsInSession(true);
    setIsHost(isHostSession || false);
    setSessionRoomId(roomId);
    setSelectedWardrobeId(wardrobeId || null);
    setSessionParticipants(uniqueParticipants);
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
    // End voice call if active
    setIsInVoiceCall(false);
    setVoiceCallParticipants([]);
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
    console.log('➕ Adding participant:', `${participant.name} (${participant.id})`);
    setSessionParticipants(prev => {
      const exists = prev.some(p => p.id === participant.id);
      if (exists) {
        console.log('⚠️ Participant already exists, skipping:', participant.name);
        return prev;
      }
      console.log('✅ Added new participant:', participant.name);
      return [...prev, participant];
    });
  };

  const removeParticipant = (participantId: string) => {
    setSessionParticipants(prev => prev.filter(p => p.id !== participantId));
  };

  const setParticipantProduct = (participantId: string, product: { id: string; name: string; image: string } | null) => {
    console.log('🔄 Setting participant product:', { participantId, product });
    setSessionParticipants(prev => {
      console.log('🔄 Current participants before update:', prev.map(p => ({ id: p.id, name: p.name, hasProduct: !!p.currentProduct })));
      const updated = prev.map(p => p.id === participantId ? { ...p, currentProduct: product } : p);
      console.log('🔄 Updated participants after update:', updated.map(p => ({ id: p.id, name: p.name, hasProduct: !!p.currentProduct })));
      return updated;
    });
  };

  const [followingUserId, setFollowingUserId] = useState<string | null>(null);
  const setFollowingUser = (userId: string | null) => setFollowingUserId(userId);

  const setParticipants = (participants: SessionParticipant[]) => {
    console.log('🔄 Setting participants in context:', participants.map(p => `${p.name} (${p.id})`));
    console.log('🔄 Participants details:', participants);
    
    // Remove duplicates based on participant ID
    const uniqueParticipants = participants.filter((participant, index, self) => 
      index === self.findIndex(p => p.id === participant.id)
    );
    
    console.log('🔄 Unique participants after deduplication:', uniqueParticipants.map(p => `${p.name} (${p.id})`));
    
    // Only update if participants are actually different
    setSessionParticipants(prev => {
      const prevIds = prev.map(p => p.id).sort();
      const newIds = uniqueParticipants.map(p => p.id).sort();
      
      if (prevIds.length === newIds.length && prevIds.every((id, index) => id === newIds[index])) {
        console.log('🔄 Participants unchanged, skipping update');
        return prev;
      }
      
      console.log('🔄 Participants changed, updating');
      return uniqueParticipants;
    });
  };

  // Voice call methods
  const setVoiceCallState = (isInCall: boolean) => {
    setIsInVoiceCall(isInCall);
  };

  const addVoiceCallParticipant = (userId: string) => {
    setVoiceCallParticipants(prev => {
      if (prev.includes(userId)) return prev;
      return [...prev, userId];
    });
  };

  const removeVoiceCallParticipant = (userId: string) => {
    setVoiceCallParticipants(prev => prev.filter(id => id !== userId));
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
        // Voice call state
        isInVoiceCall,
        voiceCallParticipants,
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
        // Voice call methods
        setVoiceCallState,
        addVoiceCallParticipant,
        removeVoiceCallParticipant,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};