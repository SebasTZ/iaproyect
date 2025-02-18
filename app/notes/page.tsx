import { createClient } from '@/utils/supabase/server'

export default async function Page() {
  const supabase = await createClient() // Await the promise to get the client
  const { data: notes } = await supabase.from('notes').select()

  return <pre>{JSON.stringify(notes, null, 2)}</pre>
}