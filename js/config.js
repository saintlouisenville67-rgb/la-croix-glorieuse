// =========================================================
// 1. CONFIGURATION PROJET PRINCIPAL (La Croix Glorieuse)
// =========================================================
const SUPABASE_URL = "https://rixdjcjlepadtchctxnn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeGRqY2psZXBhZHRjaGN0eG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTQ2MzMsImV4cCI6MjA4MzE5MDYzM30.0rcj8iFYw-kK7RbAAJ7ZbYqCTdHIWV1DmIQtKP_Ky4c";

// Initialisation du client principal
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// =========================================================
// 2. CONFIGURATION PROJET INTENTIONS (Gestion des Messes)
// =========================================================
const INT_URL = "https://pmeaimfcwtykhqtueomd.supabase.co";
const INT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZWFpbWZjd3R5a2hxdHVlb21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MzA4MzIsImV4cCI6MjA4MzMwNjgzMn0.X91Usnq8WtZYuY40UFIo7Xl8P1O46LKqe1GvJ7RIWYE";

// Initialisation du client secondaire pour les intentions de messe
const sbMesses = supabase.createClient(INT_URL, INT_KEY);


// =========================================================
// 3. VARIABLES GLOBALES ET UTILITAIRES
// =========================================================
let userName = localStorage.getItem('croix_glorieuse_user') || "";

// --- SYSTÈME DE TRAÇAGE DES VISITES (STATS) ---
// Modifié : Version non-bloquante pour garantir la fluidité
async function trackUserPresence() {
    let userHash = localStorage.getItem('user_presence_hash');
    if (!userHash) {
        userHash = 'u_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('user_presence_hash', userHash);
    }

    // On utilise un bloc try/catch isolé pour que cette fonction ne puisse JAMAIS bloquer le site
    try {
        // Pas de "await" ici pour laisser filer le script
        sb.from('user_presence').upsert({ 
            user_hash: userHash, 
            last_seen: new Date().toISOString() 
        }, { onConflict: 'user_hash' }).then(({error}) => {
            if(error) console.log("Stats en attente de configuration table.");
        });
    } catch (e) {
        // On ne fait rien, la priorité c'est l'affichage du menu
    }
}

// Lancement automatique du traçage (s'exécute en arrière-plan)
trackUserPresence();
