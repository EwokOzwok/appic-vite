# APPIC Site Recommender

A modern web application designed to help doctoral students find the best APPIC internship sites using advanced similarity algorithms and collaborative filtering.

## 🎓 About

The APPIC Site Recommender helps psychology doctoral students identify internship sites that match their preferences. Using a cosine similarity algorithm, the app analyzes site characteristics to recommend similar programs. The system also incorporates collaborative filtering—if previous users searched sites 1, 2, 3, 4, and 5, and you search sites 3, 4, and 5, the app will suggest sites 1 and 2 as potential matches.

**Access the app for free at: [https://appicrecommender.com](https://appicrecommender.com)**

## ✨ Features

- **Smart Recommendations**: Cosine similarity algorithm analyzes multiple site characteristics
- **Collaborative Filtering**: Learn from other users' site selections
- **Interactive Map**: Visualize all APPIC sites or filter to show only your recommendations
- **Advanced Filtering**: Filter by program type (Clinical, Counseling, School), degree type (PhD, PsyD, EdD), and site type (VAMC, UCC, Consortia, etc.)
- **Export Results**: Download your recommendations as CSV for easy reference
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## 🚀 Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
```bash
   git clone https://github.com/yourusername/appic-recommender.git
   cd appic-recommender
```

2. **Install dependencies**
```bash
   npm install
```

3. **Start the development server**
```bash
   npm run dev
```

4. **Build for production**
```bash
   npm run build
```

> **Note**: This repository contains only the frontend application. The backend recommendation service is hosted separately and not included in this public repository.

## 📖 Usage

1. **Configure Your Search**
   - Select your program type (Clinical, Counseling, or School)
   - Choose your degree type (PhD, PsyD, or EdD)
   - Optionally filter by site type (VAMC, UCC, Community Mental Health, etc.)

2. **Select Sites**
   - Choose at least 2 sites you're interested in
   - Use the search box to quickly find specific programs
   - Selected sites appear as pills above the list for easy reference

3. **Get Recommendations**
   - Toggle "Include User Recommendations" to enable collaborative filtering
   - Click "Get Site Recommendations!" to receive your personalized matches

4. **Explore Results**
   - View your top 10 recommended sites in a sortable table
   - Download results as CSV for further analysis
   - Switch to the Map tab to visualize site locations

## 🗺️ Map Features

- **Interactive Visualization**: See all APPIC sites plotted on an interactive map
- **Filter by Recommendations**: Toggle to show only your recommended sites
- **Site Details**: Click markers to view program information, locations, and application deadlines
- **Direct Links**: Access program websites directly from map popups

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Mapping**: Leaflet, React Leaflet
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 📊 Data

The app uses APPIC directory data including:
- Site information and characteristics
- Geographic coordinates for mapping
- Program types and degree requirements
- Application deadlines and contact information

## 🤝 Contributing

Contributions are welcome! Please reach out via email before submitting pull requests to discuss proposed changes.

## 📄 License

This project is licensed under the Apache License 2.0.

## 👨‍💻 Author

Created by **Evan E. Ozmat**

## 📧 Contact

For questions, feedback, or support:
- **Email**: eozmat@albany.edu

## 💖 Support

If you find this tool helpful, consider supporting the project:

[☕ Buy Me A Coffee](https://buymeacoffee.com/evanozmat)

---

**Free for all doctoral students** — Made possible by our sponsors at CliniciansFirst