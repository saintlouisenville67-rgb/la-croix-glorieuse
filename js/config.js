// Configuration Supabase pour La Croix Glorieuse
const SUPABASE_URL = "https://rixdjcjlepadtchctxnn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeGRqY2psZXBhZHRjaGN0eG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTQ2MzMsImV4cCI6MjA4MzE5MDYzM30.0rcj8iFYw-kK7RbAAJ7ZbYqCTdHIWV1DmIQtKP_Ky4c";

// Initialisation du client
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variables globales utiles
let userName = localStorage.getItem('croix_glorieuse_user') || "";

// --- SYSTÈME DE TRAÇAGE DES VISITES (STATS) ---
async function trackUserPresence() {
    // 1. Créer ou récupérer un identifiant anonyme unique pour cet appareil
    let userHash = localStorage.getItem('user_presence_hash');
    if (!userHash) {
        userHash = 'u_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('user_presence_hash', userHash);
    }

    // 2. Mettre à jour la présence dans Supabase
    // .upsert va créer la ligne si le hash n'existe pas, ou la mettre à jour s'il existe
    try {
        await sb.from('user_presence').upsert({ 
            user_hash: userHash, 
            last_seen: new Date().toISOString() 
        }, { onConflict: 'user_hash' });
    } catch (error) {
        console.error("Erreur de traçage:", error);
    }
}

// Lancement du traçage dès que le fichier est chargé
trackUserPresence();
