import { useEffect, useState } from "react";
import { Building2, Grid2X2, Plus, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import AdminMenu from "../../components/AdminMenu";
import { EmptyState, FormMessage, LoadingState } from "../../components/ui";

const CONFIG = {
  categories: {
    title: "Categories",
    table: "categories",
    icon: Grid2X2,
    withSlug: true,
  },
  locations: {
    title: "Locations",
    table: "locations",
    icon: Building2,
    withSlug: false,
  },
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminTaxonomy({ kind }) {
  const config = CONFIG[kind] || CONFIG.categories;
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  function showMessage(text, type) {
    setMessage(text);
    setMessageType(type);
  }

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from(config.table)
      .select("id, name, status, created_at")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      showMessage(`Unable to load ${config.title.toLowerCase()}.`, "error");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  async function handleAdd(event) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setAdding(true);
    setMessage("");

    const payload = { name: trimmed, status: "active" };
    if (config.withSlug) payload.slug = slugify(trimmed);

    const { error } = await supabase.from(config.table).insert(payload);

    if (error) {
      console.error(error);
      showMessage(error.message || `Unable to add ${config.title.toLowerCase()}.`, "error");
    } else {
      setName("");
      showMessage(`${trimmed} added.`, "success");
      await fetchItems();
    }

    setAdding(false);
  }

  async function toggleStatus(item) {
    setBusyId(item.id);
    setMessage("");

    const next = item.status === "active" ? "inactive" : "active";
    const { error } = await supabase
      .from(config.table)
      .update({ status: next })
      .eq("id", item.id);

    if (error) {
      console.error(error);
      showMessage("Unable to update status.", "error");
    } else {
      showMessage(`${item.name} is now ${next}.`, "success");
      await fetchItems();
    }

    setBusyId(null);
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.name}"? Jobs using it will lose this reference.`)) return;

    setBusyId(item.id);
    setMessage("");

    const { error } = await supabase.from(config.table).delete().eq("id", item.id);

    if (error) {
      console.error(error);
      showMessage("Unable to delete. It may be in use by a job.", "error");
    } else {
      showMessage(`${item.name} deleted.`, "success");
      await fetchItems();
    }

    setBusyId(null);
  }

  const Icon = config.icon;

  return (
    <div className="page-shell">
      <div className="container-page max-w-5xl py-8 sm:py-12">
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
          Manage {config.title}
        </h1>

        <div className="mt-6">
          <AdminMenu />
        </div>

        {message && (
          <div className="mb-5">
            <FormMessage type={messageType === "success" ? "success" : "error"}>
              {message}
            </FormMessage>
          </div>
        )}

        <form onSubmit={handleAdd} className="card mb-6 flex flex-wrap items-end gap-3 p-5">
          <label className="min-w-[220px] flex-1">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">
              New {kind === "categories" ? "category" : "location"} name
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={kind === "categories" ? "e.g. IT Jobs" : "e.g. Noida"}
              className="input min-h-11 w-full"
              required
            />
          </label>
          <button type="submit" disabled={adding} className="btn btn-primary min-h-11 px-5 py-2 text-sm">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {adding ? "Adding..." : "Add"}
          </button>
        </form>

        {loading ? (
          <LoadingState label={`Loading ${config.title.toLowerCase()}...`} />
        ) : items.length === 0 ? (
          <EmptyState icon={Icon} title={`No ${config.title.toLowerCase()} yet.`} />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Added</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-line/80 last:border-0">
                      <td className="px-4 py-4 font-semibold text-ink">{item.name}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${
                          item.status === "active"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : "bg-slate-100 text-slate-600 ring-slate-200"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-muted">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={busyId === item.id}
                            onClick={() => toggleStatus(item)}
                            className="inline-flex min-h-9 items-center rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-indigo-100 disabled:opacity-50"
                          >
                            {item.status === "active" ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            disabled={busyId === item.id}
                            onClick={() => handleDelete(item)}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
