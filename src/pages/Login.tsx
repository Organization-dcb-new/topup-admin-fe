import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLogin, useLoginForm } from '@/hooks/useLogin'
import { isAuthenticated } from '@/lib/auth'
import { useEffect } from 'react'

export default function LoginPage() {
  const form = useLoginForm()
  const { mutate: login, isPending } = useLogin()

  
  useEffect(() => {
    if (isAuthenticated()) {
      window.location.href = '/'
    }
  }, [])

  const onSubmit = (values: { email_or_username: string; password: string }) => {
    login(values, {
      onSuccess: () => {
        window.location.href = '/'
      },
      onError: (err) => {
        form.setError('email_or_username', {
          message: err.message,
        })
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-300/20">
      <Card className="w-96 rounded-2xl shadow-xl">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">Dashboard Redigame</CardTitle>
          <CardDescription>Login untuk melanjutkan</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email / Username */}
            <div className="space-y-2">
              <Label>Email / Username</Label>
              <Input
                {...form.register('email_or_username')}
                placeholder="admin / email@example.com"
              />
              {form.formState.errors.email_or_username && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email_or_username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" {...form.register('password')} placeholder="••••••••" />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
              {isPending ? 'Logging in...' : 'Masuk'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
