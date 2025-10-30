import React, { useState, useContext } from 'react'
import api from '../services/api'
import { AuthContext, IAuthContext } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { toast } from 'react-hot-toast'; // <-- IMPORTED TOAST

const Signup: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const { login } = useContext(AuthContext) as IAuthContext
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post('/auth/signup', form)
      login(res.data.token, res.data.user)
      nav('/')
      toast.success('Welcome! Your account has been created.'); // <-- ADDED TOAST
    } catch (err: any) { 
      toast.error(err?.response?.data?.error || 'Signup failed'); // <-- REPLACED ALERT
    }
  }

  return (
    <div className="flex flex-col items-center justify-center pt-12">
      <div className="w-full max-w-md">
        <form 
          onSubmit={submit}
          className="bg-card p-8 rounded-lg border shadow-sm space-y-6"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold">Create an Account</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Get started by creating your SlotSwapper account.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">Name</label>
              <Input 
                id="name"
                placeholder="Your Name" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input 
                id="email"
                type="email"
                placeholder="name@example.com" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <Input 
                id="password"
                type="password" 
                placeholder="••••••••" 
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                required
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full">
            Create Account
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Signup