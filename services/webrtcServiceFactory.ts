// WebRTC Service Factory - handles module loading gracefully
import socketService from './socketService';

interface WebRTCServiceCallbacks {
  onLocalStream?: (stream: any) => void;
  onRemoteStream?: (userId: string, stream: any) => void;
  onCallStarted?: () => void;
  onCallEnded?: () => void;
  onUserJoinedCall?: (userId: string) => void;
  onUserLeftCall?: (userId: string) => void;
  onError?: (error: any) => void;
}

// Check if WebRTC is available
let isWebRTCAvailable = false;
let webrtcModule: any = null;

try {
  webrtcModule = require('react-native-webrtc');
  isWebRTCAvailable = true;
  console.log('✅ WebRTC native module loaded successfully');
} catch (error) {
  console.warn('⚠️ WebRTC native module not available, using fallback mode');
  isWebRTCAvailable = false;
}

class WebRTCServiceFactory {
  private callbacks: WebRTCServiceCallbacks = {};
  private isInCall = false;
  private currentRoomId: string | null = null;
  private currentUserId: string | null = null;
  private isMuted = false;
  private localStream: any = null;
  private peerConnections: Map<string, any> = new Map();
  private remoteStreams: Map<string, any> = new Map();

  // WebRTC configuration
  private readonly rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Initialize the service
  initialize(callbacks: WebRTCServiceCallbacks, userId: string) {
    this.callbacks = callbacks;
    this.currentUserId = userId;
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    // Listen for WebRTC signaling events
    socketService.updateCallbacks({
      onVoiceCallOffer: (data) => this.handleOffer(data),
      onVoiceCallAnswer: (data) => this.handleAnswer(data),
      onVoiceCallIceCandidate: (data) => this.handleIceCandidate(data),
      onVoiceCallStarted: (data) => this.handleCallStarted(data),
      onVoiceCallEnded: (data) => this.handleCallEnded(data),
      onUserJoinedVoiceCall: (data) => this.handleUserJoinedCall(data),
      onUserLeftVoiceCall: (data) => this.handleUserLeftCall(data),
    });
  }

  // Start a voice call in a room
  async startCall(roomId: string) {
    try {
      console.log('🎤 Starting voice call in room:', roomId);
      this.currentRoomId = roomId;
      
      if (isWebRTCAvailable) {
        // Use real WebRTC
        await this.getUserMedia();
      } else {
        // Fallback mode - just simulate
        console.log('🎤 Using fallback mode - no actual audio');
      }
      
      // Notify server that call is starting
      socketService.startVoiceCall(roomId);
      
      this.isInCall = true;
      this.callbacks.onCallStarted?.();
      
    } catch (error) {
      console.error('❌ Error starting voice call:', error);
      this.callbacks.onError?.(error);
    }
  }

  // Join an existing voice call
  async joinCall(roomId: string) {
    try {
      console.log('🎤 Joining voice call in room:', roomId);
      this.currentRoomId = roomId;
      
      if (isWebRTCAvailable) {
        // Use real WebRTC
        await this.getUserMedia();
      } else {
        // Fallback mode - just simulate
        console.log('🎤 Using fallback mode - no actual audio');
      }
      
      // Notify server that user is joining call
      socketService.joinVoiceCall(roomId);
      
      this.isInCall = true;
      this.callbacks.onCallStarted?.();
      
    } catch (error) {
      console.error('❌ Error joining voice call:', error);
      this.callbacks.onError?.(error);
    }
  }

  // End the voice call
  endCall() {
    try {
      console.log('🎤 Ending voice call');
      
      if (this.currentRoomId) {
        socketService.endVoiceCall(this.currentRoomId);
      }
      
      this.cleanup();
      
    } catch (error) {
      console.error('❌ Error ending voice call:', error);
      this.callbacks.onError?.(error);
    }
  }

