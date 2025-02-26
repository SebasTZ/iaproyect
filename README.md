<a href="https://demo-nextjs-with-supabase.vercel.app/">
  <img alt="Next.js y Supabase Starter Kit - la forma más rápida de crear aplicaciones con Next.js y Supabase" src="https://demo-nextjs-with-supabase.vercel.app/opengraph-image.png">
  <h1 align="center">Next.js y Supabase Starter Kit</h1>
</a>

<p align="center">
 La forma más rápida de construir aplicaciones con Next.js y Supabase
</p>

<p align="center">
  <a href="#características"><strong>Características</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#desplegar-en-vercel"><strong>Desplegar en Vercel</strong></a> ·
  <a href="#clonar-y-ejecutar-localmente"><strong>Clonar y Ejecutar localmente</strong></a> ·
  <a href="#comentarios-problemas"><strong>Comentarios e Issues</strong></a>
  <a href="#más-ejemplos-supabase"><strong>Más Ejemplos de Supabase</strong></a>
</p>
<br/>

## Características

- Funciona a lo largo de toda la pila de [Next.js](https://nextjs.org)
  - App Router
  - Pages Router
  - Middleware
  - Componentes Cliente
  - Componentes Servidor
  - ¡Todo funciona!
- supabase-ssr: Un paquete para configurar la autenticación de Supabase utilizando cookies
- Estilizado con [Tailwind CSS](https://tailwindcss.com)
- Componentes con [shadcn/ui](https://ui.shadcn.com/)
- Despliegue opcional con [Integración de Supabase en Vercel y despliegue en Vercel](#desplegar-en-vercel)
  - Variables de entorno asignadas automáticamente al proyecto de Vercel

## Demo

Puedes ver una demo completamente funcional en [demo-nextjs-with-supabase.vercel.app](https://demo-nextjs-with-supabase.vercel.app/).

## Desplegar en Vercel

El despliegue en Vercel te guiará en el proceso de creación de una cuenta y proyecto en Supabase.

Después de la instalación de la integración de Supabase, todas las variables de entorno relevantes se asignarán al proyecto, por lo que el despliegue funcionará de forma completa.

[![Desplegar con Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This+starter+configures+Supabase+Auth+to+use+cookies%2C+making+the+user%27s+session+available+throughout+the+entire+Next.js+app+-+Client+Components%2C+Server+Components%2C+Route+Handlers%2C+Server+Actions+and+Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png)

La opción anterior también clonará el Starter Kit en tu GitHub; puedes clonarlo localmente y desarrollar en tu entorno.

Si prefieres desarrollar solo localmente sin desplegar en Vercel, [sigue los pasos a continuación](#clonar-y-ejecutar-localmente).

## Clonar y Ejecutar Localmente

1. Primero necesitarás un proyecto en Supabase, que puedes crear [a través del dashboard de Supabase](https://database.new).

2. Crea una aplicación de Next.js usando el template del Starter de Supabase con alguno de estos comandos:

   ```bash
   npx create-next-app --example with-supabase with-supabase-app
   ```

   ```bash
   yarn create next-app --example with-supabase with-supabase-app
   ```

   ```bash
   pnpm create next-app --example with-supabase with-supabase-app
   ```

3. Usa `cd` para ingresar al directorio de la aplicación:

   ```bash
   cd with-supabase-app
   ```

4. Renombra el archivo `.env.example` a `.env.local` y actualiza los siguientes valores:

   ```
   NEXT_PUBLIC_SUPABASE_URL=[INSERTA AQUÍ LA URL DE TU PROYECTO SUPABASE]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERTA AQUÍ LA API ANÓNIMA DE TU PROYECTO SUPABASE]
   ```

   Ambos valores los encontrarás en la sección de configuración de API de tu proyecto en [Supabase](https://app.supabase.com/project/_/settings/api).

5. Ahora puedes ejecutar el servidor de desarrollo de Next.js:

   ```bash
   npm run dev
   ```

   El Starter Kit debería estar corriendo en [localhost:3000](http://localhost:3000/).

6. Este template viene con los estilos predeterminados de shadcn/ui inicializados. Si prefieres otros estilos de ui.shadcn, elimina `components.json` y [vuelve a instalar shadcn/ui](https://ui.shadcn.com/docs/installation/next).

> Consulta [la documentación para el Desarrollo Local](https://supabase.com/docs/guides/getting-started/local-development) para ejecutar Supabase también en tu entorno local.

## Comentarios e Issues

Por favor, envía tus comentarios e issues en el [GitHub de Supabase](https://github.com/supabase/supabase/issues/new/choose).

## Más Ejemplos de Supabase

- [Starter de Pagos por Suscripción en Next.js](https://github.com/vercel/nextjs-subscription-payments)
- [Autenticación basada en Cookies y App Router en Next.js (curso gratuito)](https://youtube.com/playlist?list=PL5S4mPUpp4OtMhpnp93EFSo42iQ40XjbF)
- [Autenticación en Supabase y Next.js App Router](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
