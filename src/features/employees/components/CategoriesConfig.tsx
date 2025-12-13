import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { unitApi } from "@/features/departments/api/departmentApi";

const NameDescForm = ({ form, onChange }) => (
  <div className="space-y-2">
    <Label>Tên *</Label>
    <Input
      placeholder="Tên"
      value={form.name || ""}
      onChange={e => onChange("name", e.target.value)}
      required
    />
    <Label>Mô tả</Label>
    <Textarea
      placeholder="Mô tả"
      value={form.description || ""}
      onChange={e => onChange("description", e.target.value)}
    />
  </div>
);

const CodeNameForm = ({ form, onChange }) => (
  <div className="space-y-2">
    <Label>Mã *</Label>
    <Input
      placeholder="Mã"
      value={form.code || ""}
      onChange={e => onChange("code", e.target.value)}
      required
    />
    <Label>Tên *</Label>
    <Input
      placeholder="Tên"
      value={form.name || ""}
      onChange={e => onChange("name", e.target.value)}
      required
    />
  </div>
);

const CodeNameDescForm = ({ form, onChange }) => (
  <div className="space-y-3">
    <div>
      <Label>Mã *</Label>
      <Input
        placeholder="Nhập mã (tùy chọn)"
        value={form.code || ""}
        onChange={e => onChange("code", e.target.value)}
        required
      />
    </div>
    <div>
      <Label>Tên *</Label>
      <Input
        placeholder="Nhập tên"
        value={form.name || ""}
        onChange={e => onChange("name", e.target.value)}
        required
      />
    </div>
    <div>
      <Label>Mô tả</Label>
      <Textarea
        placeholder="Nhập mô tả"
        value={form.description || ""}
        onChange={e => onChange("description", e.target.value)}
        rows={3}
      />
    </div>
  </div>
);

