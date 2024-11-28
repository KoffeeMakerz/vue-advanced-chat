import app from 'firebase/app'
import 'firebase/firestore'
import 'firebase/database'
import 'firebase/storage'

const config = {
	apiKey: 'AIzaSyAUnk4oenxxTGQgkUkNszXq_b0_Cqm09K0',
	authDomain: 'vue-advanced-chat-a3562.firebaseapp.com',
	databaseURL: 'https://vue-advanced-chat-a3562-default-rtdb.firebaseio.com',
	projectId: 'vue-advanced-chat-a3562',
	storageBucket: 'vue-advanced-chat-a3562.firebasestorage.app',
	messagingSenderId: '456647621872',
	appId: '1:456647621872:web:787f45d3f3b2c157c2d635',
	measurementId: 'G-YNZ168FZV3'
}

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
