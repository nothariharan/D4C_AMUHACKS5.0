import OpenAI from 'openai';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Initialize OpenAI client pointing to OpenRouter
const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true // Required for client-side usage through Vite
});

const MODEL = 'arcee-ai/trinity-large-preview:free'; // Using specialized model as requested by user

// Helper to robustly parse JSON from AI response
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
    if (goal.toUpperCase() === 'TEST' || !API_KEY || API_KEY.includes('...')) {
        console.log("USING MOCK DATA (Test Mode)");
        return {
            isValid: true,
            role: "Test Career",
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
        const completion = await client.chat.completions.create({
            model: MODEL,
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
    if (role === 'Test Career' || !API_KEY || API_KEY.includes('...')) {
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
        const completion = await client.chat.completions.create({
            model: MODEL,
            messages: [{ role: "user", content: prompt }]
        });

        const text = completion.choices[0].message.content;
        return parseJSON(text) || [];
    } catch (error) {
        console.error("AI Question Error:", error?.response?.data || error?.message || error);
        return [];
    }
}

export async function generateRoadmap(role, knownSkills, gapSkills) {
    if (role === 'Test Career' || !API_KEY || API_KEY.includes('...')) {
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
        const completion = await client.chat.completions.create({
            model: MODEL,
            messages: [{ role: "user", content: prompt }]
        });

        const text = completion.choices[0].message.content;
        return parseJSON(text) || { nodes: [] };
    } catch (error) {
        console.error("AI Roadmap Error:", error);
        return { nodes: [] };
    }
}
