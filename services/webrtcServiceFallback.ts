// Fallback WebRTC service for development when native module is not available
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

class WebRTCServiceFallback {
  private callbacks: WebRTCServiceCallbacks = {};
  private isInCall = false;
  private currentRoomId: string | null = null;
  private currentUserId: string | null = null;
  private isMuted = false;

  // Initialize the service
  initialize(callbacks: WebRTCServiceCallbacks, userId: string) {
    console.log('🎤 Initializing WebRTC Fallback Service (no native module)');
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
      console.log('🎤 Starting voice call (fallback mode) in room:', roomId);
      this.currentRoomId = roomId;
      
      // Simulate getting user media
      console.log('🎤 Simulating microphone access request...');
      
      // Notify server that call is starting
      socketService.startVoiceCall(roomId);
      
      this.isInCall = true;
      this.callbacks.onCallStarted?.();
      
    } catch (error) {
      console.error('❌ Error starting voice call (fallback):', error);
      this.callbacks.onError?.(error);
    }
  }

  // Join an existing voice call
  async joinCall(roomId: string) {
    try {
      console.log('🎤 Joining voice call (fallback mode) in room:', roomId);
      this.currentRoomId = roomId;
      
      // Simulate getting user media
      console.log('🎤 Simulating microphone access request...');
      
      // Notify server that user is joining call
      socketService.joinVoiceCall(roomId);
      
      this.isInCall = true;
      this.callbacks.onCallStarted?.();
      
    } catch (error) {
      console.error('❌ Error joining voice call (fallback):', error);
      this.callbacks.onError?.(error);
    }
  }

  // End the voice call
  endCall() {
    try {
      console.log('🎤 Ending voice call (fallback mode)');
      
      if (this.currentRoomId) {
        socketService.endVoiceCall(this.currentRoomId);
      }
      
      this.cleanup();
      
    } catch (error) {
      console.error('❌ Error ending voice call (fallback):', error);
      this.callbacks.onError?.(error);
    }
  }

  // Toggle mute state
  toggleMute() {
    this.isMuted = !this.isMuted;
    console.log('🎤 Mute toggled (fallback mode):', this.isMuted);
  }

  // Handle incoming offer
  private async handleOffer(data: any) {
    console.log('🎤 Received offer (fallback mode) from:', data.fromUserId);
    // In fallback mode, we just acknowledge the offer
  }

  // Handle incoming answer
  private async handleAnswer(data: any) {
    console.log('🎤 Received answer (fallback mode) from:', data.fromUserId);
    // In fallback mode, we just acknowledge the answer
  }

  // Handle ICE candidate
  private async handleIceCandidate(data: any) {
    console.log('🎤 Received ICE candidate (fallback mode) from:', data.fromUserId);
    // In fallback mode, we just acknowledge the ICE candidate
  }

  // Handle call started
  private handleCallStarted(data: any) {
    console.log('🎤 Call started (fallback mode):', data);
    this.callbacks.onCallStarted?.();
  }

  // Handle call ended
  private handleCallEnded(data: any) {
    console.log('🎤 Call ended (fallback mode):', data);
    this.cleanup();
    this.callbacks.onCallEnded?.();
  }

  // Handle user joined call
  private handleUserJoinedCall(data: any) {
    const { userId } = data;
    console.log('🎤 User joined call (fallback mode):', userId);
    this.callbacks.onUserJoinedCall?.(userId);
  }

  // Handle user left call
  private handleUserLeftCall(data: any) {
    const { userId } = data;
    console.log('🎤 User left call (fallback mode):', userId);
    this.callbacks.onUserLeftCall?.(userId);
  }

  // Cleanup all connections
  private cleanup() {
    console.log('🎤 Cleaning up WebRTC connections (fallback mode)');
    this.isInCall = false;
    this.currentRoomId = null;
  }

  // Get call status
  getCallStatus() {
    return {
      isInCall: this.isInCall,
      isMuted: this.isMuted,
      currentRoomId: this.currentRoomId,
      participantCount: 0, // Fallback mode doesn't track real participants
    };
  }

  // Get remote streams (empty in fallback mode)
  getRemoteStreams() {
    return new Map();
  }

  // Get local stream (null in fallback mode)
  getLocalStream() {
    return null;
  }
}

// Export singleton instance
export const webrtcServiceFallback = new WebRTCServiceFallback();
export default webrtcServiceFallback;
