import { categoryConfigs } from "@/features/employees/components/CategoriesConfig";
import GenericSearchSelect from "@/features/employees/components/GenericSearchSelect";
import { Input } from '@/shared/components/ui/input';

const PendingSelect = ({ value, onChange, placeholder = 'Chọn...' }: any) => (
  <Input
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={`[TODO danh mục] ${placeholder}`}
    className="h-8 text-sm border-dashed"
  />
);

interface CategorySelectFieldProps {
  configKey: string;
  value: string;           // ID lưu trong formData
  onChange: (id: string) => void;
  displayValue?: string;   // Tên hiển thị lấy từ API (vd: provinceCityName)
  onChangeWithName?: (id: string, name: string) => void;
}

const CategorySelectField = ({ configKey, value, onChange, displayValue = '', onChangeWithName }: CategorySelectFieldProps) => {
  const cfg = categoryConfigs[configKey];

  if (!cfg) return <PendingSelect value={value} onChange={onChange} />;

  return (
    <GenericSearchSelect
      api={cfg.api}
      config={cfg}
      value={value}
      displayValue={displayValue}
      onChange={(id: string, item?: any) => {
        onChange(id);
        // Nếu cần lưu thêm name thì gọi callback phụ
        if (onChangeWithName && item) {
          onChangeWithName(id, item.name);
        }
      }}
    />
  );
};

export default CategorySelectField;