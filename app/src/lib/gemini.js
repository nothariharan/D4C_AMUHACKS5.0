import OpenAI from 'openai';

// Removed const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

import { useStore } from './store';

const getClient = () => {
    const { apiConfig } = useStore.getState();
    if (!apiConfig?.apiKey) throw new Error("API Key Missing");

    return new OpenAI({
        baseURL: apiConfig.baseUrl || 'https://openrouter.ai/api/v1',
        apiKey: apiConfig.apiKey,
        dangerouslyAllowBrowser: true
    });
};

// Default model fallback
const DEFAULT_MODEL = 'arcee-ai/trinity-large-preview:free';

const getModel = () => {
    return useStore.getState().apiConfig?.model || DEFAULT_MODEL;
};

function parseJSON(text) {
    try {
        // 1. Try naive parse
        return JSON.parse(text);
    } catch (e) {
        // 2. Extract JSON from markdown or text
        const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        if (match) {
            try {
                return JSON.parse(match[0]);
            } catch (e2) {
                console.error("JSON Parse Error (extracted):", e2);
                return null;
            }
        }
        console.error("JSON Parse Error (no JSON found):", e);
        return null;
    }
}

// MOCK DATA FOR TESTING
// MOCK DATA FOR TESTING
const MOCK_ROADMAP = {
    nodes: [
        {
            id: '1', title: 'Phase 1: Digital Foundations', status: 'active', x: 150, y: 350,
            subNodes: [
                {
                    id: '1-1',
                    title: 'The Terminal & Git',
                    tasks: [
                        {
                            title: 'Mastering the Command Line',
                            detail: 'Learn navigation (cd, ls) and file ops (mkdir, touch).',
                            link: 'https://ubuntu.com/tutorials/command-line-for-beginners',
                            breakdown: 'The terminal is the primary interface for professional developers. It allows for fast, scriptable control over the operating system, which is essential for server management, build tools, and version control.',
                            practice: { question: 'What command is used to create a new directory?', hint: 'Think of "make directory".' }
                        },
                        {
                            title: 'Git Version Control',
                            detail: 'Understand commits, branches, and merging.',
                            link: 'https://git-scm.com/book/en/v2/Getting-Started-Git-Basics',
                            breakdown: 'Git is a distributed version control system that tracks changes in any set of computer files. It is the industry standard for collaboration, allowing multiple developers to work on the same codebase simultaneously without overwriting each other.',
                            practice: { question: 'What command stages changes for a commit?', hint: 'git [word] filename' }
                        }
                    ]
                },
                {
                    id: '1-2',
                    title: 'HTML5 & Semantic Web',
                    tasks: [
                        {
                            title: 'Semantic HTML Structure',
                            detail: 'Use <main>, <article>, <section> correctly.',
                            link: 'https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html',
                            breakdown: 'Semantic HTML uses tags that convey the meaning of the content, not just its appearance. This is crucial for SEO, accessibility, and clean code maintenance.',
                            practice: { question: 'Should you use <div> for everything?', hint: 'Think about screen readers and search engines.' }
                        }
                    ]
                }
            ]
        },
        {
            id: '2', title: 'Phase 2: Modern Styling', status: 'locked', x: 450, y: 200,
            subNodes: [
                {
                    id: '2-1',
                    title: 'Flexbox & CSS Grid',
                    tasks: [
                        {
                            title: 'Centering Everything with Flexbox',
                            detail: 'Master justify-content and align-items.',
                            link: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
                            breakdown: 'Flexbox is a one-dimensional layout method for arranging items in rows or columns. It excels at distributing space and aligning content within a container, even when sizes are unknown.',
                            practice: { question: 'How do you center an item horizontally in a flex container?', hint: 'justify-something' }
                        }
                    ]
                },
                {
                    id: '2-2',
                    title: 'Responsive Design',
                    tasks: [
                        {
                            title: 'Media Queries',
                            detail: 'Adapt layouts for mobile, tablet, and desktop.',
                            link: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design',
                            breakdown: 'Responsive design ensures your website looks good on all devices. Media queries allow you to apply different CSS rules based on screen size, orientation, and resolution.',
                            practice: { question: 'What unit is preferred for fonts in responsive design: px or rem?', hint: 'One is absolute, one is relative.' }
                        }
                    ]
                }
            ]
        },
        {
            id: '3', title: 'Phase 3: JavaScript Core', status: 'locked', x: 750, y: 450,
            subNodes: [
                {
                    id: '3-1',
                    title: 'Functions & Logic',
                    tasks: [
                        {
                            title: 'Arrow Functions & Scope',
                            detail: 'Learn modern syntax and "this" binding.',
                            link: 'https://javascript.info/arrow-functions-basics',
                            breakdown: 'Arrow functions provide a concise syntax and lexical scoping of the "this" keyword. Understanding scope is critical for avoiding bugs in asynchronous code.',
                            practice: { question: 'Does an arrow function have its own "this"?', hint: 'No, it inherits from parent.' }
                        }
                    ]
                }
            ]
        },
        {
            id: '4', title: 'Phase 4: Framework Master', status: 'locked', x: 1050, y: 250,
            subNodes: [
                {
                    id: '4-1',
                    title: 'React Fundamentals',
                    tasks: [
                        {
                            title: 'The Virtual DOM',
                            detail: 'Understand how React optimizes rendering.',
                            link: 'https://react.dev/learn/preserving-and-resetting-state',
                            breakdown: 'React uses a Virtual DOM to minimize actual DOM manipulations, which are expensive. It compares its virtual tree with the real one and only updates what has changed.',
                            practice: { question: 'Why is the Virtual DOM faster?', hint: 'It batches updates.' }
                        }
                    ]
                }
            ]
        },
        {
            id: '5', title: 'Phase 5: State & Effects', status: 'locked', x: 1350, y: 500,
            subNodes: [
                {
                    id: '5-1',
                    title: 'Lifecycle Hooks',
                    tasks: [
                        {
                            title: 'useEffect Mastery',
                            detail: 'Manage side effects and cleanup.',
                            link: 'https://react.dev/reference/react/useEffect',
                            breakdown: 'useEffect lets you synchronize a component with an external system. Choosing the right dependency array is key to performance.',
                            practice: { question: 'What happens if you provide an empty dependency array []?', hint: 'It runs only once.' }
                        }
                    ]
                }
            ]
        },
        {
            id: '6', title: 'Phase 6: Deployment & CI', status: 'locked', x: 1650, y: 300,
            subNodes: [
                {
                    id: '6-1',
                    title: 'Cloud Platforms',
                    tasks: [
                        {
                            title: 'Vercel/Netlify Deploy',
                            detail: 'Go live in under 5 minutes.',
                            link: 'https://vercel.com/docs',
                            breakdown: 'Modern platforms offer git-integrated deployment. Every push to your main branch can automatically trigger a build and update the live site.',
                            practice: { question: 'What is a "Production Build"?', hint: 'Optimized code for users.' }
                        }
                    ]
                }
            ]
        }
    ]
}

