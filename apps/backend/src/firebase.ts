import * as admin from 'firebase-admin';
import { join } from 'path';
import * as serviceAccount from './alenushka-chat-eaa6a-firebase-adminsdk-fbsvc-d861ab582c.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: 'alenushka-chat-eaa6a.firebasestorage.app',
});

export const bucket = admin.storage().bucket();
