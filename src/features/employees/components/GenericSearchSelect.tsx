import React, { useEffect, useState } from "react";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import GenericCreateModal from "./modal/GenericCreateModal";
import { Button } from "@/shared/components/ui/button/Button2";
import { Search, Plus } from "lucide-react";

const GenericSearchSelect = ({ api, config, value, onChange }) => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchData = async () => {
    try {
      const data = await api.getAll();
      setList(data || []);
      setFilteredList(data || []);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter danh sách khi search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredList(list);
    } else {
      const filtered = list.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredList(filtered);
    }
  }, [searchTerm, list]);

  // Reset search khi đóng dropdown
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  const handleAfterCreate = () => {
    fetchData();
    setSearchTerm("");
  };

  const selectedItem = list.find(item => item.id.toString() === value);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select 
          value={value} 
          onValueChange={onChange}
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <SelectTrigger>
            <SelectValue placeholder={config.placeholder}>
              {selectedItem?.name || config.placeholder}
            </SelectValue>
          </SelectTrigger>
          <SelectContent 
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {/* Search input trong dropdown - ngăn chặn hành vi typeahead */}
            <div 
              className="px-2 pb-2 sticky top-0 bg-background z-10 border-b"
              onKeyDown={(e) => {
                // Ngăn Select component xử lý phím
                e.stopPropagation();
              }}
            >
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    // Ngăn Select xử lý các phím như ArrowDown, Enter
                    e.stopPropagation();
                    
                    // Cho phép Enter để tạo mới nếu không có kết quả
                    if (e.key === 'Enter' && filteredList.length === 0 && searchTerm && config.enableCreate !== false) {
                      e.preventDefault();
                      setOpenCreate(true);
                      setIsOpen(false);
                    }
                  }}
                  autoFocus
                  onFocus={(e) => {
                    // Đặt con trỏ ở cuối text
                    e.target.setSelectionRange(e.target.value.length, e.target.value.length);
                  }}
                />
              </div>
            </div>

            {/* Nút tạo mới nếu không tìm thấy */}
            {filteredList.length === 0 && searchTerm && config.enableCreate !== false && (
              <div className="px-2 py-3 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Không tìm thấy "{searchTerm}"
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenCreate(true);
                    setIsOpen(false);
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo mới "{searchTerm}"
                </Button>
              </div>
            )}

            {/* Thông báo nếu không có kết quả và không cho phép tạo mới */}
            {filteredList.length === 0 && searchTerm && config.enableCreate === false && (
              <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                Không tìm thấy kết quả
              </div>
            )}

            {/* Danh sách items */}
            {filteredList.length > 0 && (
              <div className="max-h-[300px] overflow-y-auto">
                {filteredList.map(item => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      {item.code && (
                        <span className="text-xs text-muted-foreground">
                          Mã: {item.code}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </div>
            )}

            {/* Hiển thị tất cả nếu chưa search */}
            {!searchTerm && list.length === 0 && (
              <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                Chưa có dữ liệu
              </div>
            )}
          </SelectContent>
        </Select>

        {/* Nút thêm nhanh bên ngoài */}
        {config.enableCreate !== false && (
          <Button 
            type="button" 
            onClick={() => setOpenCreate(true)}
            size="icon"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Modal thêm mới */}
      <GenericCreateModal
        open={openCreate}
        onOpenChange={setOpenCreate}
        api={api}
        config={config}
        afterCreate={handleAfterCreate}
      />
    </div>
  );
};

export default GenericSearchSelect;