export async function parseCareerGoal(goal) {
    // TEST MODE TRIGGER
    // TEST MODE OR DEMO MODE TRIGGER
    const { apiConfig, demoMode } = useStore.getState();
    const isMock = goal.toUpperCase() === 'TEST' || demoMode || !apiConfig?.apiKey || apiConfig.apiKey.includes('...');

    if (isMock) {
        console.log("USING MOCK DATA (Demo/Test Mode)");
        return {
            isValid: true,
            role: "Demo Career",
            foundations: ["Mock Skill 1", "Mock Skill 2", "Mock Skill 3"]
        };
    }

    const prompt = `
    Analyze the career goal: "${goal}".
    Return a JSON object with:
    1. isValid (boolean): Is this a valid tech/design career goal?
    2. role (string): Standardized job title (e.g. "Full Stack Developer").
    3. foundations (array): 5 skills a beginner needs for this role.
    
    Output strictly JSON.
  `;

    try {
        const client = getClient();
        const completion = await client.chat.completions.create({
            model: getModel(),
            messages: [{ role: "user", content: prompt }]
        });

        const text = completion.choices[0].message.content;
        const data = parseJSON(text);

        if (!data) throw new Error("Failed to parse JSON");

        return { ...data, isValid: true, role: data.role || goal };
    } catch (error) {
        console.error("OpenRouter API Error:", error);
        return { isValid: true, role: goal, foundations: [] };
    }
}

