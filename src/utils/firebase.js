import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  initializeAuth, 
  getReactNativePersistence 
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration (Ensure you add authDomain)
const firebaseConfig = {
  apiKey: "AIzaSyBsSmU_NzncTv9hYP5srLimfJGYj5rUbKU",
  authDomain: "huna-invest-88638.firebaseapp.com",
  projectId: "huna-invest-88638",
  storageBucket: "huna-invest-88638.firebasestorage.app",
  appId: "1:66956922586:android:875a25554abae99f259fe3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const authh = getAuth()

// Initialize Firebase Auth with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Export Firebase Auth
export { auth,db };


// import { initializeApp } from "firebase/app";
// import { 
//   getAuth, 
//   initializeAuth, 
//   getReactNativePersistence 
// } from "firebase/auth";
// import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// import { getFirestore } from "firebase/firestore";

// // Your Firebase configuration (Ensure you add authDomain)
// const firebaseConfig = {
//   apiKey: "AIzaSyCfjAFRiVAwr5KEDPy_plYVrUSEM3zPULo",
//   authDomain: "hunainvest-5a38a.firebaseapp.com",
//   projectId: "hunainvest-5a38a",
//   storageBucket: "hunainvest-5a38a.appspot.com",
//   appId: "1:618098659319:android:51eebac25fab651a3228f2",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// // const authh = getAuth()

// // Initialize Firebase Auth with AsyncStorage for persistence
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage)
// });

// // Export Firebase Auth
// export { auth,db };


