// src/lib/store.js

import { create } from 'zustand';
// Removed `persist` and `createJSONStorage` as we are now syncing directly with Firestore.
// import { persist, createJSONStorage } from 'zustand/middleware'

// Import Firebase Firestore functions and `db` instance
import { db } from './firebase'; // Ensure db is correctly imported from your firebase.js
import { doc, writeBatch, Timestamp } from 'firebase/firestore'; // Import necessary Firestore functions

import { generateRoadmap, parseCareerGoal, generateQuestions } from './gemini';
// Assuming uuidv4 is still used for session IDs; if not, use generateId for consistency.
// import { v4 as uuidv4 } from 'uuid'; // User will need to install this or we use a simple random string

// Simple ID generator - ensure this is unique enough for your use case or use uuidv4
const generateId = () => Math.random().toString(36).substr(2, 9);


export const useStore = create((set, get) => ({

    // ===========================================
    // Core State Variables
    // ===========================================

    // User Authentication State (managed by Firebase onAuthStateChanged in App.jsx)
    user: null,         // { uid, email, displayName, photoURL } - Firebase Auth User data
    isLoggedIn: false,  // Replaces previous 'isAuthenticated'


    // Engagement Metrics (will be synced with users/{uid} document in Firestore)
    engagementMetrics: {
        currentStreak: 0,      // From Firestore schema
        totalProjects: 0,      // From Firestore schema (renamed from tasksCompletedTotal)
        heatmapData: {},       // From Firestore schema
        showTrap: false,       // Local UI state, but needs to be managed in store
        nodeInteractions: 0,   // Local metric, not directly in Firestore user doc schema
        sessionStartTime: Date.now(), // Local metric
    },

    // Session/Roadmap Management (will be synced with users/{uid}/roadmaps subcollection)
    sessions: {},           // Keyed by ID: { id, goal, role, deadline, phase, questions, roadmap, dailyLog, etc. }
    activeSessionId: null,
    currentTaskIds: null,   // { nodeId, subNodeId, taskIndex } or null
    showExchange: false,    // Toggles the Blueprint Marketplace view

    isInitialLoadComplete: false, // Tracks if first Firestore hydration is done


    // ===========================================
    // Core Actions for Firebase Integration
    // ===========================================

    // Action to set user data from Firebase Auth (called by App.jsx's onAuthStateChanged)
    setUser: (userData) => set({ user: userData, isLoggedIn: true }),

    // Action to clear user data on logout (called by App.jsx's onAuthStateChanged)
    logoutUser: () => set({
        user: null,
        isLoggedIn: false,
        engagementMetrics: { // Reset engagement metrics to initial state on logout
            currentStreak: 0,
            totalProjects: 0,
            heatmapData: {},
            showTrap: false,
            nodeInteractions: 0,
            sessionStartTime: Date.now(),
        },
        sessions: {},
        activeSessionId: null,
        currentTaskIds: null,
    }),

    // Actions to populate state after fetching from Firestore (Read on Load/Login)
    setEngagementMetrics: (metrics) => set((state) => ({
        engagementMetrics: {
            ...state.engagementMetrics, // Keep local-only metrics if they exist
            currentStreak: metrics.currentStreak || 0,
            totalProjects: metrics.totalProjects || 0,
            heatmapData: metrics.heatmapData || {},
            showTrap: metrics.showTrap ?? false, // Use nullish coalescing for boolean
        }
    })),
    setSessions: (sessionsData) => set((state) => ({
        sessions: { ...state.sessions, ...sessionsData }, // MERGE to prevent race condition overwrites
    })),
    setInitialLoadComplete: (status) => set({ isInitialLoadComplete: status }),
    setActiveSessionId: (id) => set({ activeSessionId: id }),
    setShowExchange: (show) => set({ showExchange: show, activeSessionId: show ? null : get().activeSessionId }),
    setPhase: (sessionId, phase) => set(state => ({
        sessions: {
            ...state.sessions,
            [sessionId]: { ...state.sessions[sessionId], phase }
        }
    })),

    // Action to manage the "trap" modal visibility (used by AuthModal)
    closeTrap: () => set(state => ({
        engagementMetrics: { ...state.engagementMetrics, showTrap: false }
    })),


    // ===========================================
    // NEW: syncToFirestore HELPER FOR BATCH WRITES
    // This function commits current state changes to Firestore
    // = ===========================================
    syncToFirestore: async () => {
        const state = get(); // Get the current state
        if (!state.user || !state.user.uid) {
            // Silently return if not logged in (expected behavior)
            return;
        }

        const batch = writeBatch(db);
        const userUid = state.user.uid;

        // 1. Update user document (users/{uid})
        const userRef = doc(db, "users", userUid);
        const userUpdateData = {
            displayName: state.user.displayName, // Assuming this can be updated
            email: state.user.email,             // Assuming this can be updated
            currentStreak: state.engagementMetrics.currentStreak,
            totalProjects: state.engagementMetrics.totalProjects,
            heatmapData: state.engagementMetrics.heatmapData,
            lastActiveDate: state.user.lastActiveDate || null
        };
        batch.set(userRef, userUpdateData, { merge: true }); // Always use set with merge for robustness

        // 2. Update roadmaps sub-collection (users/{uid}/roadmaps)
        // Iterate through all sessions and update them
        Object.keys(state.sessions).forEach(sessionId => {
            const roadmapRef = doc(db, "users", userUid, "goals", sessionId);
            const sessionData = state.sessions[sessionId];
            // Use set with merge:true to update or create roadmap documents
            batch.set(roadmapRef, sessionData, { merge: true });
        });

        try {
            await batch.commit();
            console.log("Firestore batch commit successful!");
        } catch (error) {
            console.error("Error committing Firestore batch:", error);
            // TODO: Implement robust error handling, e.g., revert optimistic UI, show notification, retry mechanism
        }
    },


    // ===========================================
    // Existing Actions (modified for optimistic update + background sync)
    // ===========================================

    createSession: (goal, role, deadline) => {
        const id = generateId();
        const newSession = {
            id,
            goal,
            role,
            deadline,
            status: "active", // Default status for new roadmaps
            phase: 'assessment',
            questions: [],
            currentQuestionIndex: 0,
            knownSkills: [],
            gapSkills: [],
            roadmap: null,
            createdAt: new Date().toISOString(),
            // Ensure session.streak and lastActiveDate are relevant if kept, or remove
            streak: 0,
            lastActiveDate: null,
            dailyLog: {} // { 'YYYY-MM-DD': { tasksCompleted: 0, timeSpent: 0 } }
        };

        set(state => ({
            sessions: { ...state.sessions, [id]: newSession },
            activeSessionId: id,
            // Optimistically update totalProjects (from engagementMetrics)
            engagementMetrics: {
                ...state.engagementMetrics,
                totalProjects: state.engagementMetrics.totalProjects + 1
            }
        }));
        get().syncToFirestore(); // Trigger background sync after creating session and updating metrics
        return id;
    },

    switchSession: (id) => {
        set({ activeSessionId: id, currentTaskIds: null, showExchange: false });
        get().setLastActive();
    },
    setCurrentTask: (ids) => set({ currentTaskIds: ids }),

    updateNodePosition: (nodeId, x, y) => {
        set(state => {
            const session = state.sessions[state.activeSessionId];
            if (!session || !session.roadmap) return {};

            const newNodes = session.roadmap.nodes.map(node =>
                node.id === nodeId ? { ...node, x, y } : node
            );

            return {
                sessions: {
                    ...state.sessions,
                    [state.activeSessionId]: {
                        ...session,
                        roadmap: { ...session.roadmap, nodes: newNodes }
                    }
                }
            };
        });
        get().syncToFirestore();
    },

    setLastActive: () => {
        set((state) => {
            const session = state.sessions[state.activeSessionId];
            if (!session) return {};
            const todayISO = new Date().toISOString();
            const todayYYYYMMDD = todayISO.split('T')[0];

            return {
                sessions: {
                    ...state.sessions,
                    [state.activeSessionId]: {
                        ...session,
                        lastActiveDate: todayISO
                    }
                },
                user: state.user ? { ...state.user, lastActiveDate: todayYYYYMMDD } : state.user
            };
        });
        get().syncToFirestore();
    },

    setQuestions: (questions) => {
        set(state => {
            const session = state.sessions[state.activeSessionId];
            if (!session) return {};

            return {
                sessions: {
                    ...state.sessions,
                    [state.activeSessionId]: { ...session, questions }
                }
            };
        });
        get().syncToFirestore(); // Sync after questions are set (initial setup)
    },

    answerQuestion: (skill, knowIt) => {
        set((state) => {
            const session = state.sessions[state.activeSessionId];
            if (!session) return {};

            const newKnown = knowIt ? [...session.knownSkills, skill] : session.knownSkills;
            const newGap = !knowIt ? [...session.gapSkills, skill] : session.gapSkills;
            const nextIndex = session.currentQuestionIndex + 1;

            if (nextIndex >= session.questions.length) {
                // Assessment complete, prepare for roadmap generation
                const updatedSession = {
                    ...session,
                    knownSkills: newKnown,
                    gapSkills: newGap,
                    currentQuestionIndex: nextIndex,
                    phase: 'roadmap' // Optimistically set phase to show loading
                };

                // Optimistic update
                set(state => ({
                    sessions: {
                        ...state.sessions,
                        [state.activeSessionId]: updatedSession
                    }
                }));
                get().syncToFirestore(); // Sync after assessment completion and phase update

                // Asynchronously generate roadmap and update state again
                generateRoadmap(session.role, newKnown, newGap).then(roadmap => {
                    set(s => {
                        if (!s.sessions[s.activeSessionId]) return {}; // Session might have changed or been deleted

                        const sessionsAfterRoadmap = {
                            ...s.sessions,
                            [s.activeSessionId]: {
                                ...s.sessions[s.activeSessionId],
                                roadmap,
                                phase: 'roadmap' // Ensure phase is roadmap
                            }
                        };
                        return { sessions: sessionsAfterRoadmap };
                    });
                    get().syncToFirestore(); // Sync after roadmap is generated and added to state
                }).catch(err => {
                    console.error("Error generating roadmap:", err);
                    // TODO: Handle error, perhaps revert phase
                });

                return {}; // State already updated by the initial set()
            }

            // Still in assessment phase
            const updatedSessions = {
                ...state.sessions,
                [state.activeSessionId]: {
                    ...session,
                    knownSkills: newKnown,
                    gapSkills: newGap,
                    currentQuestionIndex: nextIndex
                }
            };
            return { sessions: updatedSessions };
        });
        // No sync for individual answerQuestion unless it's the last one (handled above)
    },

    submitEvidence: (nodeId, subNodeId, taskIndex, evidence) => {
        set((state) => {
            const session = state.sessions[state.activeSessionId];
            if (!session || !session.roadmap) return {};

            const newNodes = session.roadmap.nodes.map(node => {
                if (node.id !== nodeId) return node;

                const newSubNodes = node.subNodes.map(sub => {
                    if (sub.id !== subNodeId) return sub;

                    const newTasks = [...sub.tasks];
                    const task = newTasks[taskIndex];

                    const taskObj = typeof task === 'string' ? { title: task } : { ...task };

                    const currentEvidence = taskObj.evidence || [];
                    taskObj.evidence = [...currentEvidence, { ...evidence, timestamp: new Date().toISOString() }];

                    newTasks[taskIndex] = taskObj;
                    return { ...sub, tasks: newTasks };
                });

                return { ...node, subNodes: newSubNodes };
            });

            // Track engagement (local metric)
            const newInteractions = state.engagementMetrics.nodeInteractions + 1;

            const updatedSessions = {
                ...state.sessions,
                [state.activeSessionId]: {
                    ...session,
                    roadmap: { ...session.roadmap, nodes: newNodes }
                }
            };
            const updatedEngagementMetrics = {
                ...state.engagementMetrics,
                nodeInteractions: newInteractions
            };

            return {
                sessions: updatedSessions,
                engagementMetrics: updatedEngagementMetrics
            };
        });
        get().syncToFirestore(); // Sync after evidence submission
    },

    completeTask: (nodeId, subNodeId, taskIndex) => {
        set((state) => {
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

                        return { ...sub, tasks: newTasks };
                    });

                    // Check if node is fully completed (all tasks in all subnodes done)
                    const isFullyCompleted = newSubNodes.every(sn =>
                        sn.tasks.every(t => (typeof t === 'string' ? false : t.completed))
                    );

                    if (isFullyCompleted) {
                        unlockNext = true;
                        return { ...node, subNodes: newSubNodes, status: 'completed' };
                    }

                    return { ...node, subNodes: newSubNodes };
                }
                return node;
            });

            if (unlockNext) {
                // Unlock the NEXT node in the sequence
                const activeNodeIndex = newNodes.findIndex(n => n.id === nodeId);
                if (activeNodeIndex !== -1 && activeNodeIndex < newNodes.length - 1) {
                    const nextNode = newNodes[activeNodeIndex + 1];
                    if (nextNode.status === 'locked') {
                        nextNode.status = 'active';
                    }
                }
            }

            // --- Firestore Schema Updates for User Document ---
            const todayISO = new Date().toISOString();
            const todayYYYYMMDD = todayISO.split('T')[0];
            const yesterdayYYYYMMDD = new Date(Date.now() - 86400000).toISOString().split('T')[0]; // YYYY-MM-DD for yesterday

            let newCurrentStreak = state.engagementMetrics.currentStreak || 0;
            const lastActiveDateInUserDoc = state.user?.lastActiveDate; // Assuming lastActiveDate will be on the user doc

            if (lastActiveDateInUserDoc === todayYYYYMMDD) {
                // Streak continues, already active today (do nothing to streak count)
            } else if (lastActiveDateInUserDoc === yesterdayYYYYMMDD) {
                newCurrentStreak += 1; // Increment streak if active yesterday
            } else {
                newCurrentStreak = 1; // Reset streak if not consecutive
            }

            const updatedHeatmapData = { ...(state.engagementMetrics.heatmapData || {}) };
            updatedHeatmapData[todayYYYYMMDD] = (updatedHeatmapData[todayYYYYMMDD] || 0) + 1; // Increment intensity for today

            // --- Session-specific updates ---
            const sessionDailyLog = { ...(session.dailyLog || {}) };
            if (!sessionDailyLog[todayYYYYMMDD]) sessionDailyLog[todayYYYYMMDD] = { tasksCompleted: 0, timeSpent: 0 };
            sessionDailyLog[todayYYYYMMDD].tasksCompleted += 1;


            // --- Engagement Tracking for "Trap" and totalProjects ---
            // Assuming `totalProjects` now tracks total completed tasks across all sessions for the user
            const newTotalProjects = state.engagementMetrics.totalProjects + 1;
            let showTrap = state.engagementMetrics.showTrap;

            // TRAP LOGIC: Show if 1+ tasks completed AND not logged in
            if (newTotalProjects >= 1 && !state.isLoggedIn) {
                showTrap = true;
            }

            return {
                sessions: {
                    ...state.sessions,
                    [state.activeSessionId]: {
                        ...session,
                        roadmap: { ...session.roadmap, nodes: newNodes },
                        // This 'streak' on session is separate from user's currentStreak
                        // Update lastActiveDate in session for internal session streak tracking
                        lastActiveDate: todayISO,
                        dailyLog: sessionDailyLog
                    }
                },
                engagementMetrics: {
                    ...state.engagementMetrics,
                    currentStreak: newCurrentStreak,     // Update the user's overall streak
                    totalProjects: newTotalProjects,     // Update the user's total projects/tasks completed
                    heatmapData: updatedHeatmapData,     // Update the user's heatmap
                    showTrap: showTrap
                },
                // Update user object directly for lastActiveDate (so streak calculation is correct next time)
                // This will be picked up by syncToFirestore when it updates the user doc
                user: state.user ? { ...state.user, lastActiveDate: todayYYYYMMDD } : null
            };
        });
        get().syncToFirestore(); // Trigger background sync after optimistic update
    },

    logTime: (minutes) => {
        set((state) => {
            const session = state.sessions[state.activeSessionId];
            if (!session) return {};
            const todayYYYYMMDD = new Date().toISOString().split('T')[0];
            const dailyLog = { ...(session.dailyLog || {}) };
            if (!dailyLog[todayYYYYMMDD]) dailyLog[todayYYYYMMDD] = { tasksCompleted: 0, timeSpent: 0 };
            dailyLog[todayYYYYMMDD].timeSpent += minutes;
            return {
                sessions: { ...state.sessions, [state.activeSessionId]: { ...session, dailyLog } }
            };
        });
        get().syncToFirestore(); // Sync after logging time
    },

    deleteSession: (id) => {
        set(state => {
            const newSessions = { ...state.sessions };
            delete newSessions[id];
            // Decrement totalProjects in engagementMetrics if a session corresponds to a "project"
            const newTotalProjects = state.engagementMetrics.totalProjects - 1;
            return {
                sessions: newSessions,
                activeSessionId: state.activeSessionId === id ? null : state.activeSessionId,
                engagementMetrics: {
                    ...state.engagementMetrics,
                    totalProjects: Math.max(0, newTotalProjects) // Ensure it doesn't go below 0
                }
            };
        });
        get().syncToFirestore(); // Sync after deleting session
    },

    reset: () => set({
        activeSessionId: null,
        currentTaskIds: null,
        // DO NOT reset sessions or metrics here, just clear active context
    }),

    // ===========================================
    // BLUEPRINT EXCHANGE ACTIONS
    // ===========================================

    publishBlueprint: async (sessionId) => {
        const state = get();
        const session = state.sessions[sessionId];
        if (!session || !state.user) return;

        const blueprintRef = doc(db, "public_blueprints", sessionId);
        const blueprintData = {
            ...session,
            authorName: state.user.displayName,
            authorId: state.user.uid,
            stealCount: 0,
            publishedAt: new Date().toISOString()
        };

        try {
            await writeBatch(db).set(blueprintRef, blueprintData).commit();
            console.log("Blueprint published!");
        } catch (error) {
            console.error("Publish Error:", error);
        }
    },

    stealBlueprint: async (blueprint, personalize = true) => {
        const state = get();
        if (!state.user) return;

        const newId = generateId();

        // Prepare nodes (reset status for new user)
        let nodes = blueprint.roadmap?.nodes || [];
        if (!personalize) {
            nodes = nodes.map((node, i) => ({
                ...node,
                status: i === 0 ? 'active' : 'locked',
                subNodes: (node.subNodes || []).map(sn => ({
                    ...sn,
                    tasks: (sn.tasks || []).map(t => {
                        const tObj = typeof t === 'string' ? { title: t } : { ...t };
                        return { ...tObj, completed: false, completedAt: null, evidence: [] };
                    })
                }))
            }));
        }

        const stolenSession = {
            ...blueprint,
            id: newId,
            status: "active",
            phase: personalize ? 'blueprint-assessment' : 'roadmap',
            isStolen: true,
            originId: blueprint.id,
            createdAt: new Date().toISOString(),
            dailyLog: {},
            streak: 0,
            knownSkills: [],
            gapSkills: [],
            roadmap: personalize ? blueprint.roadmap : { ...blueprint.roadmap, nodes }
        };

        // UI Feedback: Switch to the new session
        set({ showExchange: false, activeSessionId: newId });

        try {
            if (personalize) {
                // Generate tailoring questions immediately
                const { generateTailoringQuestions } = await import('./gemini');
                const tailoringQuestions = await generateTailoringQuestions(blueprint.role || blueprint.goal, blueprint.roadmap?.nodes || []);
                stolenSession.questions = tailoringQuestions;
            }

            // Increment counter in Firestore via Transaction
            const blueprintRef = doc(db, "public_blueprints", blueprint.id);
            const { runTransaction } = await import('firebase/firestore');

            await runTransaction(db, async (transaction) => {
                const bDoc = await transaction.get(blueprintRef);
                if (!bDoc.exists()) throw "Blueprint deleted";
                const newCount = (bDoc.data().stealCount || 0) + 1;
                transaction.update(blueprintRef, { stealCount: newCount });
            });

            set(s => ({
                sessions: { ...s.sessions, [newId]: stolenSession },
            }));

            get().syncToFirestore();
            return newId;
        } catch (error) {
            console.error("Steal Error:", error);
            // Fallback: Still allow the steal
            set(s => ({
                sessions: { ...s.sessions, [newId]: stolenSession },
            }));
            return newId;
        }
    },

    tailorBlueprint: async (sessionId, knownSkills, gapSkills) => {
        const state = get();
        const session = state.sessions[sessionId];
        if (!session) return;

        // Re-generate roadmap using existing goal but new skill profile
        const newRoadmap = await generateRoadmap(session.goal, knownSkills, gapSkills);

        set(s => ({
            sessions: {
                ...s.sessions,
                [sessionId]: {
                    ...session,
                    roadmap: newRoadmap,
                    knownSkills,
                    gapSkills,
                    phase: 'roadmap'
                }
            }
        }));
        get().syncToFirestore();
    },

    createRoadmap: async (goal, deadline) => {
        // 1. Parse goal via Gemini
        const result = await parseCareerGoal(goal);
        if (!result.isValid) throw new Error("Invalid goal");

        const now = new Date();
        let daysToAdd = 90;
        const match = deadline.toLowerCase().match(/(\d+)\s*(month|week|day|year)/);
        if (match) {
            const val = parseInt(match[1]);
            const unit = match[2];
            if (unit.startsWith('day')) daysToAdd = val;
            else if (unit.startsWith('week')) daysToAdd = val * 7;
            else if (unit.startsWith('month')) daysToAdd = val * 30;
            else if (unit.startsWith('year')) daysToAdd = val * 365;
        }
        const targetDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();

        // 2. Create Session
        const id = get().createSession(goal, result.role, targetDate);

        // 3. Generate questions
        const questions = await generateQuestions(result.role);
        if (questions && questions.length > 0) {
            get().setQuestions(questions);
        } else {
            throw new Error("Failed to generate questions");
        }
        return id;
    }

}));
