import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos, error } = await supabase.from('todos').select()

  if (error) {
    return <div>Error: {error.message}</div>
  }

  interface Todo {
    id: string
    name: string
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Test</h1>
      <ul className="list-disc pl-5">
        {todos?.length === 0 && <li>No todos found.</li>}
        {todos?.map((todo: Todo) => (
          <li key={todo.id}>{todo.name}</li>
        ))}
      </ul>
    </div>
  )
}