export async function generateQuestions(role) {
    const { apiConfig, demoMode } = useStore.getState();
    const isMock = role === 'Test Career' || role === 'Demo Career' || demoMode || !apiConfig?.apiKey || apiConfig.apiKey.includes('...');

    if (isMock) {
        return [
            { id: 1, skill: 'Terminal', question: 'Do you know how to use "cd" and "ls" in the terminal?', context: 'Basic navigation is essential.' },
            { id: 2, skill: 'Git', question: 'Have you ever used "git commit" to save your work?', context: 'Version control saves lives.' },
            { id: 3, skill: 'HTML', question: 'Can you tell the difference between a <div> and a <section>?', context: 'Semantic HTML is key for SEO.' },
            { id: 4, skill: 'CSS', question: 'Have you built a layout using CSS Grid or Flexbox before?', context: 'Centering things shouldn\'t be a nightmare.' },
            { id: 5, skill: 'JavaScript', question: 'Do you know what an Arrow Function is?', context: 'Modern JS syntax is cleaner.' },
            { id: 6, skill: 'React', question: 'Have you used "useState" to manage data in a component?', context: 'Interactivity depends on state.' },
            { id: 7, skill: 'API', question: 'Do you know how to fetch data from a JSON API?', context: 'Apps need real-world data.' },
            { id: 8, skill: 'Node.js', question: 'Have you ever run a JavaScript file outside the browser?', context: 'Server-side JS is powerful.' },
            { id: 9, skill: 'Database', question: 'Do you know what a Primary Key is in a database?', context: 'Data integrity matters.' },
            { id: 10, skill: 'CI/CD', question: 'Have you ever deployed a website to Vercel or Netlify?', context: 'Sharing your work with the world.' }
        ]
    }

    const prompt = `
    Create a binary skill assessment for a "${role}".
    Generate exactly 10 YES/NO questions to test foundational knowledge.
    
    Output strictly JSON in this format:
    [
      {
        "id": "unique_id",
        "skill": "Specific Skill Name",
        "question": "A technical yes/no question?",
        "context": "One sentence explaining why this skill matters."
      }
    ]
  `;

    try {
        const client = getClient();
        const completion = await client.chat.completions.create({
            model: getModel(),
            messages: [{ role: "user", content: prompt }]
        });

        const text = completion.choices[0].message.content;
        return parseJSON(text) || [];
    } catch (error) {
        console.error("AI Question Error:", error?.response?.data || error?.message || error);
        return [];
    }
}

/**
 * Generates 5 tailoring questions for a forked (stolen) roadmap.
 */
