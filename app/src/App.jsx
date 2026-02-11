import { useEffect, useState, useMemo } from 'react'
import { GoalInput } from './features/landing/GoalInput'
import { SwipeStack } from './features/assessment/SwipeStack'
import { MetroMap } from './features/roadmap/MetroMap'
import { useStore } from './lib/store'
import { parseCareerGoal, generateQuestions } from './lib/gemini'
import { Sidebar } from './components/layout/Sidebar'
import { AuthModal } from './features/auth/AuthModal'
import { ContributionGrid } from './features/auth/ContributionGrid'

import { User } from 'lucide-react'
import { ProfilePage } from './features/profile/ProfilePage'

function App() {
  const { sessions, activeSessionId, createSession, setQuestions, user, isAuthenticated } = useStore()
  const activeSession = sessions[activeSessionId]
  const phase = activeSession ? activeSession.phase : 'landing'
  const [showReplan, setShowReplan] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [replanDays, setReplanDays] = useState(7)
  const [soundOn, setSoundOn] = useState(false)

  // Time of Day theme
  const timeOfDayBg = useMemo(() => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12) return 'bg-[#FFFBF0]'  // warm morning
    if (hour >= 12 && hour < 18) return 'bg-brutal-white' // neutral afternoon
    return 'bg-[#F0F0F5]' // cool night
  }, [])

  const handleGoalSubmit = async (goal, deadline) => {
    console.log('Goal submitted:', goal, deadline)

    // 1. Parse goal via Gemini
    const result = await parseCareerGoal(goal)
    console.log('Gemini Result:', result)

    if (result.isValid) {
      // 2. Create Session (this sets it as active)
      createSession(goal, result.role, deadline)

      // 3. Generate questions via Gemini
      console.log('Generating questions for:', result.role)
      const questions = await generateQuestions(result.role)

      if (questions && questions.length > 0) {
        setQuestions(questions)
      } else {
        alert('Failed to generate questions. Please try again.')
      }
    } else {
      alert("Invalid goal.")
    }
  }

  // Calculate time metrics
  const daysLeft = activeSession?.deadline && !isNaN(new Date(activeSession.deadline)) ? Math.ceil((new Date(activeSession.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : 0
  const dayNumber = activeSession?.createdAt ? Math.max(1, Math.ceil((new Date() - new Date(activeSession.createdAt)) / (1000 * 60 * 60 * 24))) : 1
  const totalDays = activeSession?.createdAt && activeSession?.deadline ? Math.ceil((new Date(activeSession.deadline) - new Date(activeSession.createdAt)) / (1000 * 60 * 60 * 24)) : 90

  // Safe display for total days
  const displayTotalDays = isNaN(totalDays) ? '90' : totalDays

  // Find current focus: first incomplete task across all nodes
  const currentFocusTask = (() => {
    if (!activeSession?.roadmap?.nodes) return null
    for (const node of activeSession.roadmap.nodes) {
      if (node.status === 'locked') continue
      for (const sub of (node.subNodes || [])) {
        for (let i = 0; i < (sub.tasks || []).length; i++) {
          const task = sub.tasks[i]
          const t = typeof task === 'string' ? { title: task } : task
          if (!t.completed) {
            return { ...t, nodeId: node.id, subNodeId: sub.id, taskIndex: i }
          }
        }
      }
    }
    return null
  })()

  // Handler for Start/Skip
  const handleStartNow = () => {
    if (currentFocusTask) {
      setCurrentTask({ nodeId: currentFocusTask.nodeId, subNodeId: currentFocusTask.subNodeId, taskIndex: currentFocusTask.taskIndex })
    }
  }

  const handleSkip = () => {
    if (currentFocusTask) {
      completeTask(currentFocusTask.nodeId, currentFocusTask.subNodeId, currentFocusTask.taskIndex)
    }
  }
  const todayKey = new Date().toISOString().split('T')[0]
  const timeToday = activeSession?.dailyLog?.[todayKey]?.timeSpent || 0

  // Motivational quotes
  const QUOTES = [
    "Every expert was once a beginner.",
    "The best time to start was yesterday. The next best time is now.",
    "Small daily improvements lead to staggering long-term results.",
    "You don't have to be great to start. You have to start to be great.",
    "Progress, not perfection.",
    "Consistency beats intensity.",
    "The only way to learn is to build.",
    "Show your work. Ship your code.",
    "Your roadmap is yours alone. Own it.",
    "One task at a time. That's the whole secret."
  ]
  const quoteIndex = activeSessionId ? activeSessionId.charCodeAt(0) % QUOTES.length : 0
  const quote = QUOTES[quoteIndex]

  return (
    <div className={`min-h-screen ${timeOfDayBg} flex flex-col items-center p-4 relative overflow-hidden transition-colors duration-1000`}>
      <Sidebar />
      <AuthModal />
      {showProfile && <ProfilePage onClose={() => setShowProfile(false)} />}

      {/* Profile Icon - Top Right Absolute */}
      <button
        onClick={() => setShowProfile(true)}
        className="fixed top-4 right-4 z-[90] bg-white border-2 border-black p-2 shadow-brutal hover:translate-y-0.5 hover:shadow-none transition-all"
        title="View Profile"
      >
        <User size={24} strokeWidth={2.5} />
      </button>

      {/* Background Dot Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '24px 24px' }}
      />

      <div className="z-10 w-full max-w-7xl flex flex-col items-center gap-6">

        {/* Dynamic Header */}
        {phase === 'roadmap' ? (
          <div className="w-full flex flex-col bg-white border-3 border-black shadow-brutal mb-4">
            {/* Top Row: Goal + Metrics */}
            <div className="flex flex-col md:flex-row justify-between items-center px-6 py-5 gap-4">
              <div>
                <span className="font-mono text-xs text-gray-500 uppercase">Current Goal</span>
                <h1 className="text-3xl font-black uppercase leading-none">{activeSession?.role || activeSession?.goal}</h1>
              </div>

              <div className="flex gap-3 flex-wrap items-center">
                {/* Day Counter */}
                <div className="flex items-center gap-1 bg-black text-white px-4 py-2 font-mono text-base font-bold">
                  ⚡ DAY {dayNumber}/{displayTotalDays}
                </div>
                {/* Streak */}
                <div className="flex items-center gap-1 bg-brutal-red text-white px-4 py-2 font-mono text-base font-bold">
                  🔥 STREAK: {activeSession?.streak || 0}
                </div>
                {/* Days Left */}
                <div className="flex items-center gap-1 bg-brutal-yellow text-black px-4 py-2 font-mono text-base font-bold border-2 border-black">
                  ⏱️ {daysLeft > 0 ? daysLeft : 0} DAYS LEFT
                </div>
                {/* Time Today */}
                <div className="flex items-center gap-1 bg-gray-100 text-black px-4 py-2 font-mono text-base border-2 border-black">
                  🕐 {Math.floor(timeToday / 60)}h {timeToday % 60}m TODAY
                </div>
              </div>
            </div>

            {/* Bottom Row: Current Focus + Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between border-t-2 border-black px-6 py-4 bg-gray-50 gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-gray-500 uppercase whitespace-nowrap">Current Focus:</span>
                <span className="font-black text-xl uppercase truncate max-w-md">{currentFocusTask ? currentFocusTask.title : 'All caught up! 🎉'}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleStartNow} className="bg-brutal-green text-black px-5 py-2 border-2 border-black font-bold text-base uppercase shadow-[3px_3px_0px_0px_#000] hover:translate-y-0.5 hover:shadow-none transition-all">
                  ▶ Start Now
                </button>
                <button onClick={handleSkip} className="bg-white text-black px-5 py-2 border-2 border-black font-bold text-base uppercase shadow-[3px_3px_0px_0px_#000] hover:translate-y-0.5 hover:shadow-none transition-all">
                  ⏭ Skip
                </button>
                <button
                  onClick={() => setShowReplan(true)}
                  className="bg-brutal-red/10 text-brutal-red px-4 py-2 border-2 border-brutal-red font-bold text-sm uppercase shadow-[2px_2px_0px_0px_rgba(239,68,68,0.5)] hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  ⚠️ Life Happened
                </button>
                <button
                  onClick={() => setSoundOn(!soundOn)}
                  className={`px-2 py-1.5 border-2 border-black text-sm transition-all ${soundOn ? 'bg-brutal-yellow' : 'bg-white'}`}
                  title={soundOn ? 'Sound On' : 'Sound Off'}
                >
                  {soundOn ? '🔊' : '🔇'}
                </button>
              </div>
            </div>

            {/* Quote Bar */}
            <div className="text-center py-1.5 border-t border-gray-200 bg-white">
              <p className="font-mono text-xs text-gray-400 italic">"{quote}"</p>
            </div>

            {/* Heatmap (Visible if we have sessions) */}
            {activeSession && <ContributionGrid />}

          </div>
        ) : (
          /* Landing Header */
          <div className="text-center space-y-4 mt-8">
            <div className="inline-block bg-brutal-black text-white px-4 py-1 font-bold mb-4 transform -rotate-2 border-2 border-transparent hover:border-brutal-yellow transition-colors">
              V4.0 ONLINE
            </div>
            <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none shadow-brutal-text">
              Just Ask.
            </h1>
            <p className="text-xl md:text-2xl font-mono font-bold bg-brutal-yellow inline-block px-4 py-1 border-3 border-black shadow-brutal transform rotate-1">
              Goal First. Action Always.
            </p>

            {/* User Greeting if logged in */}
            {isAuthenticated && user && (
              <div className="mt-4 font-mono text-lg font-bold">
                Welcome back, <span className="text-brutal-blue">{user.displayName}</span>!
              </div>
            )}
          </div>
        )}

        {/* Phase Switcher */}
        <div className="w-full flex justify-center mt-2 min-h-[400px]">
          {phase === 'landing' && (
            <GoalInput onSubmit={handleGoalSubmit} />
          )}

          {phase === 'assessment' && (
            <SwipeStack />
          )}

          {phase === 'roadmap' && (
            <div className="w-full">
              <MetroMap />
            </div>
          )}
        </div>

        {/* Feature Grid (Only on Landing) */}
        {phase === 'landing' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12 mb-12">
            <div className="brutal-border p-6 bg-white shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-crosshair">
              <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                <span className="w-4 h-4 bg-brutal-red rounded-full border-2 border-black"></span>
                GAP ANALYSIS
              </h3>
              <p className="font-mono text-sm text-gray-600">
                Identify what you don't know in 30 seconds.
              </p>
            </div>
            <div className="brutal-border p-6 bg-brutal-blue text-white shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-crosshair">
              <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                <span className="w-4 h-4 bg-white rounded-full border-2 border-black"></span>
                METRO MAP
              </h3>
              <p className="font-mono text-sm opacity-90">
                Non-linear roadmap for non-linear careers.
              </p>
            </div>
            <div className="brutal-border p-6 bg-white shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-crosshair">
              <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                <span className="w-4 h-4 bg-brutal-yellow rounded-full border-2 border-black"></span>
                MICRO-WINS
              </h3>
              <p className="font-mono text-sm text-gray-600">
                Track progress, not just tutorials watched.
              </p>
            </div>

            {/* Heatmap on landing too if authed */}
            {isAuthenticated && (
              <div className="col-span-3">
                <ContributionGrid />
              </div>
            )}
          </div>
        )}

      </div>

      {/* Emergency Replan Modal */}
      {showReplan && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border-3 border-black shadow-brutal max-w-md w-full">
            <div className="bg-brutal-red text-white px-4 py-3 font-bold font-mono text-sm uppercase tracking-wider">
              ⚠️ Life Happened — That's OK
            </div>
            <div className="p-6 space-y-4">
              <p className="font-mono text-sm text-gray-600">
                Plans adapt. You're not quitting — you're being realistic. How many extra days do you need?
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={replanDays}
                  onChange={(e) => setReplanDays(Number(e.target.value))}
                  className="flex-1 accent-brutal-red"
                />
                <span className="font-black text-2xl font-mono min-w-[60px] text-center">+{replanDays}d</span>
              </div>
              <p className="font-mono text-xs text-gray-400">
                New deadline: {activeSession?.deadline ? new Date(new Date(activeSession.deadline).getTime() + replanDays * 86400000).toLocaleDateString() : 'N/A'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // TODO: wire to store to actually update deadline
                    setShowReplan(false)
                  }}
                  className="flex-1 bg-brutal-yellow text-black py-2 border-2 border-black font-bold text-sm uppercase shadow-brutal hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  Extend Plan
                </button>
                <button
                  onClick={() => setShowReplan(false)}
                  className="px-4 py-2 border-2 border-black font-bold text-sm uppercase hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