  // Toggle mute state
  toggleMute() {
    if (this.localStream && isWebRTCAvailable) {
      this.isMuted = !this.isMuted;
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !this.isMuted;
      }
      console.log('🎤 Mute toggled:', this.isMuted);
    } else {
      // Fallback mode
      this.isMuted = !this.isMuted;
      console.log('🎤 Mute toggled (fallback mode):', this.isMuted);
    }
  }

  // Get user media (audio) - only works if WebRTC is available
  private async getUserMedia() {
    if (!isWebRTCAvailable) {
      console.log('🎤 WebRTC not available, skipping getUserMedia');
      return;
    }

    try {
      const stream = await webrtcModule.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      
      this.localStream = stream;
      this.callbacks.onLocalStream?.(stream);
      
      console.log('🎤 Got local audio stream');
      
    } catch (error) {
      console.error('❌ Error getting user media:', error);
      throw error;
    }
  }

  // Handle incoming offer
  private async handleOffer(data: any) {
    console.log('🎤 Received offer from:', data.fromUserId);
    
    if (!isWebRTCAvailable) {
      console.log('🎤 WebRTC not available, skipping offer handling');
      return;
    }

    try {
      const { fromUserId, offer } = data;
      const peerConnection = await this.createPeerConnection(fromUserId);
      
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      socketService.sendVoiceCallAnswer(this.currentRoomId!, fromUserId, answer);
      
    } catch (error) {
      console.error('❌ Error handling offer:', error);
      this.callbacks.onError?.(error);
    }
  }

  // Handle incoming answer
  private async handleAnswer(data: any) {
    console.log('🎤 Received answer from:', data.fromUserId);
    
    if (!isWebRTCAvailable) {
      console.log('🎤 WebRTC not available, skipping answer handling');
      return;
    }

    try {
      const { fromUserId, answer } = data;
      const peerConnection = this.peerConnections.get(fromUserId);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
      }
      
    } catch (error) {
      console.error('❌ Error handling answer:', error);
      this.callbacks.onError?.(error);
    }
  }

  // Handle ICE candidate
  private async handleIceCandidate(data: any) {
    console.log('🎤 Received ICE candidate from:', data.fromUserId);
    
    if (!isWebRTCAvailable) {
      console.log('🎤 WebRTC not available, skipping ICE candidate handling');
      return;
    }

    try {
      const { fromUserId, candidate } = data;
      const peerConnection = this.peerConnections.get(fromUserId);
      if (peerConnection) {
        await peerConnection.addIceCandidate(candidate);
      }
      
    } catch (error) {
      console.error('❌ Error handling ICE candidate:', error);
      this.callbacks.onError?.(error);
    }
  }

  // Create peer connection for a user
  private async createPeerConnection(userId: string): Promise<any> {
    if (!isWebRTCAvailable) {
      console.log('🎤 WebRTC not available, skipping peer connection creation');
      return null;
    }

    const peerConnection = new webrtcModule.RTCPeerConnection(this.rtcConfiguration);
    
    // Add local stream to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track: any) => {
        peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event: any) => {
      console.log('🎤 Received remote stream from:', userId);
      const remoteStream = event.streams[0];
      this.remoteStreams.set(userId, remoteStream);
      this.callbacks.onRemoteStream?.(userId, remoteStream);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event: any) => {
      if (event.candidate) {
        socketService.sendVoiceCallIceCandidate(this.currentRoomId!, userId, event.candidate);
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('🎤 Peer connection state changed:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'disconnected' || 
          peerConnection.connectionState === 'failed') {
        this.cleanupUserConnection(userId);
      }
    };

    this.peerConnections.set(userId, peerConnection);
    return peerConnection;
  }

  // Handle call started
  private handleCallStarted(data: any) {
    console.log('🎤 Call started:', data);
    this.callbacks.onCallStarted?.();
  }

  // Handle call ended
  private handleCallEnded(data: any) {
    console.log('🎤 Call ended:', data);
    this.cleanup();
    this.callbacks.onCallEnded?.();
  }

  // Handle user joined call
  private handleUserJoinedCall(data: any) {
    const { userId } = data;
    console.log('🎤 User joined call:', userId);
    this.callbacks.onUserJoinedCall?.(userId);
    
    // Create offer for new user (only if WebRTC is available)
    if (isWebRTCAvailable) {
      this.createOfferForUser(userId);
    }
  }

  // Handle user left call
  private handleUserLeftCall(data: any) {
    const { userId } = data;
    console.log('🎤 User left call:', userId);
    this.cleanupUserConnection(userId);
    this.callbacks.onUserLeftCall?.(userId);
  }

  // Create offer for a specific user
  private async createOfferForUser(userId: string) {
    if (!isWebRTCAvailable) {
      console.log('🎤 WebRTC not available, skipping offer creation');
      return;
    }

    try {
      const peerConnection = await this.createPeerConnection(userId);
      
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      socketService.sendVoiceCallOffer(this.currentRoomId!, userId, offer);
      
    } catch (error) {
      console.error('❌ Error creating offer:', error);
      this.callbacks.onError?.(error);
    }
  }

  // Cleanup user connection
  private cleanupUserConnection(userId: string) {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);
    }
    
    this.remoteStreams.delete(userId);
  }

  // Cleanup all connections
  private cleanup() {
    console.log('🎤 Cleaning up WebRTC connections');
    
    // Close all peer connections
    this.peerConnections.forEach((peerConnection) => {
      peerConnection.close();
    });
    this.peerConnections.clear();
    
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track: any) => {
        track.stop();
      });
      this.localStream = null;
    }
    
    // Clear remote streams
    this.remoteStreams.clear();
    
    this.isInCall = false;
    this.currentRoomId = null;
  }

  // Get call status
  getCallStatus() {
    return {
      isInCall: this.isInCall,
      isMuted: this.isMuted,
      currentRoomId: this.currentRoomId,
      participantCount: this.peerConnections.size,
      isWebRTCAvailable: isWebRTCAvailable,
    };
  }

  // Get remote streams
  getRemoteStreams() {
    return this.remoteStreams;
  }

  // Get local stream
  getLocalStream() {
    return this.localStream;
  }
}

// Export singleton instance
export const webrtcService = new WebRTCServiceFactory();
export default webrtcService;
