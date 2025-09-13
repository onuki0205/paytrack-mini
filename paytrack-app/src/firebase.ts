import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBw7EXEykj_cEjMoI1wxzRxbraVcspOYjI",
  authDomain: "paytrack-77eed.firebaseapp.com",
  projectId: "paytrack-77eed",
  storageBucket: "paytrack-77eed.firebasestorage.app",
  messagingSenderId: "27344057310",
  appId: "1:27344057310:web:03918a1108ac013e3da34f",
  measurementId: "G-V2DRQW3YXL"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { db }
export { auth }