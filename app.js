import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// --- Replace with your Firebase Project Config ---
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
};



const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const gallery = document.getElementById('gallery');
const uploadForm = document.getElementById('upload-form');

// 1. Fetch and Display Memories (Real-time)
const q = query(collection(db, "memories"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
    gallery.innerHTML = '';
    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const card = `
            <div class="scrapbook-card bg-white p-4 shadow-sm border border-stone-100 rounded-sm">
                <div class="overflow-hidden mb-4 aspect-square">
                    <img src="${data.imageUrl}" class="w-full h-full object-cover hover:scale-110 transition duration-700">
                </div>
                <h4 class="serif text-xl font-bold">${data.title || 'Untitled'}</h4>
                <p class="text-stone-600 text-sm italic mt-2">"${data.note}"</p>
                <div class="mt-4 pt-4 border-t border-stone-50 flex justify-between items-center">
                    <span class="text-[10px] uppercase tracking-widest text-stone-400">
                        ${new Date(data.createdAt?.toDate()).toLocaleDateString()}
                    </span>
                    <button onclick="deleteMemory('${docSnap.id}')" class="text-red-300 hover:text-red-600 text-xs">Delete</button>
                </div>
            </div>
        `;
        gallery.innerHTML += card;
    });
});

// 2. Handle Uploads
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('photo-input').files[0];
    const title = document.getElementById('photo-title').value;
    const note = document.getElementById('photo-note').value;

    if (!file) return;

    try {
        // Upload to Storage
        const storageRef = ref(storage, `photos/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);

        // Save metadata to Firestore
        await addDoc(collection(db, "memories"), {
            imageUrl: url,
            title: title,
            note: note,
            createdAt: new Date()
        });

        uploadForm.reset();
        document.getElementById('upload-modal').classList.add('hidden');
        alert("Memory saved to the album!");
    } catch (error) {
        console.error(error);
        alert("Error saving memory.");
    }
});

// Window-level function for delete (for simplicity in this demo)
window.deleteMemory = async (id) => {
    if(confirm("Are you sure you want to remove this memory?")) {
        await deleteDoc(doc(db, "memories", id));
    }
};

