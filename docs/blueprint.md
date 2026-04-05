# **App Name**: LiveBus

## Core Features:

- User Authentication & Role-Based Routing: Secure login functionality using Firebase Auth with email/password. After successful login, users are automatically redirected to either the Driver or User dashboard based on their role stored in Firestore.
- Driver GPS Tracking: Drivers can start and stop GPS tracking from their dashboard. When active, the app pushes the driver's current latitude, longitude, and timestamp to Firestore every 4 seconds.
- Live Bus Location Display (User): Users view an interactive Google Map displaying live bus locations. They can select a specific bus from a dropdown menu, and the map marker for that bus updates in real-time as its location changes in Firestore.
- Real-time Data Sync with Firestore: Utilizes Firestore's real-time capabilities to push driver location updates and to listen for changes on the user dashboard, ensuring immediate display of bus movements.
- Persistent User & Role Management: Stores user roles (driver or user) in a Firestore 'users' collection, allowing for persistent role assignment and retrieval upon login.

## Style Guidelines:

- Color scheme: Light. Inspired by functionality and reliable public service.
- Primary color: A clear and trustworthy blue for main calls to action and interactive elements. Hex: #2563EB (HSL: 221, 84%, 54%).
- Background color: A very light, almost neutral blue-grey, maintaining visual tranquility and focusing on content. Hex: #F5F7FA (HSL: 221, 15%, 96%).
- Accent color: A lively, pastel purple to highlight secondary interactive elements or status. This creates a balanced, professional contrast with the primary blue. Hex: #A78CFC (HSL: 251, 40%, 75%).
- Semantic colors: Use a vibrant green (e.g., #16A34A) for 'tracking active' states and a contrasting red (e.g., #DC2626) for 'tracking stopped' or error states, following existing design cues for clear functional feedback.
- Headline and Body text font: 'Inter', a modern grotesque sans-serif, for objective clarity and excellent readability across all UI elements.
- Minimalist and intuitive SVG icons for key actions like login, start/stop tracking, and the bus marker on the map, ensuring universal recognition.
- Clean, adaptive dashboard layouts prioritizing clear presentation of real-time data for both drivers and users. Focus on spatial arrangement that guides the eye efficiently to the most critical information, such as the map and status indicators.
- Subtle and functional animations, such as smooth transitions for map marker movements and state changes on buttons (e.g., tracking active/inactive), to enhance user experience without distraction.