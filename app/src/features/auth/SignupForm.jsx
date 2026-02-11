import { useState } from 'react'
import { useStore } from '../../lib/store'

export function SignupForm({ onCancel }) {
    const { login, closeTrap } = useStore()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSignup = async (e) => {
        e.preventDefault()
        setLoading(true)

        // SIMULATED LOGIN FOR NOW
        setTimeout(() => {
            // Mock User
            const mockUser = {
                uid: 'mock-user-' + Math.random().toString(36).substr(2, 9),
                email,
                displayName: email.split('@')[0]
            }

            login(mockUser)
            setLoading(false)
            closeTrap() // Success!
            alert("Progress Saved! \n(This is a simulation. Local persistence is now active.)")
        }, 1500)
    }

    return (
        <div className="bg-white border-[8px] border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
            <div className="p-8 space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black uppercase">Just Ask.</h2>
                    <p className="font-mono bg-brutal-yellow inline-block px-2 text-sm font-bold border-2 border-black rotate-1">
                        Goal First. Action Always.
                    </p>
                </div>

                <div className="w-full h-1 bg-black" />

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-1">
                        <label className="font-mono text-xs font-bold uppercase">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="brutal-input py-2 text-base"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="font-mono text-xs font-bold uppercase">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="brutal-input py-2 text-base"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-start gap-2 pt-2">
                        <input type="checkbox" className="mt-1 w-4 h-4 border-2 border-black accent-brutal-black" />
                        <span className="font-mono text-xs text-gray-500 leading-tight">
                            Send me weekly progress reports (you can unsubscribe anytime)
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-brutal-black text-white font-black text-xl uppercase border-4 border-transparent hover:bg-brutal-blue hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? 'Saving...' : 'Create Account & Save'}
                    </button>

                    <div className="text-center pt-2">
                        <button type="button" className="text-sm font-bold underline hover:text-brutal-blue">
                            Already have an account? Log In
                        </button>
                    </div>
                </form>

                <div className="border-t-2 border-dashed border-gray-300 pt-4 mt-4">
                    <p className="font-mono text-xs text-gray-400 mb-2">We'll save:</p>
                    <ul className="grid grid-cols-1 gap-1 font-mono text-xs text-gray-600">
                        <li className="flex items-center gap-2">✓ Your roadmap</li>
                        <li className="flex items-center gap-2">✓ Your completed tasks</li>
                        <li className="flex items-center gap-2">✓ Your learning preferences</li>
                    </ul>
                </div>

                <button
                    onClick={onCancel}
                    className="w-full text-center text-xs font-mono text-gray-400 hover:text-black mt-2"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}
