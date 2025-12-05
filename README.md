# HR Management System - PM_QL_NHAN_SU

Quản lý Nhân sự hệ thống (HR Management System) được xây dựng với React + TypeScript, sử dụng Feature-based Architecture.

## 🏗️ Cấu Trúc Dự Án

```
src/
├── app/                          # App-level configuration
│   ├── App.tsx                  # Main app component
│   ├── providers/               # React providers (QueryClient, Toast, etc.)
│   └── routes/                  # Route definitions với lazy loading
│
├── features/                    # Feature modules (business domains)
│   ├── auth/                    # Authentication module
│   │   ├── api/                 # Auth API calls
│   │   ├── components/          # Auth-specific components (Login, NotFound)
│   │   ├── store/               # Auth Zustand store
│   │   ├── types/               # Auth TypeScript types
│   │   └── index.ts             # Feature exports
│   │
│   ├── dashboard/               # Dashboard module
│   │   └── pages/               # Dashboard pages
│   │       ├── admin/           # Admin dashboard
│   │       └── manager/         # Manager dashboard
│   │
│   ├── employees/               # Employee management module
│   │   ├── api/                 # Employee API
│   │   ├── store/               # Employee Zustand store
│   │   ├── types/               # Employee types
│   │   ├── pages/               # Employee pages
│   │   │   ├── admin/           # Admin views
│   │   │   ├── manager/         # Manager views
│   │   │   └── employee/        # Employee views
│   │   └── index.ts
│   │
│   ├── training/                # Training module
│   ├── salary/                  # Salary/Payroll module
│   ├── departments/             # Departments module
│   ├── medical/                 # Medical records module
│   ├── safety/                  # Safety equipment module
│   ├── performance/            # Performance reviews module
│   ├── schedule/                # Work schedule module
│   └── reports/                 # Reports module
│
├── shared/                      # Shared across features
│   ├── components/             # Reusable components
│   │   ├── ui/                 # shadcn components (49 files)
│   │   ├── layouts/            # Layout components
│   │   └── forms/              # Form components
│   ├── hooks/                  # Shared custom hooks
│   ├── types/                  # Shared types
│   ├── constants/              # App constants
│   └── config/                 # App configuration
│
├── lib/                         # Third-party library configurations
│   ├── axios.ts                # Axios instance
│   ├── react-query.ts          # React Query setup
│   └── utils.ts                # Utility functions
│
├── assets/                      # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
└── mock/                        # Mock data
    └── data.ts
```

## 🎯 Các Feature Modules

Mỗi feature module có cấu trúc:
- `api/` - API calls (axios)
- `store/` - Zustand store
- `types/` - TypeScript types
- `pages/` - Pages/components
- `index.ts` - Exports

### Features Available
1. **auth** - Authentication & Authorization
2. **dashboard** - Dashboard tổng quan (Admin & Manager)
3. **employees** - Employee management
4. **training** - Training programs
5. **salary** - Salary & Payroll
6. **departments** - Department management
7. **medical** - Medical records
8. **safety** - Safety equipment
9. **performance** - Performance reviews
10. **schedule** - Work schedule
11. **reports** - Reports & Analytics

## 🛠️ Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **React Query** - Data fetching
- **React Router** - Routing
- **Axios** - HTTP client
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Project URLs

**Production URL**: https://lovable.dev/projects/0803d892-8676-4b67-97ba-729e159d2758

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0803d892-8676-4b67-97ba-729e159d2758) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/0803d892-8676-4b67-97ba-729e159d2758) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
