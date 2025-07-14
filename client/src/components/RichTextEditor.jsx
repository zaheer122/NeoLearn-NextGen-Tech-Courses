import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';

const RichTextEditor = ({ initialValue = '', onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: initialValue || '<p>Start writing...</p>',
    onUpdate: ({ editor }) => {
      // Call the onChange prop with the HTML content when editor content changes
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  // Update editor content when initialValue prop changes
  useEffect(() => {
    if (editor && initialValue) {
      // Only update if the content is different to avoid cursor position reset
      if (editor.getHTML() !== initialValue) {
        editor.commands.setContent(initialValue);
      }
    }
  }, [editor, initialValue]);

  if (!editor) return null;

  return (
    <div className="p-4 border rounded shadow space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()} 
          className={getButtonClass(editor, 'bold')}
        >
          Bold
        </button>
        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          className={getButtonClass(editor, 'italic')}
        >
          Italic
        </button>
        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          className={getButtonClass(editor, 'underline')}
        >
          Underline
        </button>
        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()} 
          className={getButtonClass(editor, 'strike')}
        >
          Strike
        </button>

        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          className={getButtonClass(editor, 'heading', 1)}
        >
          H1
        </button>
        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          className={getButtonClass(editor, 'heading', 2)}
        >
          H2
        </button>

        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          className={getButtonClass(editor, 'bulletList')}
        >
          • List
        </button>
        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          className={getButtonClass(editor, 'orderedList')}
        >
          1. List
        </button>

        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          className={getButtonClass(editor, 'blockquote')}
        >
          ❝ Blockquote
        </button>
        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
          className={getButtonClass(editor, 'codeBlock')}
        >
          ⌘ Code
        </button>

        <button 
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()} 
          className="px-2 py-1 border rounded"
        >
          ― Rule
        </button>
        <button 
          type="button"
          onClick={() => editor.chain().focus().undo().run()} 
          className="px-2 py-1 border rounded"
        >
          ↺ Undo
        </button>
        <button 
          type="button"
          onClick={() => editor.chain().focus().redo().run()} 
          className="px-2 py-1 border rounded"
        >
          ↻ Redo
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="min-h-[150px] prose max-w-full" />
    </div>
  );
};

const getButtonClass = (editor, format, level = null) => {
  const isActive = format === 'heading'
    ? editor.isActive('heading', { level })
    : editor.isActive(format);

  return `px-2 py-1 border rounded ${
    isActive ? 'bg-gray-200 font-semibold' : ''
  }`;
};

export default RichTextEditor;
