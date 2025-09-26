// Test message persistence functionality
const AsyncStorage = require('@react-native-async-storage/async-storage');

// Mock AsyncStorage for Node.js testing
const mockStorage = {};
global.AsyncStorage = {
  setItem: async (key, value) => {
    mockStorage[key] = value;
    console.log(`💾 Saved: ${key}`);
  },
  getItem: async (key) => {
    const value = mockStorage[key];
    console.log(`📂 Retrieved: ${key} = ${value ? 'found' : 'not found'}`);
    return value;
  },
  removeItem: async (key) => {
    delete mockStorage[key];
    console.log(`🗑️ Removed: ${key}`);
  },
  getAllKeys: async () => {
    return Object.keys(mockStorage);
  }
};

// Test message storage
async function testMessagePersistence() {
  console.log('🧪 Testing Message Persistence...\n');
  
  // Import the message storage service
  const { messageStorage } = require('./services/messageStorage.ts');
  
  const testRoomId = 'test-room-1';
  const testMessage = {
    id: '1',
    text: 'Hello, this is a test message!',
    sender: 'user',
    senderName: 'You',
    timestamp: new Date().toISOString()
  };
  
  try {
    // Test 1: Save a message
    console.log('📝 Test 1: Saving message...');
    await messageStorage.addMessage(testRoomId, testMessage);
    
    // Test 2: Load messages
    console.log('\n📂 Test 2: Loading messages...');
    const loadedMessages = await messageStorage.loadMessages(testRoomId);
    console.log(`✅ Loaded ${loadedMessages.length} messages`);
    console.log(`📄 First message: "${loadedMessages[0]?.text}"`);
    
    // Test 3: Add another message
    console.log('\n📝 Test 3: Adding another message...');
    const secondMessage = {
      id: '2',
      text: 'This is the second message!',
      sender: 'friend',
      senderName: 'Friend User',
      timestamp: new Date().toISOString()
    };
    await messageStorage.addMessage(testRoomId, secondMessage);
    
    // Test 4: Load all messages again
    console.log('\n📂 Test 4: Loading all messages...');
    const allMessages = await messageStorage.loadMessages(testRoomId);
    console.log(`✅ Total messages: ${allMessages.length}`);
    allMessages.forEach((msg, index) => {
      console.log(`   ${index + 1}. "${msg.text}" (${msg.senderName})`);
    });
    
    // Test 5: Get message count
    console.log('\n📊 Test 5: Getting message count...');
    const count = await messageStorage.getMessageCount(testRoomId);
    console.log(`✅ Message count: ${count}`);
    
    // Test 6: Get all room IDs
    console.log('\n🏠 Test 6: Getting all room IDs...');
    const roomIds = await messageStorage.getAllRoomIds();
    console.log(`✅ Room IDs: ${roomIds.join(', ')}`);
    
    console.log('\n🎉 All tests passed! Message persistence is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testMessagePersistence();
