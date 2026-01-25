# Comparator - Vulnerability Comparison Tool

A web-based tool for comparing vulnerability scans between different time periods.

## 🚀 Live Demo

Visit the live application at: [https://edeluz.github.io/comparator/](https://edeluz.github.io/comparator/)

## 📋 Features

- **Excel File Comparison**: Compare vulnerability scans between previous and current reports
- **Multiple Analysis Views**: New, remediated, persistent, and current vulnerabilities
- **Interactive Filters**: Filter by severity, region, market, category, and sub-category
- **Pivot Tables**: Analyze data by severity and region
- **Visual Charts**: Bar and pie charts for data visualization
- **Export Reports**: Download comprehensive Excel reports with all findings

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Libraries**: SheetJS (Excel parsing), Chart.js (Data visualization)
- **Deployment**: GitHub Pages

## 📁 Project Structure

```
comparator/
├── pages/                  # HTML pages
│   ├── index.html          # Main landing page
│   └── VulnerabilityComparatorV6.html  # Main application
├── src/                    # JavaScript modules
│   ├── utils.js            # Utility functions
│   ├── ui-components-v6.js # UI components
│   └── business-logic.js   # Business logic
├── styles/                 # CSS stylesheets
│   ├── main.css            # Main styles
│   ├── styles.css          # Application styles
│   └── app-styles.css      # Component styles
├── .github/workflows/      # GitHub Actions
│   └── deploy.yml          # Deployment workflow
├── CNAME                   # Custom domain configuration
└── README.md               # This file
```

## 🚀 Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions:

1. **Automatic Deployment**: Every push to `main` branch triggers deployment
2. **Custom Domain**: Configured for `edeluz.github.io/comparator/`
3. **Build Process**: Files are copied to `docs/` directory for GitHub Pages

### Manual Deployment Steps

1. Ensure your repository has GitHub Pages enabled
2. Go to Settings → Pages
3. Select "GitHub Actions" as the source
4. Push changes to trigger deployment

## 🎯 Usage

1. Open the application in your browser
2. Upload two Excel files (previous and current scans)
3. Choose comparison mode (global vulnerabilities or per-endpoint)
4. Click "Compare Files" to analyze
5. Apply filters to focus on specific data
6. View results in tables, charts, and pivot tables
7. Download the comprehensive report

## 📊 Supported File Formats

- Excel files (.xlsx, .xls)
- CSV files (.csv)

## 🔧 Development

To run locally:

1. Clone the repository
2. Open `pages/index.html` in your browser
3. Or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```

## 📝 License

This project is licensed under the ISC License.