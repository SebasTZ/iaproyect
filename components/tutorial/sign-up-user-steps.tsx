import Link from "next/link";
import { TutorialStep } from "./tutorial-step";
import { ArrowUpRight } from "lucide-react";

export default function SignUpUserSteps() {
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const vercelEnv = process.env.VERCEL_ENV;

  return (
    <ol className="flex flex-col gap-6">
      {(vercelEnv === "preview" || vercelEnv === "production") && (
        <TutorialStep title="Configurar URLs de redirección">
          <p>
            La aplicación se está ejecutando en el entorno{" "}
            <span className="rounded bg-muted px-2 py-1 font-mono text-xs font-medium text-secondary-foreground border">
              {vercelEnv}
            </span>
            .
          </p>
          <p className="mt-4">
            {vercelEnv === "production" ? (
              <>
                La URL de producción es{" "}
                <span className="rounded bg-muted px-2 py-1 font-mono text-xs font-medium text-secondary-foreground border">
                  https://{productionUrl}
                </span>
                .<br />
                ¡La cuenta de producción se ha creado correctamente!
              </>
            ) : (
              <>
                Estás trabajando en un entorno de desarrollo. Asegúrate de
                actualizar la configuración de redirección en Supabase para
                incluir:
                <br />
                <span className="rounded bg-muted px-2 py-1 font-mono text-xs font-medium text-secondary-foreground border">
                  http://localhost:3000/**
                </span>
              </>
            )}
          </p>
          <p className="mt-4">
            Actualiza la configuración de redirección en tu proyecto de Supabase
            usando los URLs correspondientes.
          </p>
          <ul className="mt-4">
            <li>
              -{" "}
              <span className="rounded bg-muted px-2 py-1 font-mono text-xs font-medium text-secondary-foreground border">
                http://localhost:3000/**
              </span>
            </li>
            <li>
              -{" "}
              <span className="rounded bg-muted px-2 py-1 font-mono text-xs font-medium text-secondary-foreground border">
                {`https://${productionUrl}/**`}
              </span>
            </li>
            <li>
              -{" "}
              <span className="rounded bg-muted px-2 py-1 font-mono text-xs font-medium text-secondary-foreground border">
                {`https://${productionUrl?.replace(".vercel.app", "")}-*-[vercel-team-url].vercel.app/**`}
              </span>{" "}
              (El Team URL se configura en{" "}
              <Link
                className="text-primary hover:text-foreground"
                href="https://vercel.com/docs/accounts/create-a-team#find-your-team-id"
                target="_blank"
              >
                Configuración del equipo en Vercel
              </Link>
              )
            </li>
          </ul>
          <Link
            href="https://supabase.com/docs/guides/auth/redirect-urls#vercel-preview-urls"
            target="_blank"
            className="text-primary/50 hover:text-primary flex items-center text-sm gap-1 mt-4"
          >
            Documentación de Redirect URLs <ArrowUpRight size={14} />
          </Link>
        </TutorialStep>
      )}
      <TutorialStep title="Registra tu primer usuario">
        <p>
          Ingresa a la página de{" "}
          <Link
            href="/sign-up"
            className="font-bold hover:underline text-foreground/80"
          >
            Registro
          </Link>{" "}
          y regístrate. No te preocupes si ahora solo eres tú; ¡más adelante
          tendrás muchos usuarios!
        </p>
      </TutorialStep>
    </ol>
  );
}
