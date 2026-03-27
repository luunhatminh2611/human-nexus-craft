import { useEffect, useState } from 'react';
import GenericSearchSelect from "@/features/employees/components/GenericSearchSelect";
import { categoryConfigs } from "@/features/employees/components/CategoriesConfig";
import { Input } from '@/shared/components/ui/input';

const PendingSelect = ({ value, onChange, placeholder = 'Chọn...' }: any) => (
  <Input
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={`[TODO danh mục] ${placeholder}`}
    className="h-8 text-sm border-dashed"
  />
);

interface NameSelectFieldProps {
  configKey: string;
  // currentName: tên string đang lưu trong formData (vd: "Hà Nội")
  currentName: string;
  onChange: (name: string) => void;
}

/**
 * Select danh mục nhưng lưu TÊN (string) thay vì ID vào formData.
 * Dùng cho các trường như nativePlace, homeTown, birthPlace.
 *
 * Phải là component độc lập (KHÔNG định nghĩa bên trong component cha)
 * để tránh React unmount/remount mỗi render → mất selectedId state.
 */
const NameSelectField = ({ configKey, currentName, onChange }: NameSelectFieldProps) => {
  const cfg = categoryConfigs[configKey];
  const [selectedId, setSelectedId] = useState('');

  // Reset selectedId khi form bị clear (create mode hoặc reset)
  useEffect(() => {
    if (!currentName) {
      setSelectedId('');
    }
  }, [currentName]);

  if (!cfg) {
    return (
      <PendingSelect
        value={currentName}
        onChange={onChange}
      />
    );
  }

  return (
    <GenericSearchSelect
      api={cfg.api}
      config={cfg}
      value={selectedId}
      displayValue={currentName}
      onChange={(id: string, item: any) => {
        const name = item?.name ?? id;
        setSelectedId(id);
        onChange(name);
      }}
    />
  );
};

export default NameSelectField;