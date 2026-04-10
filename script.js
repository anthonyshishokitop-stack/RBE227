// ====================== FIREBASE + SEARCH HISTORY ======================

const firebaseConfig = {
    apiKey: "AIzaSyCnDsQVhQxk9Q7axCPcMSpHDcqOonBbNMc",
    authDomain: "rbe-equipment.firebaseapp.com",
    projectId: "rbe-equipment",
    storageBucket: "rbe-equipment.firebasestorage.app",
    messagingSenderId: "481759813476",
    appId: "1:481759813476:web:ef176ffa73fb65e01ca471",
    measurementId: "G-15E0HZJ2X6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

console.log('%c✅ Firebase initialized successfully', 'color:#16a34a; font-weight:bold');

// Collection name
const HISTORY_COLLECTION = 'searchHistory';

// 1. Add a new search to history
async function addToSearchHistory(jobOrderNumber, pdfName = '') {
  if (!jobOrderNumber) return;
  try {
    await db.collection(HISTORY_COLLECTION).add({
      jobOrder: jobOrderNumber.toString().trim(),
      pdfName: pdfName || `Job Order ${jobOrderNumber}`,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      searchedAt: new Date().toISOString()
    });
    console.log(`✅ Saved search: ${jobOrderNumber}`);
  } catch (e) {
    console.error("❌ Error saving search:", e);
  }
}

// 2. Real-time listener for history (call once on page load)
let historyUnsubscribe = null;

function startLiveSearchHistory(displayCallback) {
  if (historyUnsubscribe) historyUnsubscribe();

  historyUnsubscribe = db.collection(HISTORY_COLLECTION)
    .orderBy("timestamp", "desc")
    .limit(30)
    .onSnapshot(snapshot => {
      const history = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        history.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date(data.searchedAt)
        });
      });
      displayCallback(history);
    }, error => console.error("History listener error:", error));
}

// 3. Optional: Clear entire history (for testing)
window.clearSearchHistory = async () => {
  const snapshot = await db.collection(HISTORY_COLLECTION).get();
  snapshot.docs.forEach(doc => doc.ref.delete());
  console.log("🗑️ All search history cleared");
};

// ====================== END FIREBASE SETUP ======================
