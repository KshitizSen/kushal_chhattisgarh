# Kushal Chhattisgarh - Education/Vocational Management System

A multi-role web application for managing education and vocational training programs in Chhattisgarh.

## Features

- Three distinct user roles: Admin, Vocational Teacher Provider (VTP), Head Master/Principal
- Role-based access control
- Dashboard with analytics for each role
- Student, staff, and school management
- Course management for VTPs
- Responsive design with Tailwind CSS

## Tech Stack

- React (Vite)
- Tailwind CSS v3
- React Router v6
- Zustand (state management)
- React Hook Form + Zod (form validation)
- Axios (HTTP client)
- Lucide React (icons)
- React Hot Toast (notifications)
- Recharts (data visualization)

## Getting Started

1. Clone the repository
2. Run `npm install`
3. Create a `.env` file based on `.env.example`
4. Run `npm run dev` to start the development server

## Project Structure

```
src/
├── assets/           # Static assets
├── components/       # Reusable components
│   ├── charts/       # Chart components
│   ├── common/       # Common UI components
│   └── layout/       # Layout components
├── hooks/            # Custom hooks
├── pages/            # Page components
│   ├── admin/        # Admin pages
│   ├── auth/         # Authentication pages
│   ├── principal/    # Principal pages
│   └── vtp/          # VTP pages
├── routes/           # Routing configuration
├── services/         # API services
├── store/            # Zustand stores
├── utils/            # Utility functions
├── App.jsx           # Main application component
└── main.jsx          # Entry point
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build

## License

This project is licensed under the MIT License.
