import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  FileUp,
  Send,
  X,
  Download,
  File,
  HardDrive,
  FileText,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

export const ChatPanel = ({
  messages = [],
  onSendMessage,
  onSendFile,
  transferProgress,
  receivedFiles = [],
  onClose,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'notes' | 'files'
  const [inputMessage, setInputMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [meetingNotes, setMeetingNotes] = useState(
    `# Meeting Agenda & Notes\n- Project: CodeAlpha Real-Time Conference App\n- Lead Developer: Nayab Farooq\n\n## Action Items\n[ ] Review WebRTC STUN full-mesh performance\n[ ] Test interactive synchronized whiteboard with pastel brushes\n[ ] Verify P2P chunked file transfer over DataChannels\n[x] Completed initial prototype demonstration`
  );
  const [notesCopied, setNotesCopied] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    onSendMessage(inputMessage.trim());
    setInputMessage('');
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFileUpload(file);
    }
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFileUpload(file);
    }
  };

  const processFileUpload = async (file) => {
    setFileError(null);
    try {
      await onSendFile(file);
    } catch (err) {
      setFileError(err.message || 'File transfer failed');
    }
  };

  const copyNotes = () => {
    navigator.clipboard.writeText(meetingNotes);
    setNotesCopied(true);
    setTimeout(() => setNotesCopied(false), 2000);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getSenderAvatar = (senderName) => {
    const name = (senderName || '').toLowerCase();
    if (name.includes('nayab')) return '/avatars/nayab.jpg';
    if (name.includes('sarah')) return '/avatars/sarah.jpg';
    if (name.includes('david') || name.includes('alex')) return '/avatars/david.jpg';
    return '/avatars/nayab.jpg';
  };

  return (
    <aside className="w-80 md:w-96 h-full flex flex-col pastel-panel border-l border-pastel-lavender/15 select-none z-20 animate-in slide-in-from-right duration-200 shadow-2xl">
      {/* Header & Tabs */}
      <div className="p-3.5 border-b border-pastel-lavender/15 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center space-x-1 p-1 bg-slate-950/80 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-pastel-lavender" />
            <span>Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-pastel-mint" />
            <span>Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'files'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileUp className="w-3.5 h-3.5 text-pastel-peach" />
            <span>Files</span>
            {receivedFiles.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-pastel-mint/20 text-pastel-mint text-[10px] flex items-center justify-center font-bold">
                {receivedFiles.length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* --- TAB 1: GROUP CHAT --- */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3 text-pastel-lavender">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200">No messages yet</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                    Share thoughts or links with everyone in the room
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentUser?.id || msg.sender === currentUser?.name;
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar Image */}
                      <img
                        src={getSenderAvatar(msg.sender)}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-pastel-lavender/30 mt-1 shrink-0"
                      />

                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-0.5 px-1">
                          <span className="font-semibold text-slate-300">
                            {isMe ? 'You' : msg.sender}
                          </span>
                          {msg.isHost && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-pastel-peach/20 text-pastel-peach border border-pastel-peach/30 font-semibold">
                              Host
                            </span>
                          )}
                          <span className="text-[10px]">
                            {msg.timestamp
                              ? new Date(msg.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-xs md:text-sm max-w-[85%] break-words leading-relaxed shadow-md ${
                            isMe
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none shadow-purple-950/40 border border-purple-400/20'
                              : 'bg-slate-800/90 text-slate-100 rounded-tl-none border border-pastel-lavender/15'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendText} className="p-3 border-t border-pastel-lavender/15 bg-slate-900/70">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-slate-950/90 border border-pastel-lavender/20 rounded-xl pl-3.5 pr-10 py-2.5 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pastel-lavender transition-colors shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="absolute right-1.5 p-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-30 text-white transition-all shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- TAB 2: COLLABORATIVE MEETING NOTES --- */}
        {activeTab === 'notes' && (
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-pastel-lavender/15">
              <span className="text-xs font-semibold text-pastel-mint flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Shared Meeting Notes
              </span>
              <button
                onClick={copyNotes}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 flex items-center gap-1 transition-colors border border-white/5"
              >
                {notesCopied ? (
                  <>
                    <Check className="w-3 h-3 text-pastel-mint" />
                    <span className="text-pastel-mint">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-pastel-lavender" />
                    <span>Copy All</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              className="flex-1 w-full bg-slate-950/70 border border-pastel-lavender/15 rounded-xl p-3 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-pastel-lavender resize-none"
              placeholder="Jot down notes, action items, or key decisions here..."
            />

            <p className="text-[10px] text-slate-400 mt-2">
              💡 Notes are kept in sync during the conference session.
            </p>
          </div>
        )}

        {/* --- TAB 3: P2P FILE SHARING --- */}
        {activeTab === 'files' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
            {/* Direct WebRTC DataChannel explanation badge */}
            <div className="px-3.5 py-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center space-x-2 text-xs text-pastel-lavender shadow-sm">
              <HardDrive className="w-4 h-4 text-pastel-mint shrink-0" />
              <span>Direct peer-to-peer file transfer over WebRTC DataChannels. Unlimited size.</span>
            </div>

            {/* File Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-pastel-lavender bg-purple-950/30'
                  : 'border-pastel-lavender/25 hover:border-pastel-lavender/50 bg-slate-900/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />
              <FileUp className="w-8 h-8 text-pastel-lavender mb-2 animate-bounce" />
              <p className="text-xs font-semibold text-slate-200">
                Click to browse or drop file here
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Transfers direct to all peers with zero server storage
              </p>
            </div>

            {fileError && (
              <div className="text-xs text-pastel-coral bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                {fileError}
              </div>
            )}

            {/* Active Transfer Progress */}
            {transferProgress && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-pastel-lavender/30 shadow-lg space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white truncate max-w-[180px]">
                    {transferProgress.fileName}
                  </span>
                  <span className="text-pastel-mint font-mono font-bold">
                    {transferProgress.percent}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pastel-lavender to-pastel-mint transition-all duration-150"
                    style={{ width: `${transferProgress.percent}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>
                    {transferProgress.type === 'send' ? 'Sending to peers...' : `Receiving from ${transferProgress.senderName}...`}
                  </span>
                  <span>{transferProgress.percent === 100 ? 'Finalizing...' : 'In Progress'}</span>
                </div>
              </div>
            )}

            {/* List of Received / Shared Files */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-pastel-lavender px-1">
                Shared Files ({receivedFiles.length})
              </h2>

              {receivedFiles.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No files shared yet during this call.
                </p>
              ) : (
                receivedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-pastel-lavender/15 flex items-center justify-between hover:border-pastel-lavender/35 transition-colors shadow-sm"
                  >
                    <div className="flex items-center space-x-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-pastel-lavender flex items-center justify-center shrink-0 border border-purple-500/30">
                        <File className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-medium text-slate-200 truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formatFileSize(file.size)} • {file.senderName} • {file.timestamp}
                        </p>
                      </div>
                    </div>

                    <a
                      href={file.url}
                      download={file.name}
                      className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500 text-pastel-lavender hover:text-white transition-all ml-2 shrink-0"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
