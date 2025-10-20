# Hệ thống Quản lý Nhân sự (HR Management System)

Prototype frontend đầy đủ tính năng cho hệ thống quản lý nhân sự với 3 vai trò: Admin, Manager, và Employee.

## 🚀 Tính năng

### Quản lý theo vai trò
- **Admin**: Toàn quyền quản lý - xem tất cả dữ liệu, quản lý nhân viên, cơ cấu lương, sơ đồ tổ chức
- **Manager**: Quản lý team - xem dữ liệu team, phê duyệt đào tạo, báo cáo
- **Employee**: Xem và chỉnh sửa hồ sơ cá nhân, xem đào tạo được giao, tải phiếu lương

### Các module chính

#### 1. Dashboard
- Thống kê tổng quan (tổng nhân viên, tuyển dụng mới, nghỉ phép, hoàn thành đào tạo)
- Biểu đồ: Xu hướng nhân sự 12 tháng, phân bổ theo phòng ban, phân bổ theo bậc
- KPI cards với trend indicators
- Quick stats tổng hợp

#### 2. Quản lý nhân viên
- Danh sách đầy đủ với tìm kiếm, lọc (phòng ban, trạng thái)
- Hồ sơ chi tiết với tabs:
  - Thông tin cơ bản
  - Công việc (chức danh, phòng ban, quản lý)
  - **Lộ trình đào tạo & Bậc**: Timeline, progress, current grade, next requirements
  - Lương (summary, allowances)
  - Hồ sơ y tế (EHR-like/FHIR-like)
- Inline edit (theo quyền)

#### 3. Sơ đồ tổ chức
- Org chart tương tác với react-flow
- Hiển thị cấu trúc phòng ban, số lượng nhân viên
- Click node để xem chi tiết phòng ban
- Zoom, pan, expand/collapse

#### 4. Quản lý đào tạo
- Dashboard với tổng số khóa, đang diễn ra, hoàn thành, sắp tới
- Danh sách courses với:
  - Tiêu đề, mô tả, thời lượng
  - Required for grades
  - Completion rate, deadline
  - Trạng thái (Upcoming/Ongoing/Completed)
- Giao diện assign course (mock)

#### 5. Cơ cấu lương
- Salary structure builder
- 3 templates mẫu (G1, G2, G3)
- Chi tiết các pay items: earnings, deductions
- **Preview phiếu lương**: Chọn nhân viên, tính toán tự động, export PDF (mock)
- Calculation methods: Fixed, % of base, Formula

#### 6. Hồ sơ y tế (EHR-lite)
- FHIR-like structure:
  - Allergies
  - Conditions (ICD codes)
  - Immunizations (vaccine, date, provider)
  - Observations (vital signs, lab results)
  - Visits (timeline, diagnosis, notes)
- Privacy controls theo role

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Tailwind CSS
- **Components**: shadcn/ui
- **State Management**: Zustand
- **Charts**: Recharts
- **Org Chart**: @xyflow/react
- **Routing**: React Router v6
- **Build Tool**: Vite

## 📦 Cài đặt & Chạy

```bash
# Clone repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:8080`

## 🎭 Testing theo vai trò

Khi vào trang login, chọn một trong 3 vai trò:

### 1. Admin (Quản trị viên)
- Employee ID: `emp001` (Nguyễn Văn An - CEO)
- Quyền: Full access toàn bộ hệ thống

### 2. Manager (Quản lý)
- Employee ID: `emp002` (Trần Thị Bình - Trưởng phòng Kỹ thuật)
- Quyền: Quản lý team, view reports, assign training

### 3. Employee (Nhân viên)
- Employee ID: `emp005` (Hoàng Văn Em - Kỹ sư phần mềm)
- Quyền: View/edit profile cá nhân, view trainings

## 📁 Cấu trúc Project

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   └── Layout.tsx       # Main layout với navigation
├── mock/
│   └── data.ts          # Mock data (employees, departments, trainings, etc.)
├── pages/
│   ├── Login.tsx        # Role selection
│   ├── Dashboard.tsx    # Dashboard với charts & KPIs
│   ├── Employees.tsx    # Employee directory
│   ├── OrgChart.tsx     # Organization chart
│   ├── Training.tsx     # Training management
│   ├── Salary.tsx       # Salary structures & payslip
│   └── Profile.tsx      # Employee profile (tabbed)
├── store/
│   └── authStore.ts     # Zustand store cho authentication
├── App.tsx              # Routes & protected routes
└── main.tsx             # Entry point
```

## 📊 Mock Data

File `src/mock/data.ts` chứa tất cả dữ liệu mẫu:

- **10 employees** (4 departments, 3 grades)
- **4 departments** (HR, Kỹ thuật, Kinh doanh, Vận hành)
- **5 trainings** với các trạng thái khác nhau
- **3 salary structures** (theo grade G1, G2, G3)
- **10 medical records** (EHR-like/FHIR-like format)
- **3 grades** với salary ranges và requirements

## ✨ Tính năng nổi bật

### 1. Role-based Access Control
- UI tự động ẩn/hiện theo quyền
- Protected routes
- Data filtering theo role

### 2. Responsive Design
- Mobile, tablet, desktop friendly
- Tailwind CSS breakpoints
- Touch-friendly navigation

### 3. Accessibility
- ARIA labels
- Keyboard navigation
- Semantic HTML

### 4. Interactive Charts
- Line chart (headcount trend)
- Bar chart (department distribution)
- Pie chart (grade distribution)
- Responsive & animated

### 5. Org Chart
- Interactive drag/zoom
- Expandable nodes
- Department details on click

### 6. Training Progress Tracking
- Individual progress bars
- Completion rate
- Deadline indicators
- Required vs. completed

### 7. Salary Calculator
- Dynamic calculation
- Multiple pay items
- Preview payslip
- Export ready (print-friendly)

### 8. EHR Medical Records
- FHIR-like structure
- Privacy controls
- Visit timeline
- Lab results & observations

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6) - Professional
- **Success**: Green (#10B981) - Positive metrics
- **Warning**: Amber (#F59E0B) - Pending items
- **Destructive**: Red (#EF4444) - Critical actions

### Typography
- Clean, readable fonts
- Consistent sizing
- Proper hierarchy

### Components
- Card-based layouts
- Soft shadows
- Rounded corners (0.75rem)
- Smooth transitions

## 📝 Future Enhancements (Backend Integration)

Khi tích hợp backend, có thể thêm:

- Real-time notifications
- File upload thực tế
- Email/messaging
- Advanced search
- Bulk operations
- Audit logs
- API integration với ERP/HRIS
- SSO authentication
- Multi-language support

## 🔒 Security Notes

⚠️ **Đây là prototype frontend** - dữ liệu mock không có bảo mật thực tế.

Khi deploy production cần:
- Backend API với authentication
- Authorization middleware
- Data encryption
- HTTPS
- Input validation
- XSS/CSRF protection

## 📄 License

MIT License - Free to use and modify

---

**Developed with ❤️ using Lovable & React**
