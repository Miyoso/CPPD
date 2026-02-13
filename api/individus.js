import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
    const { type, nom, infraction_id, motif_suppression, officier } = req.query;

    if (req.method === 'GET') {
        try {
            if (type === 'lois') {
                const result = await sql`SELECT * FROM lois ORDER BY categorie ASC, label ASC`;
                return res.status(200).json(result);
            }
            if (type === 'logs') {
                const result = await sql`SELECT * FROM logs ORDER BY date DESC LIMIT 100`;
                return res.status(200).json(result);
            }
            const result = await sql`
                SELECT 
                    nom, 
                    telephone, 
                    MAX(statut) as statut,
                    MAX(photo_url) as photo_url,
                    MAX(notes) as notes,
                    json_agg(json_build_object(
                        'id', id,
                        'derniere_intervention', derniere_intervention,
                        'motif', motif,
                        'casiers', casiers,
                        'paiement', paiement
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
            await sql`INSERT INTO individus (nom, telephone, statut, derniere_intervention, casiers, motif, photo_url, notes, paiement)
                      VALUES (${data.nom}, ${data.telephone}, ${data.statut}, ${data.derniere_intervention}, ${data.casiers}, ${data.motif}, ${data.photo_url}, ${data.notes || ''}, 'Réglé')`;
            await sql`INSERT INTO logs (action, detail, officier, date) VALUES ('AJOUT', ${'Ajout du suspect : ' + data.nom}, 'Système', NOW())`;
            return res.status(200).json({ message: 'Success' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'PATCH') {
        try {
            const data = JSON.parse(req.body);
            if (infraction_id) {
                await sql`UPDATE individus SET paiement = ${data.paiement} WHERE id = ${infraction_id}`;
                return res.status(200).json({ message: 'Payment Updated' });
            }
            if (nom) {
                if (data.nouveau_nom) {
                    await sql`UPDATE individus SET nom = ${data.nouveau_nom} WHERE nom = ${nom}`;
                } else if (data.nouveau_telephone) {
                    await sql`UPDATE individus SET telephone = ${data.nouveau_telephone} WHERE nom = ${nom}`;
                } else if (data.photo_url !== undefined) {
                    await sql`UPDATE individus SET photo_url = ${data.photo_url} WHERE nom = ${nom}`;
                } else if (data.notes !== undefined) {
                    await sql`UPDATE individus SET notes = ${data.notes} WHERE nom = ${nom}`;
                } else {
                    await sql`UPDATE individus SET statut = ${data.statut} WHERE nom = ${nom}`;
                }
                return res.status(200).json({ message: 'Updated' });
            }
            return res.status(400).json({ error: 'Missing Params' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            await sql`INSERT INTO logs (action, detail, officier, date) VALUES ('SUPPRESSION', ${'Suppression de ' + nom + ' : ' + motif_suppression}, ${officier}, NOW())`;
            await sql`DELETE FROM individus WHERE nom = ${nom}`;
            return res.status(200).json({ message: 'Deleted' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}