import * as admin from 'firebase-admin';
import serviceAccount from './alenushka-chat-eaa6a-firebase-adminsdk-fbsvc-6b07bef2fc.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: 'alenushka-chat-eaa6a.firebasestorage.app',
});

export const bucket = admin.storage().bucket();
