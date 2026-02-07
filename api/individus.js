import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const result = await sql`SELECT * FROM individus ORDER BY id DESC`;
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'POST') {
        try {
            const data = JSON.parse(req.body);
            await sql`
                INSERT INTO individus (nom, telephone, statut, derniere_intervention, casiers, motif)
                VALUES (${data.nom}, ${data.telephone}, ${data.statut}, ${data.derniere_intervention}, ${data.casiers}, ${data.motif})
            `;
            return res.status(200).json({ message: 'Success' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}