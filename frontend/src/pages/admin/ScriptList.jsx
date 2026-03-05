import { useEffect, useState } from "react";
import ScriptForm from "./ScriptForm";

export default function ScriptList() {
  const [scripts, setScripts] = useState([]);
  const [editingScript, setEditingScript] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchScripts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Not authenticated. Please login again.");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:5000/api/scripts", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.clear();
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Fetched scripts:", data);
      setScripts(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching scripts:", err);
      setError("Failed to load scripts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  const handleEdit = (script) => {
    setEditingScript(script);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this script?")) return;
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Not authenticated. Please login again.");
        return;
      }

      const res = await fetch(`http://localhost:5000/api/scripts/${id}`, { 
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.clear();
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }

      if (res.ok) {
        // Refresh the list after successful delete
        fetchScripts();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete script");
      }
    } catch (err) {
      console.error("Error deleting script:", err);
      setError("Failed to delete script");
    }
  };

  const handleSaveSuccess = () => {
    fetchScripts(); // Refresh the list
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">Loading scripts...</div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={() => window.location.href = '/login'}
            className="ml-2 text-blue-600 underline"
          >
            Go to Login
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Scripts</h2>
        <button
          onClick={() => { 
            setEditingScript(null); 
            setShowForm(true); 
          }}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          + Add New Script
        </button>
      </div>

      {showForm && (
        <ScriptForm
          script={editingScript}
          onClose={() => { 
            setShowForm(false); 
            setEditingScript(null); 
          }}
          onSave={handleSaveSuccess}
        />
      )}

      {scripts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No scripts found. Click "Add New Script" to create one.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {scripts.map((script) => (
            <div key={script._id} className="border rounded-lg p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{script.title}</h3>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded mt-1">
                    {script.type}
                  </span>
                  <p className="text-gray-600 mt-2 whitespace-pre-wrap">{script.content}</p>
                  {script.author && (
                    <p className="text-xs text-gray-400 mt-2">
                      Created by: {script.author.name || script.author.email}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(script)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(script._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}