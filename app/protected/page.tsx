import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Chat from "@/components/Chat";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="flex items-center gap-2 p-4 rounded-md">
          <InfoIcon size="16" strokeWidth={2} />
          <span>
            Aquí puedes gestionar tu Chatbot en localhost usando LM Studio.
          </span>
          <Link
            href="/reset-password"
            className="text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
          >
            RECUPERAR CONTRASEÑA
          </Link>
        </div>
      </div>
      <div>
        <h1 className="font-medium text-xl mb-4">Integrado para gestionar tu Chatbot en localhost usando LM Studio</h1>
        <Chat />
      </div>
    </div>
  );
}