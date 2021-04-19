import firebase from 'firebase/app';
import 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDNv6_hN7DESQHNeSd0Z0ZwJucn2OjpGs4",
  authDomain: "workbox-installer-demo.firebaseapp.com",
  databaseURL: "https://workbox-installer-demo-default-rtdb.firebaseio.com",
  projectId: "workbox-installer-demo",
  storageBucket: "workbox-installer-demo.appspot.com",
  messagingSenderId: "716750954506",
  appId: "1:716750954506:web:e35221af2629dfa5a7bff3"
};


firebase.initializeApp(firebaseConfig);


export default firebase;