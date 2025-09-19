import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { CreateRoomData, Room, roomApi, UpdateRoomData } from '../services/roomApi';
import { useAuth } from './auth-context';

interface RoomContextType {
  rooms: Room[];
  currentRoom: Room | null;
  isLoading: boolean;
  error: string | null;
  createRoom: (roomData: CreateRoomData) => Promise<Room>;
  updateRoom: (roomId: string, roomData: UpdateRoomData) => Promise<Room>;
  deleteRoom: (roomId: string) => Promise<void>;
  getRooms: () => Promise<void>;
  getRoom: (roomId: string) => Promise<Room>;
  setCurrentRoom: (room: Room | null) => void;
  refreshRooms: () => Promise<void>;
  refreshRoom: (roomId: string) => Promise<Room>;
  addMember: (roomId: string, memberData: { userId: string; role?: 'Editor' | 'Contributor' | 'Viewer' }) => Promise<Room>;
  removeMember: (roomId: string, memberId: string) => Promise<Room>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token, isAuthenticated } = useAuth();

  // Load rooms when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      getRooms();
    }
  }, [isAuthenticated, token]);

  const getRooms = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Fetching rooms from database...');
      const response = await roomApi.getRooms(token);
      console.log('✅ Rooms fetched from database:', response.data.rooms.length, 'rooms');
      setRooms(response.data.rooms);
    } catch (error: any) {
      console.error('❌ Get rooms error:', error);
      setError(error.response?.data?.message || 'Failed to load rooms');
      // Clear any existing rooms on error
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoom = async (roomId: string): Promise<Room> => {
    if (!token) throw new Error('No authentication token');

    try {
      setIsLoading(true);
      setError(null);
      const response = await roomApi.getRoom(token, roomId);
      const room = response.data.room;
      setCurrentRoom(room);
      return room;
    } catch (error: any) {
      console.error('Get room error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load room';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createRoom = async (roomData: CreateRoomData): Promise<Room> => {
    if (!token) throw new Error('No authentication token');

    try {
      setIsLoading(true);
      setError(null);
      const response = await roomApi.createRoom(token, roomData);
      const newRoom = response.data.room;
      
      // Add the new room to the rooms list
      setRooms(prevRooms => [newRoom, ...prevRooms]);
      
      return newRoom;
    } catch (error: any) {
      console.error('Create room error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create room';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRoom = async (roomId: string, roomData: UpdateRoomData): Promise<Room> => {
    if (!token) throw new Error('No authentication token');

    try {
      setIsLoading(true);
      setError(null);
      const response = await roomApi.updateRoom(token, roomId, roomData);
      const updatedRoom = response.data.room;
      
      // Update the room in the rooms list
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room._id === roomId ? updatedRoom : room
        )
      );
      
      // Update current room if it's the one being updated
      if (currentRoom?._id === roomId) {
        setCurrentRoom(updatedRoom);
      }
      
      return updatedRoom;
    } catch (error: any) {
      console.error('Update room error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update room';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRoom = async (roomId: string): Promise<void> => {
    if (!token) throw new Error('No authentication token');

    try {
      setIsLoading(true);
      setError(null);
      await roomApi.deleteRoom(token, roomId);
      
      // Remove the room from the rooms list
      setRooms(prevRooms => prevRooms.filter(room => room._id !== roomId));
      
      // Clear current room if it's the one being deleted
      if (currentRoom?._id === roomId) {
        setCurrentRoom(null);
      }
    } catch (error: any) {
      console.error('Delete room error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete room';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRooms = async () => {
    await getRooms();
  };

  const refreshRoom = async (roomId: string): Promise<Room> => {
    if (!token) throw new Error('No authentication token');

    try {
      // Don't set loading state for refresh to prevent UI glitching
      setError(null);
      const response = await roomApi.getRoom(token, roomId);
      const room = response.data.room;
      
      // Update the room in the rooms list
      setRooms(prevRooms => 
        prevRooms.map(r => r._id === roomId ? room : r)
      );
      
      // Update current room if it's the one being refreshed
      if (currentRoom?._id === roomId) {
        setCurrentRoom(room);
      }
      
      return room;
    } catch (error: any) {
      console.error('Refresh room error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to refresh room';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const addMember = async (roomId: string, memberData: { userId: string; role?: 'Editor' | 'Contributor' | 'Viewer' }): Promise<Room> => {
    if (!token) throw new Error('No authentication token');

    try {
      setIsLoading(true);
      setError(null);
      const response = await roomApi.addMember(token, roomId, memberData);
      const updatedRoom = response.data.room;
      
      // Update the room in the rooms list
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room._id === roomId ? updatedRoom : room
        )
      );
      
      // Update current room if it's the one being updated
      if (currentRoom?._id === roomId) {
        setCurrentRoom(updatedRoom);
      }
      
      return updatedRoom;
    } catch (error: any) {
      console.error('Add member error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add member';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const removeMember = async (roomId: string, memberId: string): Promise<Room> => {
    if (!token) throw new Error('No authentication token');

    try {
      setIsLoading(true);
      setError(null);
      const response = await roomApi.removeMember(token, roomId, memberId);
      const updatedRoom = response.data.room;
      
      // Update the room in the rooms list
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room._id === roomId ? updatedRoom : room
        )
      );
      
      // Update current room if it's the one being updated
      if (currentRoom?._id === roomId) {
        setCurrentRoom(updatedRoom);
      }
      
      return updatedRoom;
    } catch (error: any) {
      console.error('Remove member error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to remove member';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RoomContext.Provider
      value={{
        rooms,
        currentRoom,
        isLoading,
        error,
        createRoom,
        updateRoom,
        deleteRoom,
        getRooms,
        getRoom,
        setCurrentRoom,
        refreshRooms,
        refreshRoom,
        addMember,
        removeMember,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
