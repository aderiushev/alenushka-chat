import * as admin from 'firebase-admin';
import * as serviceAccount from './alenushka-chat-eaa6a-firebase-adminsdk-fbsvc-28c16b5a00.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: 'alenushka-chat-eaa6a.firebasestorage.app',
});

export const bucket = admin.storage().bucket();
