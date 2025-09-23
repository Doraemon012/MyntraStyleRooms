// WebRTC Configuration and Utilities
export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  iceCandidatePoolSize?: number;
}

export interface WebRTCConnection {
  peerConnection: RTCPeerConnection;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

// Get WebRTC configuration from environment or defaults
export const getWebRTCConfig = (): WebRTCConfig => {
  const stunServers = process.env.EXPO_PUBLIC_WEBRTC_STUN_SERVERS || 'stun:stun.l.google.com:19302';
  const turnServer = process.env.EXPO_PUBLIC_WEBRTC_TURN_SERVER;
  const turnUsername = process.env.EXPO_PUBLIC_WEBRTC_TURN_USERNAME;
  const turnPassword = process.env.EXPO_PUBLIC_WEBRTC_TURN_PASSWORD;

  const iceServers: RTCIceServer[] = [
    // STUN servers
    ...stunServers.split(',').map(server => ({
      urls: server.trim()
    }))
  ];

  // Add TURN server if configured
  if (turnServer && turnUsername && turnPassword) {
    iceServers.push({
      urls: turnServer,
      username: turnUsername,
      credential: turnPassword
    });
  }

  return {
    iceServers,
    iceCandidatePoolSize: 10
  };
};

// Create a new RTCPeerConnection with proper configuration
export const createPeerConnection = (): RTCPeerConnection => {
  const config = getWebRTCConfig();
  
  return new RTCPeerConnection({
    iceServers: config.iceServers,
    iceCandidatePoolSize: config.iceCandidatePoolSize
  });
};

// Get user media (camera and microphone)
export const getUserMedia = async (constraints: MediaStreamConstraints = {}): Promise<MediaStream> => {
  const defaultConstraints: MediaStreamConstraints = {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 }
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    },
    ...constraints
  };

  try {
    return await navigator.mediaDevices.getUserMedia(defaultConstraints);
  } catch (error) {
    console.error('Error accessing media devices:', error);
    throw error;
  }
};

// Get display media (screen share)
export const getDisplayMedia = async (): Promise<MediaStream> => {
  try {
    return await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 }
      },
      audio: true
    });
  } catch (error) {
    console.error('Error accessing display media:', error);
    throw error;
  }
};

// Create offer for WebRTC connection
export const createOffer = async (peerConnection: RTCPeerConnection): Promise<RTCSessionDescriptionInit> => {
  try {
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
    await peerConnection.setLocalDescription(offer);
    return offer;
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error;
  }
};

// Create answer for WebRTC connection
export const createAnswer = async (peerConnection: RTCPeerConnection): Promise<RTCSessionDescriptionInit> => {
  try {
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
  } catch (error) {
    console.error('Error creating answer:', error);
    throw error;
  }
};

// Set remote description
export const setRemoteDescription = async (
  peerConnection: RTCPeerConnection, 
  description: RTCSessionDescriptionInit
): Promise<void> => {
  try {
    await peerConnection.setRemoteDescription(description);
  } catch (error) {
    console.error('Error setting remote description:', error);
    throw error;
  }
};

// Add ICE candidate
export const addIceCandidate = async (
  peerConnection: RTCPeerConnection, 
  candidate: RTCIceCandidateInit
): Promise<void> => {
  try {
    await peerConnection.addIceCandidate(candidate);
  } catch (error) {
    console.error('Error adding ICE candidate:', error);
    throw error;
  }
};

// Close WebRTC connection
export const closeConnection = (peerConnection: RTCPeerConnection): void => {
  if (peerConnection) {
    peerConnection.close();
  }
};

// Stop media streams
export const stopMediaStream = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
};

// WebRTC connection states
export const CONNECTION_STATES = {
  NEW: 'new',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  FAILED: 'failed',
  CLOSED: 'closed'
} as const;

export type ConnectionState = typeof CONNECTION_STATES[keyof typeof CONNECTION_STATES];

// ICE connection states
export const ICE_CONNECTION_STATES = {
  NEW: 'new',
  CHECKING: 'checking',
  CONNECTED: 'connected',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DISCONNECTED: 'disconnected',
  CLOSED: 'closed'
} as const;

export type IceConnectionState = typeof ICE_CONNECTION_STATES[keyof typeof ICE_CONNECTION_STATES];
