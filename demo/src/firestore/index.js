import app from 'firebase/app'
import 'firebase/firestore'
import 'firebase/database'
import 'firebase/storage'

const config = {
	apiKey: "AIzaSyDqLR6PYxy7q4VGK_85vzgGCJ7eQi7wIoo",
	authDomain: "vue-chat-93670.firebaseapp.com",
	projectId: "vue-chat-93670",
	storageBucket: "vue-chat-93670.appspot.com",
	messagingSenderId: "671610644085",
	appId: "1:671610644085:web:f92fcee23f2f3010d8ba3c",
	measurementId: "G-BJGQQ8BNLJ"
};

app.initializeApp(config)

export const firebase = app
export const db = app.firestore()
export const storageRef = app.storage().ref()

export const usersRef = db.collection('users')
export const roomsRef = db.collection('chatRooms')
export const messagesRef = roomId => roomsRef.doc(roomId).collection('messages')

export const filesRef = storageRef.child('files')

export const dbTimestamp = firebase.firestore.FieldValue.serverTimestamp()
export const deleteDbField = firebase.firestore.FieldValue.delete()
