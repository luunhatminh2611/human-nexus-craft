import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";

export interface Employee {
  id: number;
  fullName: string;
  employeeCode: string;
  departmentName?: string;
  positionName?: string;
}

interface EmployeeSearchProps {
  employees: any[];
  value?: string;
  onChange: (id: string, employee?: any) => void;
  isLoading?: boolean;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function EmployeeSearch({
  employees,
  value,
  onChange,
  isLoading = false,
  error,
  placeholder = "Tìm theo mã hoặc tên nhân viên...",
  disabled = false,
}: EmployeeSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) setQuery("");
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = employees.filter(
    (e) =>
      (e.fullName ?? "").toLowerCase().includes(query.toLowerCase()) ||
      (e.employeeCode ?? "").toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = useCallback(
    (emp: Employee) => {
      if (emp.id == null) return;
      onChange(emp.id.toString(), emp);
      setQuery(emp.fullName);
      setOpen(false);
      setFocusedIdx(-1);
    },
    [onChange],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
    setFocusedIdx(-1);
    if (!e.target.value) onChange("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") setOpen(true);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIdx((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIdx((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[focusedIdx]) handleSelect(filtered[focusedIdx]);
        break;
      case "Escape":
        setOpen(false);
        setFocusedIdx(-1);
        break;
    }
  };

  const highlight = (text: string) => {
    if (!text) return <></>;
    if (!query) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-transparent text-blue-600 font-semibold">
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  };

  const isDisabled = disabled || isLoading;

  return (
    <div className="space-y-1.5">
      <div className="relative" ref={containerRef}>
        {/* Input */}
        <div className="relative">
          {isLoading ? (
            <Loader2
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4
                text-gray-400 animate-spin"
            />
          ) : (
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4
                text-gray-400"
            />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-invalid={!!error}
            className={[
              "w-full h-10 pl-10 pr-3 rounded-md border text-sm",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors duration-150",
              error
                ? "border-red-400 bg-red-50"
                : "border-gray-300 bg-white hover:border-gray-400",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        </div>

        {open && (
          <div
            role="listbox"
            aria-label="Danh sách nhân viên"
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200
              rounded-lg shadow-lg max-h-56 overflow-y-auto"
          >
            {isLoading ? (
              <div
                className="flex items-center justify-center gap-2 px-3 py-4
                text-sm text-gray-500"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải danh sách...
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((emp, i) => (
                <button
                  key={emp.id}
                  type="button"
                  role="option"
                  aria-selected={value === emp.id.toString()}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(emp);
                  }}
                  className={[
                    "w-full px-3 py-2 text-left transition-colors duration-100",
                    "border-b border-gray-100 last:border-b-0",
                    i === focusedIdx ? "bg-gray-100" : "hover:bg-gray-50",
                    value === emp.id.toString() ? "bg-green-50" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="text-sm font-medium text-gray-900">
                    {highlight(emp.fullName)}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {highlight(emp.employeeCode)}
                    {emp.departmentName && ` · ${emp.departmentName}`}
                    {emp.positionName && ` · ${emp.positionName}`}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                Không tìm thấy nhân viên nào
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
