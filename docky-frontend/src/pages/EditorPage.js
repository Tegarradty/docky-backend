import { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import CodeBlockTool from "../components/CodeBlockTool";
import "./EditorPage.css";

const STORAGE_KEY = "docky-documents";

const createEmptyContent = () => ({
  time: Date.now(),
  blocks: [
    {
      type: "codeBlock",
      data: { code: "" },
    },
  ],
});

function EditorPage() {
  const editorRef = useRef(null);
  const currentIdRef = useRef("");
  const titleRef = useRef("");
  const isRenderingRef = useRef(false);

  const [documents, setDocuments] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [currentId, setCurrentId] = useState("");
  const [title, setTitle] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");

  const filteredDocuments = documents.filter((doc) =>
    (doc.title || "Dokumen Baru")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const activeDocument = documents.find((doc) => doc.id === currentId);
  const hasDocuments = documents.length > 0;

  useEffect(() => {
    currentIdRef.current = currentId;
  }, [currentId]);

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  const showSavedStatus = () => {
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 1200);
    }, 300);
  };

  const saveToStorage = (next) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setDocuments(next);
  };

  useEffect(() => {
    if (editorRef.current) return;

    const editor = new EditorJS({
      holder: "editorjs",
      autofocus: false,
      tools: {
        codeBlock: {
          class: CodeBlockTool,
        },
      },
      data: createEmptyContent(),
      onReady: () => {
        editorRef.current = editor;
      },
      onChange: async () => {
        if (!editorRef.current) return;
        if (isRenderingRef.current) return;
        if (!currentIdRef.current) return;

        setSaveStatus("saving");

        const data = await editorRef.current.save();

        setDocuments((prev) => {
          const next = prev.map((doc) =>
            doc.id === currentIdRef.current
              ? {
                  ...doc,
                  title: titleRef.current || "Dokumen Baru",
                  content:
                    data.blocks && data.blocks.length > 0
                      ? data
                      : createEmptyContent(),
                }
              : doc
          );

          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });

        showSavedStatus();
      },
    });

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      } else {
        editor.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!currentId || !editorRef.current) return;

    const doc = documents.find((item) => item.id === currentId);
    if (!doc) return;

    isRenderingRef.current = true;

    editorRef.current.isReady
      .then(() =>
        editorRef.current.render(
          doc.content?.blocks?.length > 0 ? doc.content : createEmptyContent()
        )
      )
      .finally(() => {
        setTimeout(() => {
          isRenderingRef.current = false;
        }, 100);
      });
  }, [currentId]);

  const handleNew = () => {
    const newId = Date.now().toString();
    const newDoc = {
      id: newId,
      title: "Dokumen Baru",
      content: createEmptyContent(),
    };

    const next = [...documents, newDoc];
    saveToStorage(next);

    setCurrentId(newId);
    currentIdRef.current = newId;
    setTitle("Dokumen Baru");
    titleRef.current = "Dokumen Baru";
    setSearchTerm("");
    setSaveStatus("idle");
  };

  const handleSelect = (doc) => {
    setCurrentId(doc.id);
    currentIdRef.current = doc.id;
    setTitle(doc.title || "Dokumen Baru");
    titleRef.current = doc.title || "Dokumen Baru";
    setSaveStatus("idle");
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    titleRef.current = newTitle;

    if (!currentIdRef.current) return;

    setSaveStatus("saving");

    const next = documents.map((doc) =>
      doc.id === currentIdRef.current ? { ...doc, title: newTitle } : doc
    );

    saveToStorage(next);
    showSavedStatus();
  };

  const handleDelete = (e, docId) => {
    e.stopPropagation();

    const ok = window.confirm("Hapus dokumen ini?");
    if (!ok) return;

    const next = documents.filter((doc) => doc.id !== docId);
    saveToStorage(next);

    if (currentId === docId) {
      const fallback = next[0] || null;

      if (fallback) {
        setCurrentId(fallback.id);
        currentIdRef.current = fallback.id;
        setTitle(fallback.title || "Dokumen Baru");
        titleRef.current = fallback.title || "Dokumen Baru";
      } else {
        setCurrentId("");
        currentIdRef.current = "";
        setTitle("");
        titleRef.current = "";
      }
    }

    setSaveStatus("idle");
  };

  const handleRenameStart = (e, doc) => {
    e.stopPropagation();
    setRenamingId(doc.id);
    setRenameValue(doc.title || "Dokumen Baru");
  };

  const handleRenameSubmit = (docId) => {
    const trimmed = renameValue.trim() || "Dokumen Baru";

    const next = documents.map((doc) =>
      doc.id === docId ? { ...doc, title: trimmed } : doc
    );

    saveToStorage(next);

    if (currentId === docId) {
      setTitle(trimmed);
      titleRef.current = trimmed;
    }

    setRenamingId(null);
    setRenameValue("");
    setSaveStatus("idle");
  };

  const handleReset = () => {
    const ok = window.confirm("Hapus semua dokumen?");
    if (!ok) return;

    localStorage.removeItem(STORAGE_KEY);
    setDocuments([]);
    setCurrentId("");
    currentIdRef.current = "";
    setTitle("");
    titleRef.current = "";
    setRenamingId(null);
    setRenameValue("");
    setSearchTerm("");
    setSaveStatus("idle");
  };

  return (
    <div className="editor-page">
      <div className="editor-topbar">
        <h1>DOCKY Editor</h1>
        <div className="editor-actions">
          <button onClick={handleNew}>New Document</button>
          <button onClick={handleReset} className="reset-btn">
            Reset All
          </button>
        </div>
      </div>

      <div className="editor-layout">
        <div className="doc-list">
          <input
            className="doc-search-input"
            type="text"
            placeholder="Cari dokumen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {documents.length === 0 ? (
            <p className="empty-docs">Belum ada dokumen</p>
          ) : filteredDocuments.length === 0 ? (
            <p className="empty-docs">Tidak ada hasil pencarian</p>
          ) : (
            filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`doc-item ${currentId === doc.id ? "active" : ""}`}
                onClick={() => handleSelect(doc)}
              >
                {renamingId === doc.id ? (
                  <input
                    className="rename-input"
                    value={renameValue}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(doc.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameSubmit(doc.id);
                      if (e.key === "Escape") {
                        setRenamingId(null);
                        setRenameValue("");
                      }
                    }}
                  />
                ) : (
                  <span className="doc-title-text">
                    {doc.title || "Dokumen Baru"}
                  </span>
                )}

                <div className="doc-actions">
                  <button
                    className="doc-action-btn rename"
                    title="Rename"
                    onClick={(e) => handleRenameStart(e, doc)}
                  >
                    ✏️
                  </button>
                  <button
                    className="doc-action-btn delete"
                    title="Delete"
                    onClick={(e) => handleDelete(e, doc.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="editor-main">
          {hasDocuments && activeDocument && (
            <>
              <input
                className="doc-title-input"
                value={title}
                onChange={handleTitleChange}
                placeholder="Judul dokumen"
              />

              <div className="editor-status">
                {saveStatus === "idle" && (
                  <span className="status-idle">Siap</span>
                )}
                {saveStatus === "saving" && (
                  <span className="status-saving">Menyimpan...</span>
                )}
                {saveStatus === "saved" && (
                  <span className="status-saved">Tersimpan</span>
                )}
              </div>
            </>
          )}

          <div className="editor-area">
            {!hasDocuments || !activeDocument ? (
              <div className="editor-empty-state">
                <h2>Belum ada dokumen</h2>
                <p>
                  Klik <strong>New Document</strong> untuk mulai menulis.
                </p>
              </div>
            ) : null}

            <div
              id="editorjs"
              style={{
                display: hasDocuments && activeDocument ? "block" : "none",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;