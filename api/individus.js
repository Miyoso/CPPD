import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
    const { type, id, nom } = req.query;

    if (req.method === 'GET') {
        try {
            if (type === 'lois') {
                const result = await sql`SELECT * FROM lois ORDER BY categorie ASC, label ASC`;
                return res.status(200).json(result);
            }
            const result = await sql`
                SELECT 
                    nom, 
                    telephone, 
                    MAX(statut) as statut,
                    MAX(photo_url) as photo_url,
                    json_agg(json_build_object(
                        'derniere_intervention', derniere_intervention,
                        'motif', motif,
                        'casiers', casiers
                    ) ORDER BY id DESC) as historique
                FROM individus 
                GROUP BY nom, telephone 
                ORDER BY nom ASC`;
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'POST') {
        try {
            const data = JSON.parse(req.body);
            await sql`INSERT INTO individus (nom, telephone, statut, derniere_intervention, casiers, motif, photo_url)
                      VALUES (${data.nom}, ${data.telephone}, ${data.statut}, ${data.derniere_intervention}, ${data.casiers}, ${data.motif}, ${data.photo_url})`;
            return res.status(200).json({ message: 'Success' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'PATCH') {
        try {
            const data = JSON.parse(req.body);
            if (nom) {
                await sql`UPDATE individus SET statut = ${data.statut} WHERE nom = ${nom}`;
                return res.status(200).json({ message: 'Updated' });
            }
            return res.status(400).json({ error: 'Missing Name' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}