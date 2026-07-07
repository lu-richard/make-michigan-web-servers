import { useEffect, useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import supabase from "../lib/supabase";
// import styles from "../styles/dataTable.module.css";
import DashboardNavBar from "../components/DashboardNavBar";
import type { CertificateData } from "../types/types";

// This type helps us sort our data
type SortDirection = "asc" | "desc" | null;

export default function MyTrainings() {
  // Get the current user's session from our app context
  const { profile } = useAppContext();
  
  // State variables to manage our component
  const [credentials, setCredentials] = useState<CertificateData[]>([]); // Store the credential data
  const [loading, setLoading] = useState(false); // Track if we're loading data
  const [error, setError] = useState<string | null>(null); // Store any error messages
  
  // State for table functionality
  const [search, setSearch] = useState(""); // What the user is searching for
  const [sortKey, setSortKey] = useState<keyof CertificateData | null>(null); // Which column to sort by
  const [sortDirection, setSortDirection] = useState<SortDirection>(null); // Sort ascending or descending
  const [currentPage, setCurrentPage] = useState(1); // Which page we're on
  const [rowsPerPage, setRowsPerPage] = useState(10); // How many rows to show per page

  // Define what columns our table will have
  const columns = [
    { key: "credential_id" as keyof CertificateData, label: "Credential ID", sortable: true },
    { key: "credential_status" as keyof CertificateData, label: "Status", sortable: true },
    { key: "issuing_makerspace_id" as keyof CertificateData, label: "Issued By", sortable: true },
    { key: "issue_date" as keyof CertificateData, label: "Issue Date", sortable: true },
    { key: "expiration_date" as keyof CertificateData, label: "Expiration Date", sortable: true },

  ];

  // This function runs when the component loads or when the user session changes
  useEffect(() => {
    // We use this flag to prevent updating state if the component unmounts
    let isMounted = true;

    // Function to fetch credentials from Supabase
    const fetchCredentials = async () => {
      // If no user is logged in, don't fetch anything - A user can't access this page unless they are already logged in
      // if (!session?.user?.id) {
      //   setCredentials([]);
      //   return;
      // }

      setLoading(true); // Show loading state
      setError(null); // Clear any previous errors

      try {

        // Query Supabase for credentials belonging to the current user
        const { data, error: queryError } = await supabase
          .schema("private")
          .from("credential_summary") // Remove the generic type parameter, just use the table name
          .select("*") // Get all columns
          .eq("recipient_user_id", profile!["user_id"]) // Only get rows where recipient_user_id matches current user
          .order("completion_date", { ascending: false }); // Sort by completion date, newest first

          setCredentials((data || []) as unknown as CertificateData[]);
        // If there was an error with the query, throw it
        if (queryError) {
          console.error("Supabase query error:", queryError);
          throw queryError;
        }

        // Only update state if component is still mounted
        if (isMounted) {
          // Convert the Supabase data to our CertificateData type
          setCredentials((data || []) as unknown as CertificateData[]);
        }
      } catch (err: any) {
        console.error("Error fetching credentials:", err);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setError(err.message || "Failed to fetch credentials");
        }
      } finally {
        // Always stop loading, whether we succeeded or failed
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Actually call the function
    fetchCredentials();

    // Cleanup function - runs when component unmounts or dependencies change
    return () => {
      isMounted = false;
    };
  }, [profile!["user_id"]]); // Re-run this effect when the user ID changes

  // This useMemo hook processes our data for display
  // It will re-run whenever the credentials, search term, or sort settings change
  const processedData = useMemo(() => {
    let filtered = credentials;

    // Step 1: Filter based on search term
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = credentials.filter((credential) => 
        // Search through all the credential data
        Object.values(credential).some((value) =>
          String(value || "").toLowerCase().includes(searchLower)
        )
      );
    }

    // Step 2: Sort the data if a sort column is selected
    if (sortKey && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const valueA = a[sortKey];
        const valueB = b[sortKey];

        // Handle null/undefined values
        if (valueA == null && valueB == null) return 0;
        if (valueA == null) return sortDirection === "asc" ? -1 : 1;
        if (valueB == null) return sortDirection === "asc" ? 1 : -1;

        // Try to parse as dates for date columns
        if (sortKey.includes("date") || sortKey === "completion_date") {
          const dateA = new Date(String(valueA));
          const dateB = new Date(String(valueB));
          
          if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
            return sortDirection === "asc" 
              ? dateA.getTime() - dateB.getTime()
              : dateB.getTime() - dateA.getTime();
          }
        }

        // Default: sort as strings
        const stringA = String(valueA).toLowerCase();
        const stringB = String(valueB).toLowerCase();
        
        if (stringA < stringB) return sortDirection === "asc" ? -1 : 1;
        if (stringA > stringB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [credentials, search, sortKey, sortDirection]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(processedData.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentPageData = processedData.slice(startIndex, endIndex);

  // Function to handle sorting when user clicks a column header
  const handleSort = (columnKey: keyof CertificateData) => {
    if (sortKey === columnKey) {
      // If clicking the same column, cycle through: asc -> desc -> none
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortKey(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      // If clicking a different column, start with ascending
      setSortKey(columnKey);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Function to format dates nicely
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—"; // Show dash for null dates
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return dateString;
      
      // Format as MM/DD/YYYY
      return date.toLocaleDateString();
    } catch {
      return dateString; // If formatting fails, show original string
    }
  };

  // Function to render status with appropriate styling
  const renderStatus = (status: string | string[] | null | undefined) => {
    // Normalize input: arrays -> comma string, null/undefined -> empty
    const raw = Array.isArray(status) ? status.join(", ") : status ?? "";

    // Take the primary token (before any comma) and trim
    const primary = raw.split(",")[0].trim();

    // Map known variants to CSS classes (fallback provided)
    let statusClass = "bg-[#f3f4f6] text-[#374151]";
    switch (primary) {
      case "active_user":
        statusClass = "bg-[#dcfce7] text-[#166534]";
        break;
      case "pending_user":
        statusClass = "bg-[#fef3c7] text-[#92400e]";
        break;
      case "expired":
        statusClass = "bg-[#fee2e2] text-[#dc2626]";
        break;
      case "invalidated":
        statusClass = "bg-[#f3f4f6] text-[#374151]";
        break;
      case "operator":
        statusClass = "bg-[#e0e7ff] text-[#3730a3]";
        break;
      default:
        statusClass = "bg-[#f3f4f6] text-[#374151]";
    }

    // Friendly label: replace underscores with spaces and Title Case
    const label = primary
      ? primary.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Unknown";

    return <span className={`py-1 px-2 rounded-sm text-xs font-medium uppercase ${statusClass}`}>{label}</span>;
  };
  // Main component render
  return (
    <>
      <DashboardNavBar />
      <div style={{ padding: "24px" }}>
        <h1 style={{ marginBottom: "24px", color: "#1f2937" }}>My Certificates</h1>
        
        {/* Show error message if there's an error */}
        {error && (
          <div className="p-4 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] rounded-md mb-4">
            Error: {error}
          </div>
        )}

        <div className="bg-main-bg border border-neutral-100 rounded-sm box-shadow-sm text-navy-blue overflow-hidden">
          {/* Toolbar with search and controls */}
          <div className="flex justify-between items-center p-4 border-b border-b-[#f1f5f9] bg-[#f8fafc] gap-3 ">
            <div className="flex items-center gap-3">
              <input
                type="text"
                className="py-2 px-3 border border-[#d1d5db] rounded-md min-w-[200px] text-sm"
                placeholder="Search certificates..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
              />
              <div className="text-[#6b7280] text-sm font-medium">
                {processedData.length} result{processedData.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-[#374151] flex items-center gap-1.5">
                Rows per page:
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </label>
            </div>
          </div>

          {/* Show loading state */}
          {loading && (
            <div className="flex justify-center items-center p-12 text-[#6b7280]">
              <div>Loading certificates...</div>
            </div>
          )}

          {/* Show table when not loading */}
          {!loading && (
            <>
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {columns.map((column) => {
                        const isActive = sortKey === column.key;
                        const isAscending = sortDirection === "asc";
                        
                        return (
                          <th
                            key={String(column.key)}
                            className={column.sortable ? "cursor-pointer user-select-none transition-colors duration-200" : ""}
                            onClick={() => column.sortable && handleSort(column.key)}
                          >
                            <div className="flex items-center gap-2">
                              <span>{column.label}</span>
                              {column.sortable && (
                                <span className="text-xs text-[#6b7280] min-w-3">
                                  {isActive 
                                    ? (isAscending ? "▲" : "▼")
                                    : "↕"
                                  }
                                </span>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageData.map((credential) => (
                      <tr key={credential.credential_id}>
                        <td>{credential.credential_model_name}</td>
                        <td>{renderStatus(
                              Array.isArray(credential.credential_status)
                              ? credential.credential_status.join(", ") // show all statuses
                              : credential.credential_status ?? ""      // fallback to empty string
                          )}
                        </td>
                        <td>{credential.makerspace_name}</td>
                        <td>{formatDate(credential.completion_date)}</td>
                        <td>{formatDate(credential.expiration_date)}</td>
                      </tr>
                    ))}
                    
                    {/* Show message when no data */}
                    {currentPageData.length === 0 && (
                      <tr>
                        <td colSpan={columns.length} className="text-center py-8 text-[#6b7280] italic">
                          {search.trim() ? "No certificates match your search" : "No certificates found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center p-4 border-t border-t-[#f1f5f9] bg-[#f8fafc]">
                <div>
                  <button
                    className="py-2 px-4 border border-[#d1d5db] rounded-md text-sm bg-main-bg text-[#374151] cursor-pointer transition duration-200"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span style={{ margin: "0 12px", color: "#6b7280" }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="py-2 px-4 border border-[#d1d5db] rounded-md text-sm bg-main-bg text-[#374151] cursor-pointer transition duration-200"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>

                <div className="text-[#6b7280] text-sm">
                  Showing {currentPageData.length === 0 ? 0 : startIndex + 1}–{Math.min(endIndex, processedData.length)} of {processedData.length}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}