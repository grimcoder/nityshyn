'use client'
import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import styles

export default function EditorPage() {
    const [content, setContent] = useState('');

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
            <div className="bg-black p-8 rounded-lg shadow-md w-full max-w-2xl">
                <h1 className="text-2xl mb-4 font-bold">Rich Text Editor</h1>
                
                <ReactQuill 
                    value={content}
                    onChange={setContent}
                    theme="snow" // Use the "snow" theme
                />
                
                {/* Optionally, you can display the raw content below */}
                <div className="mt-4">
                    <h2 className="text-xl mb-2">Content:</h2>
                    <pre className="bg-black-200 p-4 rounded whitespace-pre-wrap">{content}</pre>
                </div>
            </div>
        </div>
    );
}