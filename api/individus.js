import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
    const { type, nom, infraction_id, motif_suppression, officier, id_arme } = req.query;

    if (req.method === 'GET') {
        try {
            if (type === 'lois') {
                const lois = await sql`SELECT * FROM lois ORDER BY categorie ASC, label ASC`;
                return res.status(200).json(lois);
            }
            if (type === 'logs') {
                const logs = await sql`SELECT * FROM logs ORDER BY date DESC LIMIT 100`;
                return res.status(200).json(logs);
            }
            if (type === 'stock') {
                const stock = await sql`SELECT * FROM stock_armes ORDER BY modele ASC`;
                return res.status(200).json(stock);
            }
            if (type === 'stats') {
                const today = new Date().toLocaleDateString('fr-FR');
                const stats = await sql`SELECT COUNT(*) as active_bans FROM individus WHERE (casiers LIKE '%Bannissement%' OR casiers LIKE '%DÉFINITIF%') AND derniere_intervention = ${today}`;
                return res.status(200).json(stats[0]);
            }

            const [individuals, lois] = await Promise.all([
                sql`SELECT id, nom, telephone, statut, photo_url, notes, derniere_intervention, motif, casiers, paiement FROM individus ORDER BY id DESC`,
                sql`SELECT label, ban FROM lois`
            ]);

            const lawMap = {};
            lois.forEach(l => lawMap[l.label] = l.ban || 0);

            const result = individuals.map(i => {
                const motifs = i.motif ? i.motif.split(', ') : [];
                const max_ban = motifs.reduce((max, m) => Math.max(max, lawMap[m.trim()] || 0), 0);
                return { ...i, max_ban };
            });

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'POST') {
        try {
            const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            if (type === 'add_weapon') {
                await sql`INSERT INTO stock_armes (modele, numero_serie, agent_detenteur, date_entree) VALUES (${data.modele}, ${data.numero_serie}, ${data.agent_detenteur || 'En Stock'}, NOW())`;
                return res.status(200).json({ message: 'Success' });
            }
            await sql`INSERT INTO individus (nom, telephone, statut, derniere_intervention, casiers, motif, photo_url, notes, paiement) VALUES (${data.nom}, ${data.telephone}, ${data.statut}, ${data.derniere_intervention}, ${data.casiers}, ${data.motif}, ${data.photo_url}, ${data.notes || ''}, 'Réglé')`;
            await sql`INSERT INTO logs (action, detail, officier, date) VALUES ('AJOUT', ${'Ajout du suspect : ' + data.nom}, 'Système', NOW())`;
            return res.status(200).json({ message: 'Success' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'PATCH') {
        try {
            const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            if (infraction_id) {
                if (data.nouveau_motif) await sql`UPDATE individus SET motif = ${data.nouveau_motif} WHERE id = ${infraction_id}`;
                else await sql`UPDATE individus SET paiement = ${data.paiement} WHERE id = ${infraction_id}`;
                return res.status(200).json({ message: 'Updated' });
            }
            if (nom) {
                if (data.nouveau_nom) await sql`UPDATE individus SET nom = ${data.nouveau_nom} WHERE nom = ${nom}`;
                else if (data.nouveau_telephone) await sql`UPDATE individus SET telephone = ${data.nouveau_telephone} WHERE nom = ${nom}`;
                else if (data.photo_url !== undefined) await sql`UPDATE individus SET photo_url = ${data.photo_url} WHERE nom = ${nom}`;
                else if (data.notes !== undefined) await sql`UPDATE individus SET notes = ${data.notes} WHERE nom = ${nom}`;
                else await sql`UPDATE individus SET statut = ${data.statut} WHERE nom = ${nom}`;
                return res.status(200).json({ message: 'Updated' });
            }
            return res.status(400).json({ error: 'Missing Params' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            await sql`DELETE FROM individus WHERE nom = ${nom}`;
            return res.status(200).json({ message: 'Deleted' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}