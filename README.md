# ExpenseTracker

A modern, full-featured expense tracking application built with React, TypeScript, and Firebase. This project demonstrates best practices in modern web development, including responsive design, real-time data synchronization, and a clean, intuitive user interface.

## 🌟 Features

- **Account Management**

  - Multiple account types (Checking, Savings, Credit Card, Cash, Investment)
  - Real-time balance tracking
  - Account-specific transaction history
  - Custom account categories and metadata

- **Transaction Tracking**

  - Income and expense tracking
  - Category-based organization
  - Detailed transaction history
  - CSV export functionality
  - Advanced filtering and search capabilities

- **Budget Management**

  - Custom budget creation and tracking
  - Category-based budget allocation
  - Progress monitoring and alerts
  - Flexible budget periods (daily, weekly, monthly, yearly)

- **Analytics & Insights**

  - Spending trends visualization
  - Category-based analysis
  - Interactive charts and graphs
  - Monthly/yearly comparisons

- **User Experience**
  - Responsive design for all devices
  - Drag-and-drop interface
  - Dark/light theme support
  - Customizable dashboard
  - Intuitive navigation

## 🔧 Technology Stack

- **Frontend:**

  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
  - Framer Motion
  - Recharts
  - @dnd-kit for drag-and-drop

- **Authentication & Database:**

  - Firebase Authentication
  - Firestore
  - Real-time data sync

- **State Management & Routing:**

  - React Context
  - React Router v7

- **Testing & Quality:**
  - Vitest
  - Testing Library
  - ESLint
  - Prettier
  - Husky for pre-commit hooks

## 🚀 Getting Started

### Prerequisites

- Node.js 20.14.0 or higher
- pnpm 9.2.0 or higher
- Firebase account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/expense-tracker.git
   cd expense-tracker
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root directory with your Firebase configuration:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

### Development

- Run tests: `pnpm test`
- Run tests with UI: `pnpm test:ui`
- Check types: `pnpm type-check`
- Format code: `pnpm format`
- Lint code: `pnpm lint`

## 📱 Application Structure

```
src/
├── components/      # Reusable UI components
├── contexts/        # React Context providers
├── pages/          # Page components
├── services/       # API and business logic
├── types/          # TypeScript definitions
├── lib/            # Utility functions
└── config/         # Configuration files
```

## 🔒 Security

- Firebase Authentication for secure user management
- Firestore security rules for data protection
- Input validation and sanitization
- Secure password handling
- GDPR-compliant data management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Arshad Shah

- GitHub: [@arshad-shah](https://github.com/arshad-shah)
- LinkedIn: [arshadshah](https://www.linkedin.com/in/arshadshah)

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com)
- [Firebase](https://firebase.google.com)
- [React](https://reactjs.org)
- All other open-source libraries used in this project

---

⭐ If you found this project helpful, please consider giving it a star on GitHub!
