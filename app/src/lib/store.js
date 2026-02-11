import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { generateRoadmap } from './gemini'
import { v4 as uuidv4 } from 'uuid' // User will need to install this or we use a simple random string

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useStore = create(
    persist(
        (set, get) => ({
            // Session Management
            sessions: {}, // Keyed by ID: { id, goal, role, deadline, phase, questions, ... }
            activeSessionId: null,
            currentTaskIds: null, // { nodeId, subNodeId, taskIndex } or null

            // Auth & Engagement State
            user: null, // { uid, email, displayName, ... }
            isAuthenticated: false,
            engagementMetrics: {
                tasksCompletedTotal: 0,
                nodeInteractions: 0,
                sessionStartTime: Date.now(),
                showTrap: false
            },

            // Actions
            login: (userData) => set({ user: userData, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false, activeSessionId: null }),

            createSession: (goal, role, deadline) => {
                const id = generateId();
                const newSession = {
                    id,
                    goal,
                    role,
                    deadline,
                    phase: 'assessment',
                    questions: [],
                    currentQuestionIndex: 0,
                    knownSkills: [],
                    gapSkills: [],
                    roadmap: null,
                    createdAt: new Date().toISOString(),
                    streak: 0,
                    lastActiveDate: null,
                    dailyLog: {} // { 'YYYY-MM-DD': { tasksCompleted: 0, timeSpent: 0 } }
                };

                set(state => ({
                    sessions: { ...state.sessions, [id]: newSession },
                    activeSessionId: id
                }));

                return id;
            },

            switchSession: (id) => set({ activeSessionId: id }),
            setCurrentTask: (ids) => set({ currentTaskIds: ids }),

            // Setup Assessment for Active Session
            setQuestions: (questions) => set(state => {
                const session = state.sessions[state.activeSessionId];
                if (!session) return {};

                return {
                    sessions: {
                        ...state.sessions,
                        [state.activeSessionId]: { ...session, questions }
                    }
                };
            }),

            answerQuestion: (skill, knowIt) => set((state) => {
                const session = state.sessions[state.activeSessionId];
                if (!session) return {};

                const newKnown = knowIt ? [...session.knownSkills, skill] : session.knownSkills;
                const newGap = !knowIt ? [...session.gapSkills, skill] : session.gapSkills;
                const nextIndex = session.currentQuestionIndex + 1;

                // Check if assessment is complete
                if (nextIndex >= session.questions.length) {
                    // Trigger Roadmap Generation asynchronously
                    // Update phase immediately to show loading state
                    const updatedSession = {
                        ...session,
                        knownSkills: newKnown,
                        gapSkills: newGap,
                        currentQuestionIndex: nextIndex,
                        phase: 'roadmap' // This triggers the "Loading..." state in MetroMap
                    };

                    // Optimistic update
                    set(state => ({
                        sessions: {
                            ...state.sessions,
                            [state.activeSessionId]: updatedSession
                        }
                    }));

                    generateRoadmap(session.role, newKnown, newGap).then(roadmap => {
                        set(s => {
                            // Check if the session still exists
                            if (!s.sessions[s.activeSessionId]) return {};

                            return {
                                sessions: {
                                    ...s.sessions,
                                    [s.activeSessionId]: {
                                        ...s.sessions[s.activeSessionId],
                                        roadmap,
                                        // Ensure phase is roadmap (redundant but safe)
                                        phase: 'roadmap'
                                    }
                                }
                            }
                        })
                    });

                    return {}; // State already updated optimistically above
                }

                return {
                    sessions: {
                        ...state.sessions,
                        [state.activeSessionId]: {
                            ...session,
                            knownSkills: newKnown,
                            gapSkills: newGap,
                            currentQuestionIndex: nextIndex
                        }
                    }
                };
            }),

            submitEvidence: (nodeId, subNodeId, taskIndex, evidence) => set((state) => {
                const session = state.sessions[state.activeSessionId];
                if (!session || !session.roadmap) return {};

                const newNodes = session.roadmap.nodes.map(node => {
                    if (node.id !== nodeId) return node;

                    const newSubNodes = node.subNodes.map(sub => {
                        if (sub.id !== subNodeId) return sub;

                        const newTasks = [...sub.tasks];
                        const task = newTasks[taskIndex];

                        // Handle both string and object tasks (though likely object now)
                        const taskObj = typeof task === 'string' ? { title: task } : { ...task };

                        // Append evidence
                        const currentEvidence = taskObj.evidence || [];
                        taskObj.evidence = [...currentEvidence, { ...evidence, timestamp: new Date().toISOString() }];

                        newTasks[taskIndex] = taskObj;
                        return { ...sub, tasks: newTasks };
                    });

                    return { ...node, subNodes: newSubNodes };
                });

                // Track engagement
                const newInteractions = state.engagementMetrics.nodeInteractions + 1;

                return {
                    sessions: {
                        ...state.sessions,
                        [state.activeSessionId]: {
                            ...session,
                            roadmap: { ...session.roadmap, nodes: newNodes }
                        }
                    },
                    engagementMetrics: {
                        ...state.engagementMetrics,
                        nodeInteractions: newInteractions
                    }
                };
            }),

            completeTask: (nodeId, subNodeId, taskIndex) => set((state) => {
                const session = state.sessions[state.activeSessionId];
                if (!session || !session.roadmap) return {};

                let unlockNext = false;

                const newNodes = session.roadmap.nodes.map((node, nIdx) => {
                    if (node.id === nodeId) {
                        const newSubNodes = node.subNodes.map((sub, sIdx) => {
                            if (sub.id !== subNodeId) return sub;

                            const newTasks = [...sub.tasks];
                            const task = newTasks[taskIndex];
                            const taskObj = typeof task === 'string' ? { title: task } : { ...task };

                            taskObj.completed = true;
                            taskObj.completedAt = new Date().toISOString();
                            newTasks[taskIndex] = taskObj;

                            // Reality Check Logic: First Node, First SubNode, First Task
                            if (nIdx === 0 && sIdx === 0 && taskIndex === 0) {
                                unlockNext = true;
                            }

                            return { ...sub, tasks: newTasks };
                        });
                        return { ...node, subNodes: newSubNodes };
                    }
                    return node;
                });

                if (unlockNext) {
                    // Find the second node (index 1) and unlock it if it's locked
                    if (newNodes.length > 1 && newNodes[1].status === 'locked') {
                        newNodes[1].status = 'active';
                    }
                }

                // Streak Logic
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                let newStreak = session.streak || 0;
                if (session.lastActiveDate === today) { /* already active */ }
                else if (session.lastActiveDate === yesterday) { newStreak += 1; }
                else { newStreak = 1; }

                const dailyLog = { ...(session.dailyLog || {}) };
                if (!dailyLog[today]) dailyLog[today] = { tasksCompleted: 0, timeSpent: 0 };
                dailyLog[today].tasksCompleted += 1;

                // Engagement Tracking for "Trap"
                const totalTasks = state.engagementMetrics.tasksCompletedTotal + 1;
                let showTrap = state.engagementMetrics.showTrap;

                // TRAP LOGIC: Show if 1+ tasks completed AND not logged in
                if (totalTasks >= 1 && !state.isAuthenticated) {
                    showTrap = true;
                }

                return {
                    sessions: {
                        ...state.sessions,
                        [state.activeSessionId]: {
                            ...session,
                            roadmap: { ...session.roadmap, nodes: newNodes },
                            streak: newStreak,
                            lastActiveDate: today,
                            dailyLog
                        }
                    },
                    engagementMetrics: {
                        ...state.engagementMetrics,
                        tasksCompletedTotal: totalTasks,
                        showTrap
                    }
                };
            }),

            logTime: (minutes) => set((state) => {
                const session = state.sessions[state.activeSessionId];
                if (!session) return {};
                const today = new Date().toISOString().split('T')[0];
                const dailyLog = { ...(session.dailyLog || {}) };
                if (!dailyLog[today]) dailyLog[today] = { tasksCompleted: 0, timeSpent: 0 };
                dailyLog[today].timeSpent += minutes;
                return {
                    sessions: { ...state.sessions, [state.activeSessionId]: { ...session, dailyLog } }
                };
            }),

            deleteSession: (id) => set(state => {
                const newSessions = { ...state.sessions };
                delete newSessions[id];
                return {
                    sessions: newSessions,
                    activeSessionId: state.activeSessionId === id ? null : state.activeSessionId
                };
            }),

            closeTrap: () => set(state => ({
                engagementMetrics: { ...state.engagementMetrics, showTrap: false }
            })),

            reset: () => set({ activeSessionId: null })
        }),
        {
            name: 'justask-storage', // unique name
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
            partialize: (state) => ({
                sessions: state.sessions,
                activeSessionId: state.activeSessionId,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                engagementMetrics: state.engagementMetrics // Persist metrics to know when to show trap
            }),
        }
    )
)
