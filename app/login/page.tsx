import { Suspense } from 'react'
import LoginForm from './LoginForm'
import { Loader2 } from 'lucide-react'

function Spinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<Spinner />}>
        <LoginForm />
    </Suspense>
  )
}