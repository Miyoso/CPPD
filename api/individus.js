import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
    const { type, id } = req.query;

    if (req.method === 'GET') {
        try {
            if (type === 'lois') {
                const result = await sql`SELECT * FROM lois ORDER BY categorie ASC, label ASC`;
                return res.status(200).json(result);
            }
            const result = await sql`SELECT * FROM individus ORDER BY id DESC`;
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'POST') {
        try {
            const data = JSON.parse(req.body);
            if (type === 'lois') {
                await sql`INSERT INTO lois (categorie, label, amende, prison, ban, sanction)
                          VALUES (${data.categorie}, ${data.label}, ${data.amende}, ${data.prison}, ${data.ban}, ${data.sanction})`;
            } else {
                await sql`INSERT INTO individus (nom, telephone, statut, derniere_intervention, casiers, motif)
                          VALUES (${data.nom}, ${data.telephone}, ${data.statut}, ${data.derniere_intervention}, ${data.casiers}, ${data.motif})`;
            }
            return res.status(200).json({ message: 'Success' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            if (type === 'lois' && id) {
                await sql`DELETE FROM lois WHERE id = ${id}`;
                return res.status(200).json({ message: 'Deleted' });
            }
            return res.status(400).json({ error: 'Missing ID' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}