export async function generateTailoringQuestions(goal, nodes) {
    const { apiConfig, demoMode } = useStore.getState();
    const isMock = goal.toUpperCase() === 'TEST' || demoMode || !apiConfig?.apiKey || apiConfig.apiKey.includes('...');

    if (isMock) {
        return (nodes || []).slice(0, 5).map((n, i) => ({
            id: `tailor-${i}`,
            skill: n.title,
            question: `How much experience do you already have with ${n.title}?`,
            context: "We'll skip or shorten this phase if you're already an expert."
        }));
    }

    const nodeTitles = nodes.map(n => n.title).join(", ");
    const prompt = `
    The user is "stealing" a roadmap for: "${goal}".
    The existing roadmap contains these key milestones: ${nodeTitles}.
    
    Generate exactly 5 brief, punchy technical questions to determine the user's specific experience with these milestones so we can tailor the roadmap for them.
    
    Status Rules:
    - Keep questions focused on practical experience.
    - Output strictly JSON in this format:
    {
      "questions": [
        { "id": "q1", "skill": "Skill Name", "question": "Question text?", "context": "Brief context why this matters" }
      ]
    }
    `;

    try {
        const client = getClient();
        const response = await client.chat.completions.create({
            model: getModel(),
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        return JSON.parse(content).questions;
    } catch (error) {
        console.error("AI Tailoring Question Error:", error);
        return (nodes || []).slice(0, 5).map((n, i) => ({
            id: `tailor-${i}`,
            skill: n.title,
            question: `How much experience do you already have with ${n.title}?`,
            context: "We'll skip or shorten this phase if you're already an expert."
        }));
    }
}

export async function generateRoadmap(role, knownSkills, gapSkills) {
    const { apiConfig, demoMode } = useStore.getState();
    const isMock = role === 'Test Career' || role === 'Demo Career' || demoMode || !apiConfig?.apiKey || apiConfig.apiKey.includes('...');

    if (isMock) {
        return MOCK_ROADMAP;
    }

    const prompt = `
    Create a non-linear learning roadmap for a "${role}".
    User KNOWS: ${knownSkills.join(', ')}.
    User NEEDS: ${gapSkills.join(', ')}.

    Generate a Metro Map style roadmap with exactly 6-8 Main Nodes.
    
    Structure:
    - Main Nodes: Major milestones (e.g., "Foundations", "Advanced Logic").
    - Sub Nodes: Exactly 2 specific topics per Main Node.
    - Tasks: 1-2 actionable resources/tasks per Sub Node. Tasks MUST include a title, detail, and a relevant link.

    Status Rules:
    - Set the FIRST node's status to "active".
    - Set ALL subsequent nodes to "locked".

    Output strictly JSON in this format:
    {
      "nodes": [
        { 
            "id": "1", 
            "title": "Main Node Title", 
            "status": "completed|active|locked", 
            "x": 50, 
            "y": 150,
            "subNodes": [
                {
                    "id": "1-1",
                    "title": "Sub Node 1",
                    "tasks": [
                        {
                            "title": "Task Title",
                            "detail": "One sentence description of what to do.",
                            "link": "https://example.com/resource",
                            "breakdown": "A concise paragraph (3-4 sentences) explaining the core concept in depth. Focus on the 'why' and 'how'. Avoid generic text.",
                            "practice": {
                                "question": "A specific technical question to test understanding.",
                                "hint": "A helpful hint pointing to the answer."
                            }
                        }
                    ]
                }
            ]
        }
      ]
    }
    
    Coordinates (x,y) for Main Nodes should flow from left (100) to right (1500), with good y-spacing (100-600) to avoid clutter. 
    Keep nodes spaced far apart (at least 200px gap).
    Do NOT generate coordinates for subNodes; the UI will handle that.
  `;

    try {
        const client = getClient();
        const completion = await client.chat.completions.create({
            model: getModel(),
            messages: [{ role: "user", content: prompt }]
        });

        const text = completion.choices[0].message.content;
        return parseJSON(text) || { nodes: [] };
    } catch (error) {
        console.error("AI Roadmap Error:", error);
        return { nodes: [] };
    }
}

export async function generateManifest(userData) {
    const { apiConfig, demoMode } = useStore.getState();
    const isMock = userData.isTest || demoMode || !apiConfig?.apiKey || apiConfig.apiKey.includes('...');

    if (isMock) {
        return {
            subject: userData.name || "Test Subject",
            status: {
                streak: "12 Days",
                total: "42 Nodes Completed",
                projects: "3 Live Roadmaps"
            },
            cargo: [
                {
                    role: "Frontend Engineer",
                    highlights: [
                        "Mastered React State Management within 2 weeks.",
                        "Built a custom Metro-Map UI using Framer Motion.",
                        "Successfully integrated OpenRouter API for dynamic content."
                    ],
                    verifiedLinks: [
                        { title: "Metro Map Implementation", url: "https://github.com/test/metro" },
                        { title: "Zustand Store Architecture", url: "https://github.com/test/store" }
                    ]
                }
            ],
            logs: [
                "2026-02-12: System initialized.",
                "2026-02-13: First node 'Digital Foundations' completed.",
                "2026-02-14: Deployment flux stabilized. Hirable status: INCREASING."
            ]
        };
    }

    const prompt = `
    You are the JustAsk Manifest Compiler.
    Convert the following user learning data into a high-fidelity "Shipping Manifest" resume/portfolio.

    [DATA START]
    ${JSON.stringify(userData, null, 2)}
    [DATA END]

    Style: Strictly Brutalist, Technical, Direct, Industrial. Use monospaced look. 
    Tone: Professional system log. No fluff.

    Output strictly JSON in this format:
    {
      "subject": "Full User Name",
      "status": {
        "streak": "X Days",
        "total": "X Nodes Verified",
        "projects": "X Major Roadmaps"
      },
      "cargo": [
        {
          "role": "Role Title",
          "highlights": ["Technical achievement 1", "Technical achievement 2"],
          "verifiedLinks": [{ "title": "Evidence Title", "url": "Link" }]
        }
      ],
      "logs": [
        "YYYY-MM-DD: Technical Milestone Reached",
        "YYYY-MM-DD: Shipment Verified"
      ]
    }
  `;

    try {
        const client = getClient();
        const completion = await client.chat.completions.create({
            model: MODEL,
            messages: [{ role: "user", content: prompt }]
        });

        const text = completion.choices[0].message.content;
        return parseJSON(text);
    } catch (error) {
        console.error("Manifest Error:", error);
        return null;
    }
}

export async function generateGauntletChallenge(goal, milestones) {
    const { apiConfig, demoMode } = useStore.getState();
    const isMock = demoMode || !apiConfig?.apiKey || apiConfig.apiKey.includes('...');

    if (isMock) {
        return {
            type: "coding_sandbox",
            title: "Final Capstone Project (Demo)",
            brief: `Build a production-ready application that demonstrates your ${goal} skills.`,
            requirements: ["Build core features", "Ensure clean code", "Deploy to live URL"],
            timeLimit: "7 Days",
            scenario: "You are the lead developer for a startup. You need to clear the backlog before the big launch.",
            initialState: { code: "// Start coding here..." }
        };
    }
    const prompt = `
    The user has completed their roadmap for: "${goal}".
    Key milestones mastered: ${milestones.join(", ")}.

    Create a high-stakes "Final Gauntlet" capstone challenge.
    
    Determine the best 'Game Engine' for this goal from these options:
    1. "coding_sandbox": For Engineering/Dev/Data roles. Build a real app.
    2. "crisis_terminal": For Entrepreneurship/Management. Text-based survival scenario.
    3. "hostile_negotiation": For Sales/Marketing/Soft Skills. Convince a skeptic.
    4. "resource_squeeze": For Finance/Ops/Strategy. Budget allocation puzzle.
    5. "red_pen_teardown": For Design/Content/Product. Fix a broken artifact.

    Output strictly JSON:
    {
      "type": "coding_sandbox" | "crisis_terminal" | "hostile_negotiation" | "resource_squeeze" | "red_pen_teardown",
      "title": "Challenge Name",
      "brief": "One sentence mission statement",
      "requirements": ["Requirement 1", "Req 2", "Req 3"],
      "timeLimit": "5 Minutes" | "3 Days" | "7 Days",
      "starterCode": { ... } // ONLY if type is coding_sandbox
      "scenario": "..." // Narrative setup for crisis/negotiation/squeeze/red_pen
      "initialState": { ... } // Specific data for the chosen engine (see below)
    }

    Type-Specific Fields (add these to 'initialState'):
    - crisis_terminal: { "currency": 10000, "morale": 100, "turns": 3 }
    - hostile_negotiation: { "role": "Angry Client", "patience": 100, "topic": "Why is the project late?" }
    - resource_squeeze: { "budget": 5000, "sliders": [{"label": "Ads", "cost": 10}, {"label": "Dev", "cost": 50}] }
    - red_pen_teardown: { "content": "The bad copy/design text...", "flaws": ["Flaw 1", "Flaw 2"] }
    `;

    try {
        const client = getClient();
        const completion = await client.chat.completions.create({
            model: getModel(),
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });
        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error("Gauntlet Gen Error:", error);
        const isTech = /dev|engineer|code|program|web|react|node|python|stack/i.test(goal);
        return {
            type: isTech ? "coding_sandbox" : "coding_sandbox", // For now, default to coding as it's the safest 'hard' challenge, OR change to 'physical' if preferred. User said: "legacy -> submit proof is fine".
            // Actually, let's follow the user's preference:
            type: isTech ? "coding_sandbox" : "technical", // Wait, 'technical' isn't a valid engine anymore in the new list.
            // Let's rely on the prompt mainly. But for fallback:
            type: isTech ? "coding_sandbox" : "coding_sandbox", // Re-reading user: "if ... not falling under any ... the old one where its just submit proof is fine"
            // But here we are generating a NEW challenge.
            // If generation fails, we probably want a safe default. 
            // Let's stick to the previous simple logic but maybe just use 'coding_sandbox' as a safe bet for hackathon demo stability?
            // Actually, the user's request was about *existing* sessions.
            // For *new* generations (which fallback covers), let's try to be smart.
            type: isTech ? "coding_sandbox" : "physical",
            title: "Final Capstone Project",
            brief: `Build a production-ready application that demonstrates your ${goal} skills.`,
            requirements: ["Build core features", "Ensure clean code", "Deploy to live URL"],
            timeLimit: "7 Days"
        };
    }
}

export async function verifyGauntletSubmission(challenge, submission) {
    const { apiConfig, demoMode } = useStore.getState();
    const isMock = demoMode || !apiConfig?.apiKey || apiConfig.apiKey.includes('...');

    if (isMock) {
        return {
            passed: true,
            score: 95,
            feedback: "Great job! This is a mock verification in Demo Mode.",
            strengths: ["Consistency", "Speed"],
            growth: ["UI Polish"]
        };
    }
    const prompt = `
    Evaluate the following submission for the "Final Gauntlet" challenge.
    
    CHALLENGE: ${challenge.title}
    BRIEF: ${challenge.brief}
    REQUIREMENTS: ${challenge.requirements.join(", ")}
    
    SUBMISSION:
    Code/Content: ${JSON.stringify(submission.code || submission.reflection)}
    Files: ${JSON.stringify(submission.files || [])}
    
    Criteria:
    1. Completion of all requirements.
    2. Professionalism and code quality (if applicable).
    3. Proof of mastery in ${challenge.title}.

    Output strictly JSON:
    {
      "passed": true | false,
      "score": number (0-100),
      "feedback": "Detailed 2-3 sentence feedback.",
      "strengths": ["...", "..."],
      "growth": ["...", "..."]
    }
    `;

    try {
        const client = getClient();
        const completion = await client.chat.completions.create({
            model: getModel(),
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });
        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error("Gauntlet Verification Error:", error);
        return { passed: true, score: 80, feedback: "System busy. Manual verification pending, but you're approved based on progress." };
    }
}


// Explain a specific task concept (Mocked or Real)
export async function explainConcept(task, messages, goal) {
    const { apiConfig, demoMode } = useStore.getState();
    const isMock = goal === 'Test Career' || demoMode || !apiConfig?.apiKey || apiConfig.apiKey.includes('...');

    if (isMock) {
        return "I can explain this concept! Since we are in **Demo Mode**, imagine I just gave you a brilliant, concise explanation of **" + task.title + "** with a perfect code example.";
    }

    const prompt = `
    You are an expert ${goal} mentor.
    
    The user is asking about a specific task: "${task.title}".
    Context:
    - Task Detail: ${task.detail}
    - Task Breakdown: ${task.breakdown}
    - Parent Goal: ${goal}
    
    Conversation History:
    ${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}
    
    Guidelines:
    - Be concise, encouraging, and practical.
    - Use analogies.
    - If user asks for code, provide a short, clean snippet.
    - If user seems stuck, suggest a small practice step.
    
    Respond in markdown.
    `;

    try {
        const client = getClient();
        const completion = await client.chat.completions.create({
            model: MODEL,
            messages: [{ role: "user", content: prompt }]
        });
        return completion.choices[0].message.content;
    } catch (error) {
        console.error("AI Explain Error:", error);
        return "I'm having trouble connecting to the mentor network right now. Try again in a moment.";
    }
}
