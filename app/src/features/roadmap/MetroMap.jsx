import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Check, Lock, Play, Plus, Minus, Info, ClipboardList, MessageCircleQuestion, BookMarked, CalendarCheck, Share2 } from 'lucide-react'
import { useStore } from '../../lib/store'
import { TaskThreadView } from './TaskThreadView'
import { NextUpPanel } from './NextUpPanel'

export function MetroMap() {
    const { sessions, activeSessionId, currentTaskIds, setCurrentTask, updateNodePosition, completeTask, publishBlueprint, setShowQuests } = useStore()
    const activeSession = sessions[activeSessionId]
    const roadmap = activeSession?.roadmap

    const [isPublishing, setIsPublishing] = useState(false)

    const handlePublish = async () => {
        setIsPublishing(true)
        try {
            await publishBlueprint(activeSessionId)
            alert("Roadmap Published to Network! 🚀")
        } finally {
            setIsPublishing(false)
        }
    }

    // Local state for nodes to allow dragging
    const [localNodes, setLocalNodes] = useState([])

    // Sync local nodes when roadmap changes
    useEffect(() => {
        if (roadmap?.nodes) {
            setLocalNodes(roadmap.nodes)
        }
    }, [roadmap])

    // State
    // const [selectedTaskIds, setSelectedTaskIds] = useState(null) // REMOVED
    const [expandedNodes, setExpandedNodes] = useState({})
    const [expandedSubNodes, setExpandedSubNodes] = useState({})
    const [showFABMenu, setShowFABMenu] = useState(false)

    // Derive selected task from store to ensure reactivity
    const selectedTask = currentTaskIds && roadmap ?
        roadmap.nodes.find(n => n.id === currentTaskIds.nodeId)
            ?.subNodes.find(s => s.id === currentTaskIds.subNodeId)
            ?.tasks[currentTaskIds.taskIndex]
        : null

    // Inject IDs into the derived task object for TaskThreadView to use
    const taskToRender = selectedTask ? {
        ...selectedTask,
        nodeId: currentTaskIds.nodeId,
        subNodeId: currentTaskIds.subNodeId,
        taskIndex: currentTaskIds.taskIndex
    } : null



    // Refs for Auto-Zoom
    const transformRef = useRef(null)
    const hasCenteredRef = useRef(false)

    // Check if we are waiting for the roadmap
    const isGenerating = !roadmap && activeSession?.phase === 'roadmap'

    // Auto-focus on active node
    useEffect(() => {
        if (roadmap && roadmap.nodes && transformRef.current && !hasCenteredRef.current) {
            const nodes = roadmap.nodes
            const activeNode = nodes.find(n => n.status === 'active') || nodes[0]

            if (activeNode) {
                const { setTransform } = transformRef.current
                const scale = 1.0
                // Viewport dimensions (approximate or window based)
                const viewportW = window.innerWidth
                const viewportH = 800 // The container height is hardcoded to 800px in JSX

                // Calculate target position to center the active node
                // Formula: TargetPos = (ViewportCenter) - (NodePos + Padding) * Scale
                // Node coordinates are relative to the padded container (200px padding)
                const targetX = (viewportW / 2) - ((activeNode.x + 200) * scale)
                const targetY = (viewportH / 2) - ((activeNode.y + 200) * scale)

                // Small delay to ensure layout is ready
                setTimeout(() => {
                    setTransform(targetX, targetY, scale, 1000, "easeOutCubic")
                    hasCenteredRef.current = true
                }, 100)
            }
        }
    }, [roadmap])

    if (isGenerating) {
        return (
            <div className="w-full h-[600px] bg-white brutal-border flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-4 border-black border-t-brutal-yellow rounded-full animate-spin"></div>
                <h2 className="text-2xl font-black uppercase animate-pulse">Generating Map...</h2>
                <p className="font-mono text-sm text-gray-500">Constructing your career lattice</p>
            </div>
        )
    }

    if (!roadmap) return null

    const toggleNode = (nodeId) => {
        setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }))
    }

    const toggleSubNode = (subNodeId) => {
        setExpandedSubNodes(prev => ({ ...prev, [subNodeId]: !prev[subNodeId] }))
    }

    // Calculate SVG path using LOCAL nodes
    const pathData = localNodes.reduce((acc, node, i) => {
        if (i === 0) return `M ${node.x} ${node.y}`
        return `${acc} L ${node.x} ${node.y}`
    }, '')

    return (
        <>
            <div className="w-full h-[800px] bg-gray-50 brutal-border relative overflow-hidden">
                <TransformWrapper
                    ref={transformRef}
                    initialScale={0.5}
                    minScale={0.1}
                    maxScale={4}
                    centerOnInit={false} // We handle it manually via useEffect
                    limitToBounds={false}
                >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            {/* Zoom Controls - Bottom Left */}
                            <div className="absolute bottom-8 left-8 flex flex-col gap-2 z-50">
                                <button type="button" onClick={() => zoomIn()} className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center shadow-brutal hover:bg-brutal-yellow active:translate-y-1 active:shadow-none transition-all">
                                    <Plus size={20} />
                                </button>
                                <button type="button" onClick={() => zoomOut()} className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center shadow-brutal hover:bg-brutal-yellow active:translate-y-1 active:shadow-none transition-all">
                                    <Minus size={20} />
                                </button>
                            </div>

                            {/* FAB Menu - Top Right */}
                            <div className="absolute top-6 right-6 flex flex-col items-end gap-2 z-[100]">
                                <button
                                    type="button"
                                    onClick={() => setShowFABMenu(!showFABMenu)}
                                    className={`w-16 h-16 border-2 border-black flex items-center justify-center shadow-brutal active:translate-y-1 active:shadow-none transition-all ${showFABMenu ? 'bg-brutal-yellow' : 'bg-white hover:bg-brutal-yellow'}`}
                                >
                                    <ClipboardList size={32} />
                                </button>

                                <AnimatePresence>
                                    {showFABMenu && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0, originY: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            className="flex flex-col items-end gap-2 mt-2"
                                        >
                                            {[
                                                { icon: <CalendarCheck size={20} />, label: "Today's Quest", action: () => { setShowQuests(true); setShowFABMenu(false); } },
                                                ...(!activeSession?.isStolen ? [{ icon: <Share2 size={20} />, label: isPublishing ? 'Uploading...' : 'Publish to Exchange', action: handlePublish }] : []),
                                                { icon: <MessageCircleQuestion size={20} />, label: 'AI Explain', action: () => { } },
                                                { icon: <BookMarked size={20} />, label: 'Review Later', action: () => { } },
                                            ].map((item, idx) => (
                                                <motion.button
                                                    key={idx}
                                                    type="button"
                                                    initial={{ x: 20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    onClick={item.action}
                                                    className="flex items-center gap-2 bg-white border-2 border-black px-4 py-3 text-sm font-mono font-bold uppercase shadow-brutal hover:bg-brutal-yellow active:translate-y-0.5 active:shadow-none transition-all whitespace-nowrap"
                                                >
                                                    {item.icon} {item.label}
                                                </motion.button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>



                            <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full">
                                <div className="relative min-w-[2500px] min-h-[1500px] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] p-[200px]">

                                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
                                        {/* Gradient definitions */}
                                        <defs>
                                            <radialGradient id="completionAura">
                                                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                                                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                                            </radialGradient>
                                        </defs>

                                        {/* Completion Aura behind completed nodes */}
                                        {localNodes.map(node => node.status === 'completed' && (
                                            <circle key={`aura-${node.id}`} cx={node.x} cy={node.y} r={120} fill="url(#completionAura)" />
                                        ))}

                                        {/* Prerequisite Lines between Main Nodes */}
                                        {localNodes.map((node, i) => {
                                            if (i === 0) return null;
                                            const prev = localNodes[i - 1];
                                            const isCompleted = prev.status === 'completed' && node.status !== 'locked';
                                            const isLocked = node.status === 'locked';
                                            return (
                                                <line
                                                    key={`path-${i}`}
                                                    x1={prev.x} y1={prev.y} x2={node.x} y2={node.y}
                                                    stroke={isCompleted ? '#22C55E' : isLocked ? '#9CA3AF' : '#000'}
                                                    strokeWidth={isCompleted ? 14 : isLocked ? 6 : 12}
                                                    strokeDasharray={isLocked ? '12 8' : 'none'}
                                                    strokeLinecap="round"
                                                />
                                            );
                                        })}

                                        {/* Lines for SubNodes and TaskNodes (Using Absolute Coordinates) */}
                                        {localNodes.map(node => (
                                            expandedNodes[node.id] && node.subNodes?.map((sub, index) => {
                                                const total = node.subNodes.length;
                                                const angleDeg = (360 / total) * index + 90;
                                                const angleRad = (angleDeg * Math.PI) / 180;
                                                const radius = 300;
                                                const subX = node.x + Math.cos(angleRad) * radius;
                                                const subY = node.y + Math.sin(angleRad) * radius;

                                                return (
                                                    <g key={`sub-task-lines-${sub.id}`}>
                                                        {/* Main -> Sub Line */}
                                                        <motion.line
                                                            x1={node.x} y1={node.y} x2={subX} y2={subY}
                                                            stroke="black" strokeWidth="4" strokeDasharray="8 4"
                                                            initial={{ pathLength: 0, opacity: 0 }}
                                                            animate={{ pathLength: 1, opacity: 1 }}
                                                        />

                                                        {/* Sub -> Task Lines */}
                                                        {expandedSubNodes[sub.id] && sub.tasks?.map((task, j) => {
                                                            const taskDistance = 150 + j * 80;
                                                            const taskX = subX + Math.cos(angleRad) * taskDistance;
                                                            const taskY = subY + Math.sin(angleRad) * taskDistance;

                                                            return (
                                                                <motion.line
                                                                    key={`line-${sub.id}-${j}`}
                                                                    x1={subX} y1={subY} x2={taskX} y2={taskY}
                                                                    stroke="black" strokeWidth="2"
                                                                    initial={{ pathLength: 0, opacity: 0 }}
                                                                    animate={{ pathLength: 1, opacity: 1 }}
                                                                />
                                                            );
                                                        })}
                                                    </g>
                                                );
                                            })
                                        ))}
                                    </svg>

                                    {/* Nodes Layer */}
                                    <div className="absolute inset-0">
                                        {localNodes.map((node, i) => (
                                            <div key={node.id}>
                                                <MainNode
                                                    node={node}
                                                    isExpanded={!!expandedNodes[node.id]}
                                                    onClick={() => toggleNode(node.id)}
                                                    onDragEnd={() => { }}

                                                />

                                                {/* Render SubNodes (Orbital Layout) */}
                                                <AnimatePresence>
                                                    {expandedNodes[node.id] && (
                                                        <div className="absolute" style={{ left: node.x, top: node.y }}>
                                                            {/* Orbit Ring */}
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                className="absolute rounded-full border-2 border-dashed border-gray-400 -z-10"
                                                                style={{
                                                                    width: 400,
                                                                    height: 400,
                                                                    left: -200,
                                                                    top: -200
                                                                }}
                                                            />

                                                            {node.subNodes?.map((sub, index) => {
                                                                const total = node.subNodes.length
                                                                const angleDeg = (360 / total) * index + 90
                                                                const angleRad = (angleDeg * Math.PI) / 180
                                                                const radius = 300 // Orbit radius
                                                                const subX = Math.cos(angleRad) * radius
                                                                const subY = Math.sin(angleRad) * radius

                                                                return (
                                                                    <motion.div
                                                                        key={sub.id}
                                                                        initial={{ x: 0, y: 0, opacity: 0 }}
                                                                        animate={{ x: subX, y: subY, opacity: 1 }}
                                                                        exit={{ x: 0, y: 0, opacity: 0 }}
                                                                        className="absolute"
                                                                    >
                                                                        <SubNode
                                                                            data={sub}
                                                                            isExpanded={!!expandedSubNodes[sub.id]}
                                                                            color={node.status === 'completed' ? 'bg-brutal-blue' : 'bg-brutal-yellow'}
                                                                            onClick={() => toggleSubNode(sub.id)}
                                                                        />

                                                                        {/* Task Nodes for this SubNode */}
                                                                        <AnimatePresence>
                                                                            {expandedSubNodes[sub.id] && sub.tasks?.map((task, j) => {
                                                                                const taskDistance = 150 + j * 80 // Linear stack outwards
                                                                                // Calculate relative position to the sub-node (which is already at subX, subY)
                                                                                const taskX = Math.cos(angleRad) * taskDistance;
                                                                                const taskY = Math.sin(angleRad) * taskDistance;

                                                                                return (
                                                                                    <TaskNode
                                                                                        key={`${sub.id}-task-${j}`}
                                                                                        centerX={taskX} centerY={taskY} parentX={0} parentY={0}
                                                                                        data={task}
                                                                                        onClick={() => setCurrentTask({ nodeId: node.id, subNodeId: sub.id, taskIndex: j })}
                                                                                    />
                                                                                )
                                                                            })}
                                                                        </AnimatePresence>
                                                                    </motion.div>
                                                                )

                                                            })}
                                                        </div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TransformComponent>
                        </>
                    )}
                </TransformWrapper>
            </div>

            {/* Task Thread View Modal */}
            <AnimatePresence>
                {taskToRender && (
                    <TaskThreadView
                        task={taskToRender}
                        onClose={() => setCurrentTask(null)}
                        onComplete={() => {
                            completeTask(taskToRender.nodeId, taskToRender.subNodeId, taskToRender.taskIndex);
                            setCurrentTask(null);
                        }}
                    />
                )}
            </AnimatePresence>


            {/* Next Up Panel (Fixed Bottom Right) */}
            <NextUpPanel nodes={localNodes} onTaskClick={(ids) => setCurrentTask(ids)} />
        </>
    )
}

const MainNode = ({ node, isExpanded, onClick, onDragEnd }) => {
    // ... existing colors ...
    const statusColors = {
        completed: 'bg-brutal-blue text-white',
        active: 'bg-brutal-yellow text-black',
        locked: 'bg-brutal-red text-white'
    }

    const icons = {
        completed: <Check size={48} strokeWidth={4} />,
        active: <Play size={48} strokeWidth={4} fill="currentColor" />,
        locked: <Lock size={48} strokeWidth={3} />
    }

    // Knowledge Density: scale node by task count
    const taskCount = node.subNodes?.reduce((sum, s) => sum + (s.tasks?.length || 0), 0) || 0
    const baseSize = 128
    const scaledSize = Math.min(176, baseSize + taskCount * 8) // grows with more tasks
    const halfSize = scaledSize / 2

    return (
        <motion.div

            initial={{ scale: 0 }}
            animate={{ scale: 1, x: 0, y: 0 }} // Reset drag visual state on re-render to defer to 'style' (left/top)
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
                // Prevent click when dragging
                if (Math.abs(e.movementX) > 1 || Math.abs(e.movementY) > 1) return;
                onClick && onClick();
            }}
            // Use absolute positioning driven by state
            style={{ left: node.x, top: node.y, width: scaledSize, height: scaledSize, marginLeft: -halfSize, marginTop: -halfSize }}
            className={`absolute rounded-full border-4 border-black shadow-brutal cursor-default z-20 flex items-center justify-center group flex-col gap-2
        ${statusColors[node.status]} ${isExpanded ? 'ring-4 ring-black ring-offset-4' : ''}
      `}
        >
            {icons[node.status]}
            <span className="font-mono text-lg font-black opacity-90 tracking-widest uppercase">{taskCount} TASKS</span>
            <div className="absolute -bottom-28 w-64 text-center bg-white border-4 border-black p-3 font-black font-mono text-lg text-black shadow-[8px_8px_0px_0px_#000] z-30 transform hover:-translate-y-1 transition-transform">
                {node.title || "Unknown Concept"}
            </div>
            {/* You Are Here Pulse - only on active node */}
            {node.status === 'active' && (
                <>
                    <div className="absolute inset-0 rounded-full border-4 border-brutal-yellow animate-ping opacity-30" />
                    <span className="absolute -top-12 bg-black text-[#0f0] px-4 py-1.5 border-2 border-white font-mono text-sm font-black uppercase tracking-widest whitespace-nowrap shadow-brutal">
                        [ CURRENT_MISSION ]
                    </span>
                </>
            )}
        </motion.div>
    )
}

function SubNode({ centerX, centerY, parentX, parentY, data, isExpanded, onClick }) {
    const bgClass = isExpanded ? 'bg-brutal-yellow' : 'bg-white';

    return (
        <motion.div
            initial={{ scale: 0, x: parentX, y: parentY }}
            animate={{ scale: 1, x: centerX, y: centerY }}
            exit={{ scale: 0, x: parentX, y: parentY, opacity: 0 }}
            className="absolute top-0 left-0 w-0 h-0 z-20"
        >
            <div
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className={`absolute min-w-[160px] ${bgClass} border-3 border-black flex items-center justify-center cursor-pointer shadow-brutal hover:bg-brutal-yellow hover:scale-105 transition-all px-6 py-4 -translate-x-1/2 -translate-y-1/2 pointer-events-auto group`}
            >
                <div className="flex flex-col items-center">
                    <span className="font-bold text-lg uppercase leading-tight text-center whitespace-nowrap transition-transform group-hover:scale-110 origin-center">
                        {data.title}
                    </span>
                    {/* Expand Indicator */}
                    <div className="mt-1">
                        {isExpanded ? <Minus size={20} /> : <Plus size={20} />}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

function TaskNode({ centerX, centerY, parentX, parentY, data, onClick }) {
    const title = typeof data === 'string' ? data : data.title;
    const isCompleted = typeof data === 'object' && data.completed;

    return (
        <motion.div
            initial={{ scale: 0, x: parentX, y: parentY }}
            animate={{ scale: 1, x: centerX, y: centerY }}
            exit={{ scale: 0, x: parentX, y: parentY, opacity: 0 }}
            className="absolute top-0 left-0 w-0 h-0 z-30"
        >
            <div
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className={`absolute w-52 border-2 border-black flex items-center justify-center cursor-pointer shadow-[4px_4px_0px_0px_#000] hover:scale-110 transition-transform px-4 py-3 -translate-x-1/2 -translate-y-1/2 pointer-events-auto group
                    ${isCompleted ? 'bg-brutal-green text-black' : 'bg-brutal-blue text-white'}
                `}
            >
                {isCompleted && <Check size={16} className="mr-1 flex-shrink-0" strokeWidth={3} />}
                <span className="font-bold font-mono text-sm uppercase leading-tight text-center line-clamp-3 transition-transform group-hover:scale-110">
                    {title}
                </span>
            </div>
        </motion.div>
    )
}
