const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors()); // Autorise le HTML à parler au serveur
app.use(express.json());

// Remplace par ton vrai lien fourni par Neon (dans ton dashboard)
const pool = new Pool({
    connectionString: 'postgres://utilisateur:motdepasse@ton-lien-neon.tech/nom_bdd?sslmode=require',
});

// ROUTE 1 : Envoyer la liste des entreprises au HTML
app.get('/api/entreprises', async (req, res) => {
    try {
        const resultat = await pool.query("SELECT id, nom_entreprise FROM entreprises ORDER BY nom_entreprise ASC");
        res.json(resultat.rows);
    } catch (err) {
        res.status(500).send("Erreur serveur");
    }
});

// ROUTE 2 : Inscrire un nouvel utilisateur (statut 'en_attente' par défaut)
app.post('/api/inscription', async (req, res) => {
    const { nom, email, mot_de_passe, entreprise_id } = req.body;
    try {
        await pool.query(
            "INSERT INTO utilisateurs (nom, email, mot_de_passe, entreprise_id, statut) VALUES ($1, $2, $3, $4, 'en_attente')",
            [nom, email, mot_de_passe, entreprise_id]
        );
        res.status(201).send("Inscrit !");
    } catch (err) {
        res.status(500).send("Erreur d'inscription");
    }
});

// ROUTE 3 : Récupérer la liste des gens en attente pour le patron
app.get('/api/attente', async (req, res) => {
    try {
        const resultat = await pool.query("SELECT id, nom, email, entreprise_id FROM utilisateurs WHERE statut = 'en_attente'");
        res.json(resultat.rows);
    } catch (err) {
        res.status(500).send("Erreur serveur");
    }
});

// ROUTE 4 : Le patron valide le compte
app.put('/api/valider/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("UPDATE utilisateurs SET statut = 'valide' WHERE id = $1", [id]);
        res.send("Validé !");
    } catch (err) {
        res.status(500).send("Erreur de validation");
    }
});

// Lancer le serveur sur le port 3000
app.listen(3000, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});