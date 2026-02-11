// app/src/features/auth/AuthModal.jsx

import React, { useState } from 'react'; // Ensure useState is imported
import { signInWithPopup } from 'firebase/auth'; // Firebase Auth for Google Sign-In
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Firestore for user data

// <<<<<<< IMPORTANT: CORRECTED IMPORT PATHS >>>>>>>
// These paths go up two levels from 'app/src/features/auth/' to 'app/src/',
// then into 'lib' to find firebase.js and store.js
import { auth, googleProvider, db } from '../../lib/firebase';
import { useStore } from '../../lib/store';

import { motion, AnimatePresence } from 'framer-motion';
import { SignupForm } from './SignupForm'; // Assuming SignupForm is still used for the 'signup' view

export function AuthModal() {
    // Destructure necessary state and actions from your Zustand store
    // Ensure 'setUser' and 'closeTrap' are available here
    const { engagementMetrics, closeTrap, sessions, activeSessionId, setUser } = useStore();
    const activeSession = sessions[activeSessionId];

    // State to control which view is shown in the modal ('trap' or 'signup')
    const [view, setView] = useState('trap');

    // Function to handle Google Sign-In using Firebase Authentication
    const handleGoogleSignIn = async () => {
        try {
            // Initiate the Google Sign-In pop-up
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user; // Get the user object from the successful sign-in

            if (firebaseUser) {
                // 1. Check if the user's document already exists in Firestore
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    // 2. If the user document does NOT exist, create a new one in Firestore
                    await setDoc(userDocRef, {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                        createdAt: new Date(), // Timestamp of when the user was created

                        // ADDED NEW FIELDS BASED ON YOUR SCHEMA:
                        currentStreak: 0,      // Initialize to 0 for a new user
                        totalProjects: 0,      // Initialize to 0 for a new user
                        heatmapData: {},       // Initialize as an empty object (map)

                        // Existing fields from before for context
                        karma: 0,              // Initial karma score
                        postsCount: 0,         // Initial post count
                        // You can add any other default user profile fields here
                    });
                    console.log("New user document created in Firestore for UID:", firebaseUser.uid);
                } else {
                    console.log("Existing user logged in:", firebaseUser.uid);
                }

                // 3. Update your Zustand store with the Firebase user information
                // This ensures your app's local state reflects the logged-in user
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    // You can add other properties from firebaseUser here if your store expects them
                });

                // 4. Close the modal after successful sign-in and data handling
                closeTrap(); // This function should be defined in your Zustand store to close the trap modal
            }
        } catch (error) {
            // Handle any errors that occur during the Google Sign-In process
            console.error("Google Sign-In Error:", error);
            // Provide feedback to the user about the error
            alert(`Sign-in failed: ${error.message}`);
            // You might also want to set an error state in your store or local component state
        }
    };

    // If the 'showTrap' metric is false, don't render the modal
    if (!engagementMetrics.showTrap) return null;

    // Calculate metrics for display within the modal
    const milestones = activeSession?.roadmap?.nodes?.length || 0;
    const tasksCompleted = activeSession?.dailyLog ? Object.values(activeSession.dailyLog).reduce((acc, log) => acc + log.tasksCompleted, 0) : 0;
    const daysPlanned = activeSession?.deadline ? Math.ceil((new Date(activeSession.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : 89;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
            >
                <div className="w-full max-w-lg">
                    {/* Conditional rendering based on the 'view' state */}
                    {view === 'trap' ? (
                        <div className="bg-white border-[8px] border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
                            {/* Header Section */}
                            <div className="bg-brutal-black text-white p-6 text-center border-b-[8px] border-black">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-brutal-red animate-pulse">
                                    ⚠️ Progress Not Saved
                                </h2>
                            </div>

                            {/* Main Content Section */}
                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <p className="font-mono text-gray-600 text-sm uppercase">You've built a roadmap for:</p>
                                    <h3 className="text-2xl font-bold uppercase leading-tight">
                                        "{activeSession?.role || activeSession?.goal || 'Your Career'}"
                                    </h3>
                                </div>

                                <div className="w-full h-1 bg-black" />

                                {/* Progress Metrics Display */}
                                <div className="grid grid-cols-1 gap-4 font-mono">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">📊</span>
                                        <span className="font-bold">{milestones} milestones mapped</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">✓</span>
                                        <span className="font-bold">{tasksCompleted} task{tasksCompleted !== 1 && 's'} completed</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">⏱️</span>
                                        <span className="font-bold">{daysPlanned} days planned</span>
                                    </div>
                                </div>

                                {/* Warning Message */}
                                <div className="bg-gray-100 p-4 border-l-4 border-black font-mono text-sm">
                                    This will disappear when you leave.
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3 pt-4">
                                    {/* This button now triggers the Google Sign-In flow */}
                                    <button
                                        onClick={handleGoogleSignIn} // Calls the Firebase Google Sign-In function
                                        className="w-full py-4 bg-brutal-yellow text-black font-black text-xl uppercase border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all"
                                    >
                                        Save My Work (Sign In with Google)
                                        <span className="block text-xs font-normal font-mono normal-case mt-1">(Takes 30 seconds)</span>
                                    </button>

                                    {/* "Start Over" button with confirmation */}
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Are you sure? Your progress will be lost locally if you clear your cache.")) {
                                                closeTrap(); // Calls closeTrap to dismiss the modal
                                            }
                                        }}
                                        className="w-full py-3 bg-white text-gray-500 font-bold text-sm uppercase border-2 border-transparent hover:text-red-600 hover:border-red-600 transition-all font-mono"
                                    >
                                        Start Over (Lose Progress)
                                    </button>
                                </div>

                                {/* Footer Text */}
                                <p className="text-center font-mono text-xs text-gray-400 mt-4">
                                    No credit card. No trial. Just email.
                                </p>
                            </div>
                        </div>
                    ) : (
                        // Renders SignupForm component if 'view' state is 'signup'
                        <SignupForm onCancel={() => setView('trap')} />
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
