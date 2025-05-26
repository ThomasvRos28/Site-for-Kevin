// Firebase configuration for client-side
// For demo purposes, using mock configuration
// In production, replace with actual Firebase project config

const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "materialflow-demo.firebaseapp.com",
  projectId: "materialflow-demo",
  storageBucket: "materialflow-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo-app-id"
};

// Mock Firebase for demo purposes
// In production, uncomment the following lines and use actual Firebase:
// import { initializeApp } from 'firebase/app';
// import { getStorage } from 'firebase/storage';
// import { getFirestore } from 'firebase/firestore';

// const app = initializeApp(firebaseConfig);
// export const storage = getStorage(app);
// export const db = getFirestore(app);

// Mock implementations for demo
export const storage = {
  ref: (path: string) => ({
    put: async (file: File) => {
      console.log(`Mock Storage: Uploading ${file.name} to ${path}`);
      return {
        ref: {
          getDownloadURL: async () => {
            return `https://mock-storage.googleapis.com/materialflow-demo/${path}`;
          }
        }
      };
    }
  })
};

export const db = {
  collection: (name: string) => ({
    add: async (data: any) => {
      console.log(`Mock Firestore: Adding to ${name}:`, data);
      return { id: `mock_${Date.now()}` };
    },
    get: async () => {
      console.log(`Mock Firestore: Getting from ${name}`);
      return { docs: [] };
    }
  })
};

export default firebaseConfig;
