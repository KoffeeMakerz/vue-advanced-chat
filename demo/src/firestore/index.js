import app from 'firebase/app'
import 'firebase/firestore'
import 'firebase/database'
import 'firebase/storage'

const config = {
	apiKey: 'AIzaSyAcC9xdXWmgCgih4lif-4X9uJ4PvgAlmlo',
	authDomain: 'vue-advanced-chat-af2d7.firebaseapp.com',
	projectId: 'vue-advanced-chat-af2d7',
	storageBucket: 'vue-advanced-chat-af2d7.firebasestorage.app',
	messagingSenderId: '811857536496',
	appId: '1:811857536496:web:01c315e3d008b5e6d92935',
	measurementId: 'G-Z2P9S9SYLZ'
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
