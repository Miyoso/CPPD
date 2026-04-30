import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function PendingPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Compte en attente
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Bienvenue {session.user.name ?? session.user.email}. Ton compte
          GitHub est bien enregistré, mais il n&apos;est rattaché à aucune
          entreprise pour l&apos;instant.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Demande à un patron de t&apos;ajouter à son entreprise pour accéder à
          la compta.
        </p>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
          className="mt-6"
        >
          <button
            type="submit"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Se déconnecter
          </button>
        </form>
      </div>
    </main>
  );
}
