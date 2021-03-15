import * as firebase from 'FireBase';
require('@firebase/firestore');

  var firebaseConfig = {
    apiKey: "AIzaSyB8vHUR9VSblndKZyTru7u6XUtsxjDvQqg",
    authDomain: "wily-app-eabad.firebaseapp.com",
    projectId: "wily-app-eabad",
    storageBucket: "wily-app-eabad.appspot.com",
    messagingSenderId: "949298251308",
    appId: "1:949298251308:web:2e5684a3f08d60c705f389"
  };
  
  // Initialize Firebase
    //if(!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
 // }
export default firebase.firestore()