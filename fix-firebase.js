import fs from 'fs';
let code = fs.readFileSync('src/firebase.ts', 'utf8');

code = `import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import config from '../firebase-applet-config.json';

const app = initializeApp(config);
export const db = getFirestore(app, config.firestoreDatabaseId);
`;

fs.writeFileSync('src/firebase.ts', code);
