import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Les 2 entreprises de départ. Pour ajouter une nouvelle entreprise plus
  // tard, soit ajouter une entrée ici puis relancer `npm run db:seed`, soit
  // l'insérer directement en base via Neon / Prisma Studio.
  const companies = [
    {
      slug: "pond-cafe",
      name: "Pond Café",
      description: "Café et restauration — patrons : Alyarya K Rosell & Lucinda Rosell",
      owners: ["Alyarya K Rosell", "Lucinda Rosell"],
    },
    {
      slug: "pier-76",
      name: "Pier 76",
      description: "Pier 76 — patrons : Pers1 & Pers2",
      owners: ["Pers1", "Pers2"],
    },
  ];

  for (const c of companies) {
    const company = await prisma.company.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: { slug: c.slug, name: c.name, description: c.description },
    });
    console.log(`Entreprise OK : ${company.name} (${company.slug})`);
    console.log(`  Patrons à attribuer manuellement : ${c.owners.join(", ")}`);
  }

  console.log("\nSeed terminé.");
  console.log(
    "Une fois qu'un utilisateur s'est connecté via GitHub, attribue-lui un Membership avec role=OWNER pour devenir patron de son entreprise."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
