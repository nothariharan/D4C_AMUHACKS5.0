import OpenAI from 'openai';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Initialize OpenAI client pointing to OpenRouter
const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true // Required for client-side usage through Vite
});

const MODEL = 'arcee-ai/trinity-large-preview:free'; // Using free model requested by user

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
const MOCK_ROADMAP = {
    nodes: [
        {
            id: '1', title: 'Foundations', status: 'completed', x: 100, y: 300,
            subNodes: [
                {
                    id: '1-1',
                    title: 'HTML/CSS',
                    tasks: [
                        {
                            title: 'Reality Check: Environment Setup',
                            detail: 'Install VS Code and set up your workspace.',
                            link: 'https://code.visualstudio.com/',
                            breakdown: 'A proper development environment is the foundation of your workflow. VS Code provides essential tools like syntax highlighting, debugging, and extensions that streamline coding.',
                            practice: { question: 'What is the purpose of the "Extensions" view in VS Code?', hint: 'Think about adding functionality like Python or Live Server.' }
                        },
                        {
                            title: 'Grid Layouts',
                            detail: 'Create complex 2D layouts with CSS Grid.',
                            link: 'https://learncssgrid.com/',
                            breakdown: 'CSS Grid Layout is a two-dimensional layout system for the web. It lets you layout items in rows and columns, offering a grid-based approach that was previously impossible without complex hacks.',
                            practice: { question: 'How do you define a grid container in CSS?', hint: 'display property.' }
                        }
                    ]
                },
                {
                    id: '1-2',
                    title: 'JavaScript',
                    tasks: [
                        { title: 'ES6 Syntax', detail: 'Learn arrow functions, destructuring, and let/const.', link: 'https://javascript.info/es6-basics' },
                        { title: 'DOM Manipulation', detail: 'Interact with HTML elements using JavaScript.', link: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents' }
                    ]
                }
            ]
        },
        {
            id: '2', title: 'Frontend Core', status: 'locked', x: 400, y: 150,
            subNodes: [
                {
                    id: '2-1',
                    title: 'React Basics',
                    tasks: [
                        { title: 'Components', detail: 'Building blocks of React applications.', link: 'https://react.dev/learn/your-first-component' },
                        { title: 'Props & State', detail: 'Managing data flow and interactivity.', link: 'https://react.dev/learn/state-a-component-memory' }
                    ]
                },
                {
                    id: '2-2',
                    title: 'Hooks',
                    tasks: [
                        { title: 'useState', detail: 'Adding state to functional components.', link: 'https://react.dev/reference/react/useState' },
                        { title: 'useEffect', detail: 'Handling side effects like data fetching.', link: 'https://react.dev/reference/react/useEffect' }
                    ]
                }
            ]
        },
        {
            id: '3', title: 'State Mgmt', status: 'locked', x: 700, y: 400,
            subNodes: [
                {
                    id: '3-1',
                    title: 'Redux',
                    tasks: [
                        { title: 'Store Setup', detail: 'Configuring the global state container.', link: 'https://redux.js.org/introduction/getting-started' },
                        { title: 'Reducers', detail: 'Pure functions to handle state changes.', link: 'https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers' }
                    ]
                },
                {
                    id: '3-2',
                    title: 'Context API',
                    tasks: [
                        { title: 'Provider', detail: 'Supplying data to the component tree.', link: 'https://react.dev/reference/react/createContext' },
                        { title: 'Consumer', detail: 'Accessing context values in child components.', link: 'https://react.dev/reference/react/useContext' }
                    ]
                }
            ]
        },
        {
            id: '4', title: 'Backend', status: 'locked', x: 1000, y: 200,
            subNodes: [
                {
                    id: '4-1',
                    title: 'Node.js',
                    tasks: [
                        { title: 'Event Loop', detail: 'Understanding non-blocking I/O operations.', link: 'https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/' },
                        { title: 'Modules', detail: 'Organizing code with CommonJS or ES Modules.', link: 'https://nodejs.org/api/modules.html' }
                    ]
                },
                {
                    id: '4-2',
                    title: 'Express',
                    tasks: [
                        { title: 'Routing', detail: 'Defining application endpoints and URIs.', link: 'https://expressjs.com/en/guide/routing.html' },
                        { title: 'Middleware', detail: 'Functions that execute during the request cycle.', link: 'https://expressjs.com/en/guide/using-middleware.html' }
                    ]
                }
            ]
        },
        {
            id: '5', title: 'Database', status: 'locked', x: 1300, y: 350,
            subNodes: [
                {
                    id: '5-1',
                    title: 'SQL',
                    tasks: [
                        { title: 'Joins', detail: 'Combining rows from two or more tables.', link: 'https://www.w3schools.com/sql/sql_join.asp' },
                        { title: 'Normalization', detail: 'Organizing data to reduce redundancy.', link: 'https://www.geeksforgeeks.org/normalization-in-dbms/' }
                    ]
                },
                {
                    id: '5-2',
                    title: 'MongoDB',
                    tasks: [
                        { title: 'Schema Design', detail: 'Modeling data for flexible document storage.', link: 'https://www.mongodb.com/basics/data-modeling' },
                        { title: 'Aggregation', detail: 'Processing data records to return computed results.', link: 'https://www.mongodb.com/docs/manual/aggregation/' }
                    ]
                }
            ]
        },
        {
            id: '6', title: 'Deployment', status: 'locked', x: 1600, y: 150,
            subNodes: [
                {
                    id: '6-1',
                    title: 'Docker',
                    tasks: [
                        { title: 'Containers', detail: 'Packaging apps with dependencies.', link: 'https://www.docker.com/resources/what-container/' },
                        { title: 'Images', detail: 'Blueprints for creating containers.', link: 'https://docs.docker.com/get-started/02_our_app/' }
                    ]
                },
                {
                    id: '6-2',
                    title: 'CI/CD',
                    tasks: [
                        { title: 'GitHub Actions', detail: 'Automating software workflows.', link: 'https://docs.github.com/en/actions' },
                        { title: 'Pipelines', detail: 'Continuous integration and delivery steps.', link: 'https://www.atlassian.com/continuous-delivery/principles/continuous-integration-vs-delivery-vs-deployment' }
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
            { id: 1, skill: 'Mock Skill A', question: 'Do you know Mock A?', context: 'Context A' },
            { id: 2, skill: 'Mock Skill B', question: 'Do you know Mock B?', context: 'Context B' },
            { id: 3, skill: 'Mock Skill C', question: 'Do you know Mock C?', context: 'Context C' }
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
        console.error("Gemini Question Error:", error);
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
        console.error("Gemini Roadmap Error:", error);
        return { nodes: [] };
    }
}
