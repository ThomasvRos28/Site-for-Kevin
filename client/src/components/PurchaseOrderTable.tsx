import React, { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";

// Placeholder API call
async function fetchPOs() {
  // Replace with real API call
  return [];
}

// Placeholder action handlers
function handleApprove(poId: string) {
  // TODO: Implement approve logic
  alert(`Approve PO ${poId}`);
}
function handleReject(poId: string) {
  // TODO: Implement reject logic
  alert(`Reject PO ${poId}`);
}
function handleReminder(poId: string) {
  // TODO: Implement reminder logic
  alert(`Send reminder for PO ${poId}`);
}

function exportToCSV(data: any[], filename = "purchase_orders.csv") {
  if (!data.length) return;
  const replacer = (key: string, value: any) => (value === null ? "" : value);
  const header = Object.keys(data[0]);
  const csv = [
    header.join(","),
    ...data.map(row =>
      header
        .map(fieldName => JSON.stringify(row[fieldName], replacer))
        .join(",")
    ),
  ].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

const statusColors: Record<string, string> = {
  Approved: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Rejected: "bg-red-100 text-red-800",
  Expired: "bg-gray-200 text-gray-700",
};

const statusOptions = ["All", "Pending", "Approved", "Rejected", "Expired"];

export default function PurchaseOrderTable() {
  const [pos, setPOs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const data = await fetchPOs();
    setPOs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPOs = useMemo(() => {
    let filtered = pos;
    if (search) {
      filtered = filtered.filter(
        po =>
          po.jobName?.toLowerCase().includes(search.toLowerCase()) ||
          po.clientName?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "All") {
      filtered = filtered.filter(po => po.status === statusFilter);
    }
    // Sort pending to top
    return filtered.sort((a, b) => {
      if (a.status === "Pending" && b.status !== "Pending") return -1;
      if (a.status !== "Pending" && b.status === "Pending") return 1;
      return 0;
    });
  }, [pos, search, statusFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by job or client..."
            className="border rounded px-3 py-2 w-64"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="border rounded px-3 py-2"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? "Syncing..." : "Sync"}
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => exportToCSV(filteredPOs)}
          >
            Export CSV
          </button>
        </div>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 rounded" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Job Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Base Hauling Rate(s)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client's Resale Rate(s)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">No purchase orders found.</td>
                </tr>
              ) : (
                filteredPOs.map(po => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{po.jobName}</td>
                    <td className="px-4 py-2">{po.clientName}</td>
                    <td className="px-4 py-2">{po.poNumber || po.id}</td>
                    <td className="px-4 py-2">
                      {Array.isArray(po.baseHaulingRates)
                        ? po.baseHaulingRates.join(", ")
                        : po.baseHaulingRates}
                    </td>
                    <td className="px-4 py-2">
                      {po.clientResaleRates ? (
                        Array.isArray(po.clientResaleRates)
                          ? po.clientResaleRates.join(", ")
                          : po.clientResaleRates
                      ) : (
                        <span className="inline-flex items-center text-gray-400" title="Missing resale rate">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                          N/A
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[po.status] || "bg-gray-100 text-gray-700"}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">{po.createdAt ? format(new Date(po.createdAt), "PPpp") : "-"}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <a
                          href={`/purchase-orders/${po.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </a>
                        {po.status === "Pending" && (
                          <>
                            <button
                              className="bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 text-xs"
                              onClick={() => handleApprove(po.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 text-xs"
                              onClick={() => handleReject(po.id)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 text-xs"
                          onClick={() => handleReminder(po.id)}
                        >
                          Send Reminder
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
