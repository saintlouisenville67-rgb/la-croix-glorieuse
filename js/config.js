// Configuration Supabase pour La Croix Glorieuse
const SUPABASE_URL = "https://rixdjcjlepadtchctxnn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeGRqY2psZXBhZHRjaGN0eG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTQ2MzMsImV4cCI6MjA4MzE5MDYzM30.0rcj8iFYw-kK7RbAAJ7ZbYqCTdHIWV1DmIQtKP_Ky4c";

// Initialisation du client
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variables globales utiles
let userName = localStorage.getItem('croix_glorieuse_user') || "";
