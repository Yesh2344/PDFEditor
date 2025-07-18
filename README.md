# Advanced PDF Editor

A professional-grade PDF editing tool with advanced text editing capabilities that rival Adobe Acrobat. Built with React, Node.js, and Python FastAPI, this application provides real-time PDF editing with sophisticated typography controls, layout tools, and professional editing features.

![PDF Editor Demo](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/React-18.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-16+-green)
![Python](https://img.shields.io/badge/Python-3.8+-yellow)
![FastAPI](https://img.shields.io/badge/FastAPI-0.68+-red)

## 🚀 Features
### Professional Text Editing
- **Advanced Typography**: 10+ professional fonts with full typography controls
- **Text Effects**: Shadows, outlines, gradients, glow effects
- **Formatting**: Bold, italic, underline, strikethrough, text alignment
- **Typography Features**: Small caps, all caps, opacity control
- **Style Presets**: Pre-defined styles (Headings, Body Text, Captions, Quotes)

### Layout & Design Tools
- **Multi-Column Layout**: Create 1-10 column text layouts
- **Grid System**: Professional grid with adjustable size (5-50px)
- **Snap to Grid**: Precise positioning and alignment
- **Visual Guides**: Alignment guides for professional layouts
- **Text Flow**: Auto-flow text between linked text boxes

### Professional Editing Tools
- **Undo/Redo**: Full editing history with keyboard shortcuts
- **Find & Replace**: Advanced search with regex support
- **Copy/Paste**: Clipboard integration
- **Text Selection**: Visual text selection with highlighting
- **Batch Operations**: Find and replace across entire document


### Real-time PDF Editing
- **Live Preview**: Real-time rendering of all changes
- **Element Selection**: Click to edit any text, image, or shape
- **Drag & Drop**: Move elements with precision
- **Multi-page Support**: Edit across multiple PDF pages
- **OCR Integration**: Extract text from scanned PDFs



## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern UI framework
- **PDF.js**: PDF rendering and manipulation
- **Canvas API**: Real-time drawing and editing
- **CSS3**: Advanced styling and animations

### Backend
- **Python FastAPI**: High-performance API framework
- **PyMuPDF**: Advanced PDF processing
- **Tesseract OCR**: Text extraction from scanned documents
- **LibreOffice**: Document conversion
- **Celery**: Asynchronous task processing
- **Redis**: Task queue management

### Additional Tools
- **Docker**: Containerization
- **qpdf**: PDF optimization
- **pypdf**: PDF manipulation


- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Docker** (optional, for containerized deployment)
- **Redis** (for task queue)
- **Tesseract OCR** (for text extraction)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/advanced-pdf-editor.git
cd advanced-pdf-editor
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../server
pip install -r requirements.txt
```

### 4. Set Up Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Redis Configuration
REDIS_URL=redis://localhost:6379

# File Upload Settings
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=uploads

# OCR Settings
TESSERACT_PATH=/usr/bin/tesseract

# LibreOffice Settings
LIBREOFFICE_PATH=/usr/bin/libreoffice
```

### 5. Start Redis (Required for async tasks)

```bash
# On Windows
redis-server

# On macOS
brew services start redis

# On Linux
sudo systemctl start redis
```

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the Backend Server**

```bash
cd server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. **Start the Frontend Development Server**

```bash
cd client
npm start
```

3. **Access the Application**

Open your browser and navigate to `http://localhost:3000`

### Production Mode

1. **Build the Frontend**

```bash
cd client
npm run build
```

2. **Start with Docker (Recommended)**

```bash
docker-compose up -d
```

## 📖 Usage Guide

### Getting Started

1. **Upload a PDF**: Click the "Upload PDF" tab and select your PDF file
2. **Enter Password**: If your PDF is encrypted, enter the password
3. **Start Editing**: Switch to the "Real-time Editor" tab to begin editing

### Text Editing

#### Basic Text Operations
- **Add Text**: Click anywhere on the canvas and type
- **Edit Text**: Click on any text element to edit it
- **Delete Text**: Select text and press Delete or use the delete button
- **Move Text**: Drag text elements to reposition them

#### Advanced Typography
- **Font Selection**: Choose from 10+ professional fonts
- **Text Effects**: Apply shadows, outlines, gradients, and glow
- **Formatting**: Use bold, italic, underline, and strikethrough
- **Alignment**: Left, center, or right align text
- **Opacity**: Adjust text transparency from 10% to 100%

#### Style Presets
- **Heading 1**: Large, bold text for main headings
- **Heading 2**: Medium, bold text for subheadings
- **Body Text**: Standard text formatting
- **Caption**: Small, italic text for captions
- **Quote**: Styled text for quotations

### Layout Tools

#### Grid System
- **Show Grid**: Toggle grid visibility
- **Snap to Grid**: Enable precise positioning
- **Grid Size**: Adjust grid spacing (5-50px)

#### Multi-Column Layout
- **Column Count**: Create 1-10 column layouts
- **Column Gap**: Adjust spacing between columns
- **Text Flow**: Auto-flow text between columns

### Professional Tools

#### Find & Replace
- **Find Text**: Search for specific text (Ctrl+F)
- **Replace Text**: Replace found text with new content
- **Case Sensitive**: Toggle case-sensitive search
- **Regex Support**: Use regular expressions for advanced search

#### Undo/Redo
- **Undo**: Revert last action (Ctrl+Z)
- **Redo**: Restore undone action (Ctrl+Y)
- **History**: Full editing history maintained

#### Copy/Paste
- **Copy**: Copy selected text (Ctrl+C)
- **Paste**: Paste clipboard content (Ctrl+V)
- **Clipboard**: System clipboard integration

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+C` | Copy |
| `Ctrl+V` | Paste |
| `Ctrl+F` | Find |
| `Ctrl+H` | Replace |
| `Delete` | Delete selected element |
| `Escape` | Clear selection |

## 🔧 Configuration

### Frontend Configuration

Edit `client/src/config.js`:

```javascript
export const CONFIG = {
  API_BASE_URL: 'http://localhost:8000',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FORMATS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
  DEFAULT_FONT_SIZE: 12,
  DEFAULT_FONT_FAMILY: 'Arial',
  GRID_SIZE: 10,
  ZOOM_LEVELS: [0.5, 0.75, 1, 1.25, 1.5, 2, 3]
};
```

### Backend Configuration

Edit `server/config.py`:

```python
class Settings:
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # File upload settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    
    # OCR settings
    TESSERACT_PATH: str = "/usr/bin/tesseract"
    
    # LibreOffice settings
    LIBREOFFICE_PATH: str = "/usr/bin/libreoffice"
```

## 🐳 Docker Deployment

### Using Docker Compose

1. **Build and Start Services**

```bash
docker-compose up -d
```

2. **Access the Application**

Navigate to `http://localhost:3000`

### Docker Configuration

The `docker-compose.yml` file includes:

- **Frontend**: React development server
- **Backend**: FastAPI application
- **Redis**: Task queue for async operations
- **Nginx**: Reverse proxy (production)

## 📁 Project Structure

```
advanced-pdf-editor/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── PDFEditor.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── README.md
├── server/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   └── services/
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## 🔍 API Documentation

### Endpoints

#### PDF Upload
```http
POST /api/pdf/upload
Content-Type: multipart/form-data

Parameters:
- file: PDF file
- password: Encryption password (optional)
```

#### Get PDF Elements
```http
GET /api/pdf/elements/{pdf_id}
```

#### Save Edited PDF
```http
POST /api/pdf/save-edited
Content-Type: multipart/form-data

Parameters:
- pdf_base64: Base64 encoded PDF
- modifications: JSON array of modifications
- password: Encryption password
```

#### Convert to PDF
```http
POST /api/pdf/convert
Content-Type: multipart/form-data

Parameters:
- file: Source file (Word, Excel, PowerPoint, etc.)
```

### Response Format

```json
{
  "success": true,
  "data": {
    "pdf_base64": "base64_encoded_pdf",
    "elements": {
      "pages": [
        {
          "textElements": [...],
          "imageElements": [...],
          "shapeElements": [...]
        }
      ]
    }
  },
  "message": "Operation completed successfully"
}
```

## 🧪 Testing

### Frontend Tests

```bash
cd client
npm test
```

### Backend Tests

```bash
cd server
pytest
```

### Integration Tests

```bash
npm run test:integration
```

## 🚀 Deployment

### Production Build

1. **Build Frontend**

```bash
cd client
npm run build
```

2. **Start Production Server**

```bash
cd server
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Environment Variables

Set the following environment variables for production:

```bash
export NODE_ENV=production
export REACT_APP_API_URL=https://your-api-domain.com
export PYTHON_ENV=production
export REDIS_URL=redis://your-redis-server:6379
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PDF.js**: For PDF rendering capabilities
- **PyMuPDF**: For advanced PDF processing
- **Tesseract OCR**: For text extraction from scanned documents
- **React**: For the modern UI framework
- **FastAPI**: For the high-performance API framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/advanced-pdf-editor/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

## 🔄 Changelog

### Version 1.0.0
- Initial release with basic PDF editing
- Real-time text editing capabilities
- Professional typography controls
- Advanced layout tools
- Find and replace functionality
- Undo/redo system
- Multi-page support
- OCR integration

---

**Made with ❤️ by [Your Name]**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/advanced-pdf-editor)](https://github.com/yourusername/advanced-pdf-editor/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/advanced-pdf-editor)](https://github.com/yourusername/advanced-pdf-editor/network)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/advanced-pdf-editor)](https://github.com/yourusername/advanced-pdf-editor/issues)
[![GitHub license](https://img.shields.io/github/license/yourusername/advanced-pdf-editor)](https://github.com/yourusername/advanced-pdf-editor/blob/main/LICENSE) "# PDFEditor" 
