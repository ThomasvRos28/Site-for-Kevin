const admin = require('firebase-admin');

// For demo purposes, we'll use a mock configuration
// In production, you would use actual Firebase credentials
const mockServiceAccount = {
  type: "service_account",
  project_id: "materialflow-demo",
  private_key_id: "demo-key-id",
  private_key: "-----BEGIN PRIVATE KEY-----\nMOCK_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk@materialflow-demo.iam.gserviceaccount.com",
  client_id: "123456789",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
};

// Mock Firebase Admin initialization for demo
// In production, replace with actual Firebase project configuration
let db, bucket;

try {
  // For demo purposes, we'll simulate Firebase without actual connection
  console.log('Firebase Admin initialized in demo mode');
  
  // Mock Firestore
  db = {
    collection: (name) => ({
      add: async (data) => {
        console.log(`Mock Firestore: Adding to ${name}:`, data);
        return { id: `mock_${Date.now()}` };
      },
      get: async () => {
        console.log(`Mock Firestore: Getting from ${name}`);
        return { docs: [] };
      },
      where: (field, op, value) => ({
        get: async () => {
          console.log(`Mock Firestore: Query ${field} ${op} ${value}`);
          return { docs: [] };
        }
      }),
      orderBy: (field, direction) => ({
        get: async () => {
          console.log(`Mock Firestore: OrderBy ${field} ${direction}`);
          return { docs: [] };
        }
      })
    })
  };

  // Mock Storage
  bucket = {
    file: (path) => ({
      save: async (buffer, options) => {
        console.log(`Mock Storage: Saving file ${path}`);
        return Promise.resolve();
      },
      getSignedUrl: async (options) => {
        console.log(`Mock Storage: Getting signed URL for ${path}`);
        return [`https://mock-storage.googleapis.com/materialflow-demo/${path}`];
      },
      makePublic: async () => {
        console.log(`Mock Storage: Making ${path} public`);
        return Promise.resolve();
      }
    })
  };

} catch (error) {
  console.error('Firebase initialization error:', error);
}

module.exports = { db, bucket };
