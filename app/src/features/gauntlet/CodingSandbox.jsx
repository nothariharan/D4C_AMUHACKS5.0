import React, { useState } from 'react';
import { FileCode } from 'lucide-react';
import Editor from '@monaco-editor/react';

export function CodingSandbox({ gauntlet, files, setFiles }) {
    const [activeFile, setActiveFile] = useState('index.html');

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* File Tabs */}
            <div className="flex bg-gray-200 border-b-4 border-black">
                {Object.keys(files).map(fileName => (
                    <button
                        key={fileName}
                        onClick={() => setActiveFile(fileName)}
                        className={`px-6 py-3 border-r-2 border-black font-black text-xs uppercase transition-all
                            ${activeFile === fileName ? 'bg-white translate-y-[2px]' : 'bg-transparent text-gray-500 hover:bg-white'}
                        `}
                    >
                        <div className="flex items-center gap-2">
                            <FileCode size={14} /> {fileName}
                        </div>
                    </button>
                ))}
                <div className="ml-auto p-3 text-[10px] text-gray-400 italic">AUTO-SAVING TO CLOUD...</div>
            </div>

            {/* Editor */}
            <div className="flex-1 border-b-4 border-black shadow-inner">
                <Editor
                    height="100%"
                    theme="vs-dark"
                    path={activeFile}
                    defaultLanguage={activeFile.endsWith('.html') ? 'html' : activeFile.endsWith('.css') ? 'css' : 'javascript'}
                    value={files[activeFile]}
                    onChange={(val) => setFiles(prev => ({ ...prev, [activeFile]: val }))}
                    options={{
                        fontSize: 16,
                        fontFamily: "'JetBrains Mono', monospace",
                        minimap: { enabled: false },
                        padding: { top: 20 }
                    }}
                />
            </div>
        </div>
    );
}
