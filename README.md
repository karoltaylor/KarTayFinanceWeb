# KarTay React Web - Finance Manager

A modern, fully-featured Finance Manager application built with React, featuring multi-provider authentication (Google, Facebook, GitHub) and best practices.

## 🚀 Quick Start

### Prerequisites

Before running the app, you need to set up Firebase Authentication:

1. **Follow the setup guide**: See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions
2. **Create `.env` file**: Copy `.env.example` and add your Firebase credentials
3. **Enable auth providers**: Enable Google, Facebook, and GitHub in Firebase Console

### Development Server

The server is currently running! Open your browser to:

**http://localhost:3000**

You'll see the login page. Sign in with Google, Facebook, or GitHub to access the Finance Manager.

### Available Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
KarTayReactWeb/
├── src/
│   ├── main.jsx                    # Application entry point
│   ├── App.jsx                     # Root component
│   ├── index.css                   # Global styles
│   └── pages/
│       └── FinanceManager/         # Finance Manager application
│           ├── FinanceManager.jsx  # Main container
│           ├── components/         # UI components (10 components)
│           ├── utils/              # Utility functions
│           ├── constants/          # Constants
│           └── sampleData/         # Sample CSV/JSON files
│
├── index.html                      # HTML template
├── vite.config.js                  # Vite configuration
└── package.json                    # Dependencies

```

## ✨ Features

### Authentication
- **Multi-Provider Login** - Sign in with Google, Facebook, or GitHub
- **Secure Authentication** - Powered by Firebase Authentication
- **Persistent Sessions** - Stay logged in across browser restarts
- **User Profile** - Display user info with logout functionality

### Finance Management
- **Multi-Wallet Management** - Create and manage multiple wallets
- **Transaction Import** - Upload CSV or JSON files
- **Statistics Dashboard** - View income, expenses, and balances
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Clean, intuitive interface with smooth transitions

## 🎯 How to Use

1. **Server is running** at http://localhost:3000
2. **Create wallets** using the "Add Wallet" button in the sidebar
3. **Upload transactions** using the sample files in:
   - `src/pages/FinanceManager/sampleData/transactions-sample.csv`
   - `src/pages/FinanceManager/sampleData/transactions-sample.json`
4. **View statistics** by selecting individual wallets or "All Wallets Summary"

## 📊 Sample Data Format

### CSV Format:
```csv
date,description,amount,category
2024-01-15,Grocery Shopping,-85.42,Food & Dining
2024-01-16,Monthly Salary,3500.00,Income
```

### JSON Format:
```json
[
  {
    "date": "2024-01-15",
    "description": "Grocery Shopping",
    "amount": -85.42,
    "category": "Food & Dining"
  }
]
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Firebase Authentication** - Multi-provider auth (Google, Facebook, GitHub)
- **CSS Modules** - Scoped component styles
- **Lucide React** - Icon library
- **Context API** - State management for authentication

## 📖 Documentation

Detailed documentation available in:
- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Complete Firebase authentication setup guide
- `src/pages/FinanceManager/README.md` - Finance Manager features and usage
- `src/pages/FinanceManager/ARCHITECTURE.md` - Technical architecture details
- `src/pages/FinanceManager/SETUP.md` - Component setup instructions

## 🎨 Best Practices Implemented

✅ Separation of concerns (HTML/CSS/JS in separate files)  
✅ Component modularity and reusability  
✅ CSS Modules for scoped styling  
✅ Utility functions for business logic  
✅ Constants for configuration  
✅ Comprehensive documentation  
✅ Responsive design  
✅ Accessibility features  

## 🔧 Development

### Installing New Dependencies
```bash
npm install package-name
```

### Building for Production
```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

## 📝 Notes

- Hot Module Replacement (HMR) is enabled - changes reflect instantly
- CSS Modules are automatically supported (use `.module.css` extension)
- The dev server runs on port 3000 by default

## 🐛 Troubleshooting

### Port already in use
Edit `vite.config.js` and change the port:
```javascript
server: {
  port: 3001,  // Change to any available port
}
```

### Module not found errors
Make sure all dependencies are installed:
```bash
npm install
```

## 🎉 Enjoy!

Your Finance Manager is ready to use. Open http://localhost:3000 and start managing your finances!
