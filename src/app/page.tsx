import Link from "next/link";
import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  // Si l'utilisateur est déjà connecté, on le redirige vers son tableau de bord.
  if (session?.user?.id) {
    const memberships = await prisma.membership.findMany({
      where: { userId: session.user.id },
      include: { company: true },
    });
    if (memberships.length > 0) {
      redirect(`/dashboard/${memberships[0].company.slug}`);
    }
    redirect("/pending");
  }

  // Liste des entreprises affichée à titre informatif sur la page d'accueil.
  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">
              Compta GTA RP
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Connecte-toi ou crée ton compte avec GitHub.
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
              <GitHubIcon className="h-5 w-5" />
              Continuer avec GitHub
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            Première connexion ? Un compte est créé automatiquement.
            <br />
            Un patron devra ensuite t&apos;attribuer à une entreprise.
          </p>

          {companies.length > 0 && (
            <div className="mt-8 border-t border-slate-200 pt-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Entreprises actuellement gérées
              </p>
              <ul className="space-y-2">
                {companies.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    <span className="font-medium text-slate-900">{c.name}</span>
                    {c.description && (
                      <span className="ml-2 text-slate-500">
                        — {c.description}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link href="/legal" className="hover:underline">
            Mentions légales
          </Link>
        </p>
      </div>
    </main>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.475 2 2 6.475 2 12c0 4.425 2.862 8.175 6.838 9.5.5.087.687-.213.687-.475 0-.237-.013-1.025-.013-1.862-2.512.462-3.162-.613-3.362-1.175-.113-.288-.6-1.175-1.025-1.412-.35-.188-.85-.65-.013-.663.788-.013 1.35.725 1.538 1.025.9 1.512 2.337 1.087 2.912.825.088-.65.35-1.087.638-1.337-2.225-.25-4.55-1.113-4.55-4.938 0-1.088.387-1.987 1.025-2.688-.1-.25-.45-1.275.1-2.65 0 0 .837-.262 2.75 1.026a9.28 9.28 0 0 1 2.5-.338c.85 0 1.7.112 2.5.337 1.912-1.3 2.75-1.025 2.75-1.025.55 1.375.2 2.4.1 2.65.637.7 1.025 1.587 1.025 2.687 0 3.838-2.337 4.688-4.562 4.938.362.312.675.912.675 1.85 0 1.337-.013 2.412-.013 2.75 0 .262.188.575.688.475A10.005 10.005 0 0 0 22 12c0-5.525-4.475-10-10-10Z"
      />
    </svg>
  );
}