// Form đặc biệt cho Department
const DepartmentForm = ({ form, onChange, departments = [], departmentTypes = [], loadingTypes = false }) => {
  return (
    <div className="space-y-3">
      <div>
        <Label>Tên phòng ban *</Label>
        <Input
          placeholder="Nhập tên phòng ban"
          value={form.name || ""}
          onChange={e => onChange("name", e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Mã phòng ban *</Label>
        <Input
          placeholder="Nhập mã phòng ban"
          value={form.code || ""}
          onChange={e => onChange("code", e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Loại phòng ban *</Label>
        <Select
          value={form.departmentTypeId || ""}
          onValueChange={v => onChange("departmentTypeId", v)}
          disabled={loadingTypes}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingTypes ? "Đang tải..." : "Chọn loại phòng ban"} />
          </SelectTrigger>
          <SelectContent>
            {departmentTypes.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground text-center">
                Không có loại phòng ban nào
              </div>
            ) : (
              departmentTypes.map(type => (
                <SelectItem key={type.id} value={String(type.id)}>
                  <div className="flex flex-col">
                    <span>{type.name}</span>
                    <span className="text-xs text-muted-foreground">{type.code}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {departmentTypes.length === 0 && !loadingTypes && (
          <p className="text-xs text-muted-foreground mt-1">
            Chưa có loại phòng ban. Vui lòng thêm loại phòng ban trong phần Danh mục.
          </p>
        )}
      </div>

      <div>
        <Label>Phòng ban gốc</Label>
        <Select
          value={form.parent || 'none'}
          onValueChange={v => onChange("parent", v === 'none' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn phòng ban gốc" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="italic text-muted-foreground">Không có (phòng ban gốc)</span>
            </SelectItem>
            {departments.map(d => (
              <SelectItem key={d.id} value={d.id.toString()}>
                <div className="flex flex-col">
                  <span>{d.name}</span>
                  {d.code && <span className="text-xs text-muted-foreground">{d.code}</span>}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

import { jobTitleApi } from "@/features/categories/api/categoriesApi";
import { degreeApi } from "@/features/categories/api/categoriesApi";
import { specialtyApi } from "@/features/categories/api/categoriesApi";
import { languageLevelApi } from "@/features/categories/api/categoriesApi";
import { politicalTheoryApi } from "@/features/categories/api/categoriesApi";
import { wardApi } from "@/features/categories/api/categoriesApi";
import { provinceCityApi } from "@/features/categories/api/categoriesApi";
import { ethnicityApi } from "@/features/categories/api/categoriesApi";
import { nationalityApi } from "@/features/categories/api/categoriesApi";
import { departmentTypeApi } from "@/features/departments/api/departmentTypeApi";


export const categoryConfigs = {
  jobTitle: {
    api: jobTitleApi,
    placeholder: "Chọn chức vụ",
    modalTitle: "Tạo chức vụ mới",
    FormComponent: CodeNameDescForm,
    defaultForm: { name: "", code: "", description: "" }
  },

  departmentType: {
    api: departmentTypeApi,
    placeholder: "Chọn loại phòng ban",
    modalTitle: "Tạo loại phòng ban",
    FormComponent: CodeNameDescForm,
    defaultForm: { name: "", code: "", description: "" }
  },

  degree: {
    api: degreeApi,
    placeholder: "Chọn bậc học",
    modalTitle: "Tạo bậc học",
    FormComponent: NameDescForm,
    defaultForm: { name: "", description: "" }
  },

  ethnicity: {
    api: ethnicityApi,
    placeholder: "Chọn dân tộc",
    modalTitle: "Tạo dân tộc",
    FormComponent: NameDescForm,
    defaultForm: { name: "", description: "" }
  },

  ward: {
    api: wardApi,
    placeholder: "Chọn phường/xã",
    modalTitle: "Tạo phường/xã",
    FormComponent: CodeNameForm,
    defaultForm: { name: "", code: "" }
  },

  provinceCity: {
    api: provinceCityApi,
    placeholder: "Chọn tỉnh/thành",
    modalTitle: "Tạo tỉnh/thành",
    FormComponent: CodeNameForm,
    defaultForm: { name: "", code: "" }
  },

  specialty: {
    api: specialtyApi,
    placeholder: "Chọn chuyên ngành",
    modalTitle: "Tạo chuyên ngành",
    FormComponent: CodeNameDescForm,
    defaultForm: { name: "", code: "", description: "" }
  },

  politicalTheory: {
    api: politicalTheoryApi,
    placeholder: "Chọn lý luận chính trị",
    modalTitle: "Tạo lý luận chính trị",
    FormComponent: NameDescForm,
    defaultForm: { name: "", description: "" }
  },

  languageLevel: {
    api: languageLevelApi,
    placeholder: "Chọn trình độ ngoại ngữ",
    modalTitle: "Tạo trình độ ngoại ngữ",
    FormComponent: NameDescForm,
    defaultForm: { name: "", description: "" }
  },

  nationality: {
    api: nationalityApi,
    placeholder: "Chọn quốc tịch",
    modalTitle: "Tạo quốc tịch",
    FormComponent: CodeNameForm,
    defaultForm: { name: "", code: "" }
  },

  department: {
    api: unitApi,
    placeholder: "Chọn phòng ban",
    modalTitle: "Tạo phòng ban",
    FormComponent: DepartmentForm,
    defaultForm: { name: "", code: "", departmentTypeId: "", parent: "" },

    // Custom transform để map payload đúng định dạng API
    transformPayload: (form) => {
      const payload: any = {
        company: { id: 2 },
        name: form.name?.trim() || "",
        departmentType: form.departmentTypeId ? { id: Number(form.departmentTypeId) } : null,
      };

      // Chỉ thêm code nếu có giá trị
      if (form.code?.trim()) {
        payload.code = form.code.trim();
      }

      // Chỉ thêm parent nếu có giá trị
      if (form.parent && form.parent !== 'none') {
        payload.parent = { id: Number(form.parent) };
      } else {
        payload.parent = null;
      }

      return payload;
    },

    // Validation đặc biệt cho department
    validate: (form) => {
      if (!form.name?.trim()) {
        return "Vui lòng nhập tên phòng ban";
      }
      if (!form.departmentTypeId) {
        return "Vui lòng chọn loại phòng ban";
      }
      return null;
    }
  }
};