import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const PDFEditor = () => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [encryptedData, setEncryptedData] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [editText, setEditText] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  
  // Real-time editing states
  const [pdfPages, setPdfPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [textElements, setTextElements] = useState([]);
  const [imageElements, setImageElements] = useState([]);
  const [shapeElements, setShapeElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasScale, setCanvasScale] = useState(1);
  const canvasRef = useRef(null);
  const [showTextToolbar, setShowTextToolbar] = useState(false);
  
  // Advanced Text Editing States
  const [textStyle, setTextStyle] = useState({
    fontSize: 12,
    fontFamily: 'Arial',
    color: '#000000',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    textAlign: 'left',
    lineHeight: 1.2,
    letterSpacing: 0,
    textTransform: 'none',
    textDecoration: 'none',
    opacity: 1,
    shadow: false,
    shadowColor: '#000000',
    shadowBlur: 2,
    shadowOffsetX: 1,
    shadowOffsetY: 1
  });

  // Advanced Layout States
  const [textFlow, setTextFlow] = useState({
    columns: 1,
    columnGap: 20,
    textWrap: 'normal',
    overflow: 'visible',
    wordBreak: 'normal',
    whiteSpace: 'normal'
  });

  // Advanced Editing States
  const [modifications, setModifications] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pdfPageRendered, setPdfPageRendered] = useState(false);
  const [textCursor, setTextCursor] = useState({ x: 0, y: 0, visible: false });
  const [textSelection, setTextSelection] = useState({ start: 0, end: 0 });
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [clipboard, setClipboard] = useState('');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [findResults, setFindResults] = useState([]);
  const [currentFindIndex, setCurrentFindIndex] = useState(0);

  // Advanced Typography States
  const [fontLibrary, setFontLibrary] = useState([
    { name: 'Arial', category: 'Sans-serif' },
    { name: 'Helvetica', category: 'Sans-serif' },
    { name: 'Times New Roman', category: 'Serif' },
    { name: 'Georgia', category: 'Serif' },
    { name: 'Courier New', category: 'Monospace' },
    { name: 'Verdana', category: 'Sans-serif' },
    { name: 'Tahoma', category: 'Sans-serif' },
    { name: 'Trebuchet MS', category: 'Sans-serif' },
    { name: 'Impact', category: 'Display' },
    { name: 'Comic Sans MS', category: 'Display' }
  ]);

  // Advanced Text Effects States
  const [textEffects, setTextEffects] = useState({
    gradient: false,
    gradientColors: ['#ff0000', '#0000ff'],
    outline: false,
    outlineColor: '#000000',
    outlineWidth: 1,
    glow: false,
    glowColor: '#ffff00',
    glowBlur: 5,
    emboss: false,
    embossDepth: 2,
    embossDirection: 45
  });

  // Advanced Layout Tools States
  const [layoutTools, setLayoutTools] = useState({
    showGrid: false,
    gridSize: 10,
    snapToGrid: false,
    showRulers: false,
    showGuides: false,
    guides: [],
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    pageSize: { width: 595, height: 842 }
  });

  // Advanced Search and Replace States
  const [searchOptions, setSearchOptions] = useState({
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
    searchInSelection: false
  });

  // Advanced Text Flow States
  const [textFlowSettings, setTextFlowSettings] = useState({
    autoFlow: false,
    flowDirection: 'left-to-right',
    textBoxes: [],
    linkedTextBoxes: [],
    overflowHandling: 'expand'
  });

  // Advanced Typography Controls
  const [typographySettings, setTypographySettings] = useState({
    kerning: 'auto',
    ligatures: true,
    oldStyleFigures: false,
    smallCaps: false,
    allCaps: false,
    baselineShift: 0,
    horizontalScale: 100,
    verticalScale: 100,
    tracking: 0
  });

  // Advanced Text Styles Presets
  const [textStylePresets, setTextStylePresets] = useState([
    { name: 'Heading 1', style: { fontSize: 24, bold: true, fontFamily: 'Arial' } },
    { name: 'Heading 2', style: { fontSize: 18, bold: true, fontFamily: 'Arial' } },
    { name: 'Body Text', style: { fontSize: 12, fontFamily: 'Arial' } },
    { name: 'Caption', style: { fontSize: 10, italic: true, fontFamily: 'Arial' } },
    { name: 'Quote', style: { fontSize: 14, italic: true, fontFamily: 'Georgia', color: '#666666' } }
  ]);

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      await uploadAndProcessFile(selectedFile);
    }
  };
  const uploadAndProcessFile = async (file) => {
    setIsProcessing(true);
    console.log('Uploading file:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password || 'defaultpassword');

    try {
      console.log('Sending request to:', 'http://localhost:8000/api/pdf/upload');
      const response = await fetch('http://localhost:8000/api/pdf/upload', {
        method: 'POST',
        body: formData
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
      if (result.success) {
        console.log('PDF uploaded successfully');
        console.log('Elements data:', result.elements);
        
        // Store PDF data as base64
        setEncryptedData({ data: result.pdf_base64});
        setPdfPages(result.elements.pages || []);
        setTextElements([]);
        setImageElements([]);
        setShapeElements([]);
        setModifications([]);
        setActiveTab('realtime');
        alert('PDF uploaded successfully! You can now edit it in real-time.');
      } else {
        console.error('Upload failed:', result);
        alert('Error: ' + (result.detail || result.error));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file:' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEncrypt = async () => {
    if (!file || !password) {
      alert('Please select a file and enter a password');
      return;
    }

    await uploadAndProcessFile(file);
  };

  const handleDownload = () => {
    if (!encryptedData) {
      alert('No file to download');
      return;
    }

    // Convert encrypted data back to blob and download
    const encryptedBuffer = Buffer.from(encryptedData.data, 'hex');
    const blob = new Blob([encryptedBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edited_${file?.name || 'document'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveEditedPDF = async () => {
    if (!encryptedData || !password) {
      alert('Please provide encrypted data and password');
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('pdf_base64', encryptedData.data);
      formData.append('modifications', JSON.stringify(modifications));
      formData.append('password', password);

      const response = await fetch('http://localhost:8000/api/pdf/save-edited', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        setEncryptedData({ data: result.pdf_base64});
        setPdfPages(result.elements.pages || []);
        setModifications([]);
        alert('PDF saved successfully!');
      } else {
        alert('Error saving PDF: ' + result.detail || result.error);
      }
    } catch (error) {
      alert('Error saving PDF:' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Real-time editing functions
  // Advanced Text Editing Functions
  
  // Function to add text element with advanced features
  const addTextElement = () => {
    if (!editText.trim()) return;
    
    // Check if we're editing an existing element
    if (selectedElement) {
      editExistingText(selectedElement, editText);
      setEditText('');
      setShowTextToolbar(false);
      setSelectedElement(null);
      return;
    }
    
    const newElement = {
      id: Date.now(),
      type: 'text',
      content: editText,
      x: textPosition.x,
      y: textPosition.y,
      style: {...textStyle},
      flow: {...textFlow},
      effects: {...textEffects},
      typography: {...typographySettings},
      pageIndex: currentPage,
      isEditable: true,
      textBox: {
        width: 200,
        height: 'auto',
        padding: { top: 5, right: 5, bottom: 5, left: 5 },
        border: { width: 0, color: 'transparent', style: 'solid' },
        background: 'transparent'
      }
    };
    
    // Check for duplicates at the same position
    const isDuplicate = textElements.some(el => 
      el.x === textPosition.x && 
      el.y === textPosition.y && 
      el.content === editText
    );
    
    if (!isDuplicate) {
      // Save to undo stack
      setUndoStack(prev => [...prev, { type: 'add-text', element: newElement }]);
      setRedoStack([]);
      
      setTextElements(prev => [...prev, newElement]);
      setModifications(prev => [...prev, {
        type: 'text',
        pageIndex: currentPage,
        content: editText,
        x: textPosition.x,
        y: textPosition.y,
        style: textStyle,
        flow: textFlow,
        effects: textEffects,
        typography: typographySettings
      }]);
    }
    
    setEditText('');
    setShowTextToolbar(false);
  };

  // Advanced text flow functions
  const createTextBox = (x, y, width, height) => {
    const textBox = {
      id: Date.now(),
      x, y, width, height,
      content: '',
      style: {...textStyle},
      flow: {...textFlow},
      linkedTo: null
    };
    
    setTextFlowSettings(prev => ({
      ...prev,
      textBoxes: [...prev.textBoxes, textBox]
    }));
    
    return textBox;
  };

  const linkTextBoxes = (box1Id, box2Id) => {
    setTextFlowSettings(prev => ({
      ...prev,
      linkedTextBoxes: [...prev.linkedTextBoxes, { from: box1Id, to: box2Id }]
    }));
  };

  const autoFlowText = (text, textBoxes) => {
    let remainingText = text;
    const flowedText = [];
    
    for (const box of textBoxes) {
      if (remainingText.length === 0) break;
      
      // Calculate how much text fits in this box
      const words = remainingText.split(' ');
      let fittedText = '';
      let wordCount = 0;
      
      for (const word of words) {
        const testText = fittedText + (fittedText ? ' ' : '') + word;
        // This is a simplified calculation - in a real implementation,
        // you'd measure actual text dimensions
        if (testText.length * (textStyle.fontSize / 2) <= box.width) {
          fittedText = testText;
          wordCount++;
        } else {
          break;
        }
      }
      
      flowedText.push({ boxId: box.id, text: fittedText });
      remainingText = words.slice(wordCount).join(' ');
    }
    
    return flowedText;
  };

  // Advanced typography functions
  const applyTypographySettings = (text, settings) => {
    let processedText = text;
    
    if (settings.smallCaps) {
      processedText = processedText.toUpperCase();
    }
    
    if (settings.allCaps) {
      processedText = processedText.toUpperCase();
    }
    
    return processedText;
  };

  // Advanced text effects functions
  const applyTextEffects = (ctx, text, x, y, effects) => {
    if (effects.outline) {
      ctx.strokeStyle = effects.outlineColor;
      ctx.lineWidth = effects.outlineWidth;
      ctx.strokeText(text, x, y);
    }
    
    if (effects.glow) {
      ctx.shadowColor = effects.glowColor;
      ctx.shadowBlur = effects.glowBlur;
      ctx.fillText(text, x, y);
      ctx.shadowBlur = 0;
    }
    
    if (effects.gradient) {
      const gradient = ctx.createLinearGradient(x, y, x + 200, y);
      gradient.addColorStop(0, effects.gradientColors[0]);
      gradient.addColorStop(1, effects.gradientColors[1]);
      ctx.fillStyle = gradient;
      ctx.fillText(text, x, y);
    }
  };

  // Advanced search and replace functions
  const findTextInDocument = (searchText, options = {}) => {
    const results = [];
    const allTextElements = [...textElements];
    
    allTextElements.forEach((element, elementIndex) => {
      const text = element.content;
      let searchRegex;
      
      if (options.useRegex) {
        try {
          searchRegex = new RegExp(searchText, options.caseSensitive ? 'g' : 'gi');
        } catch (e) {
          return; // Invalid regex
        }
      } else {
        const flags = options.caseSensitive ? 'g' : 'gi';
        searchRegex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      }
      
      let match;
      while ((match = searchRegex.exec(text)) !== null) {
        results.push({
          elementId: element.id,
          elementIndex,
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          pageIndex: element.pageIndex
        });
      }
    });
    
    setFindResults(results);
    setCurrentFindIndex(0);
    return results;
  };

  const replaceTextInDocument = (searchText, replaceText, options = {}) => {
    const results = findTextInDocument(searchText, options);
    
    results.forEach(result => {
      const element = textElements.find(el => el.id === result.elementId);
      if (element) {
        const newContent = element.content.replace(
          new RegExp(searchText, options.caseSensitive ? 'g' : 'gi'),
          replaceText
        );
        editExistingText(result.elementId, newContent);
      }
    });
    
    return results.length;
  };

  // Advanced undo/redo functions
  const undo = () => {
    if (undoStack.length === 0) return;
    
    const lastAction = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, lastAction]);
    setUndoStack(prev => prev.slice(0, -1));
    
    switch (lastAction.type) {
      case 'add-text':
        setTextElements(prev => prev.filter(el => el.id !== lastAction.element.id));
        break;
      case 'edit-text':
        // Restore previous text content
        break;
      case 'delete-text':
        setTextElements(prev => [...prev, lastAction.element]);
        break;
      default:
        break;
    }
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    
    const nextAction = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, nextAction]);
    setRedoStack(prev => prev.slice(0, -1));
    
    switch (nextAction.type) {
      case 'add-text':
        setTextElements(prev => [...prev, nextAction.element]);
        break;
      case 'edit-text':
        // Apply the edit
        break;
      case 'delete-text':
        setTextElements(prev => prev.filter(el => el.id !== nextAction.element.id));
        break;
      default:
        break;
    }
  };

  // Advanced clipboard functions
  const copyToClipboard = (text) => {
    setClipboard(text);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  const pasteFromClipboard = async () => {
    if (navigator.clipboard) {
      try {
        const text = await navigator.clipboard.readText();
        setEditText(text);
      } catch (error) {
        setEditText(clipboard);
      }
    } else {
      setEditText(clipboard);
    }
  };

  // Advanced text selection functions
  const selectText = (elementId, start, end) => {
    setTextSelection({ elementId, start, end });
    setTextCursor({ x: 0, y: 0, visible: true });
  };

  const clearSelection = () => {
    setTextSelection({ start: 0, end: 0 });
    setTextCursor({ x: 0, y: 0, visible: false });
  };

  // Advanced text style presets
  const applyTextStylePreset = (presetName) => {
    const preset = textStylePresets.find(p => p.name === presetName);
    if (preset) {
      setTextStyle(prev => ({ ...prev, ...preset.style }));
    }
  };

  const saveTextStylePreset = (name, style) => {
    setTextStylePresets(prev => [...prev, { name, style }]);
  };

  const addImageElement = (imageFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newElement = {
        id: Date.now(),
        type: 'image',
        src: e.target.result,
        x: textPosition.x,
        y: textPosition.y,
        width: 200,
        height: 150
      };
      
      setImageElements([...imageElements, newElement]);
      setModifications([...modifications, {
        type: 'image',
        pageIndex: currentPage,
        src: e.target.result,
        x: textPosition.x,
        y: textPosition.y,
        width: 200,
        height: 150
      }]);
    };
    reader.readAsDataURL(imageFile);
  };

  const addShapeElement = (shapeType) => {
    const newElement = {
      id: Date.now(),
      type: 'shape',
      shapeType: shapeType,
      x: textPosition.x,
      y: textPosition.y,
      width: 10,
      height: 100,
      color: textStyle.color
    };
    
    setShapeElements([...shapeElements, newElement]);
    setModifications([...modifications, {
      type: 'shape',
      pageIndex: currentPage,
      shapeType: shapeType,
      x: textPosition.x,
      y: textPosition.y,
      width: 10,
      height: 100,
      color: textStyle.color
    }]);
  };

  // Function to edit existing text element
  const editExistingText = (elementId, newContent) => {
    console.log('Editing text element:', elementId, 'to:', newContent);
    setTextElements(prev => 
      prev.map(el => 
        el.id === elementId ? { ...el, content: newContent } : el
      )
    );
    
    // Add to modifications
    setModifications(prev => {
      const existingMod = prev.find(m => m.id === elementId);
      if (existingMod) {
        return prev.map(m => m.id === elementId ? { ...m, content: newContent } : m);
      } else {
        return [...prev, {
          id: elementId,
          type: 'edit-text',
          pageIndex: currentPage,
          content: newContent
        }];
      }
    });
  };

  // Function to insert text at cursor position
  const insertTextAtPosition = (x, y, text) => {
    const newElement = {
      id: Date.now(),
      type: 'text',
      content: text,
      x: x,
      y: y,
      style: {...textStyle},
      pageIndex: currentPage,
      isEditable: true
    };
    
    setTextElements(prev => [...prev, newElement]);
    setModifications(prev => [...prev, {
      type: 'insert-text',
      pageIndex: currentPage,
      content: text,
      x: x,
      y: y,
      fontSize: textStyle.fontSize,
      color: textStyle.color
    }]);
  };

  // Function to delete text element
  const deleteTextElement = (elementId) => {
    console.log('Deleting text element:', elementId);
    setTextElements(prev => prev.filter(el => el.id !== elementId));
    setModifications(prev => [...prev, {
      id: elementId,
      type: 'delete-text',
      pageIndex: currentPage
    }]);
    setSelectedElement(null);
    setShowTextToolbar(false);
  };

  // Function to replace text element
  const replaceTextElement = (elementId, newText) => {
    console.log('Replacing text element:', elementId, 'with:', newText);
    setTextElements(prev => 
      prev.map(el => 
        el.id === elementId ? { ...el, content: newText } : el
      )
    );
    
    setModifications(prev => [...prev, {
      id: elementId,
      type: 'replace-text',
      pageIndex: currentPage,
      content: newText
    }]);
  };

  // Function to start inline text editing
  const startTextEditing = (elementId) => {
    const element = textElements.find(el => el.id === elementId);
    if (element) {
      setEditText(element.content);
      setSelectedElement(elementId);
      setShowTextToolbar(true);
    }
  };

  // Function to finish inline text editing
  const finishTextEditing = () => {
    if (selectedElement && editText.trim()) {
      editExistingText(selectedElement, editText);
    }
    setEditText('');
    setShowTextToolbar(false);
    setSelectedElement(null);
  };

  // Function to edit existing image element
  const editExistingImage = (elementId, newImageFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageElements(prev => 
        prev.map(el => 
          el.id === elementId ? { ...el, src: e.target.result } : el
        )
      );
      
      setModifications(prev => {
        const existingMod = prev.find(m => m.id === elementId);
        if (existingMod) {
          return prev.map(m => m.id === elementId ? { ...m, src: e.target.result } : m);
        } else {
          return [...prev, {
            id: elementId,
            type: 'edit-image',
            pageIndex: currentPage,
            src: e.target.result
          }];
        }
      });
    };
    reader.readAsDataURL(newImageFile);
  };

  // Function to edit existing shape element
  const editExistingShape = (elementId, newProperties) => {
    setShapeElements(prev => 
      prev.map(el => 
        el.id === elementId ? { ...el, ...newProperties } : el
      )
    );
    
    setModifications(prev => {
      const existingMod = prev.find(m => m.id === elementId);
      if (existingMod) {
        return prev.map(m => m.id === elementId ? { ...m, ...newProperties } : m);
      } else {
        return [...prev, {
          id: elementId,
          type: 'edit-shape',
          pageIndex: currentPage,
          ...newProperties
        }];
      }
    });
  };

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;
    
    console.log('Canvas clicked at:', x, y);
    console.log('Available text elements:', textElements.length);
    
    // Check if clicking on an existing element
    const allElements = [...textElements, ...imageElements, ...shapeElements];
    let clickedElement = null;
    
    // First check text elements with better detection
    for (const el of textElements) {
      const textWidth = 200; // Wider click area for text
      const textHeight = el.style?.fontSize || el.fontSize || 12;
      const isClicked = x >= el.x - 5 && x <= el.x + textWidth + 5 && 
                       y >= el.y - textHeight - 5 && y <= el.y + 5;
      
      console.log(`Checking text "${el.content}" at (${el.x}, ${el.y}): clicked=${isClicked}`);
      
      if (isClicked) {
        clickedElement = el;
        break;
      }
    }
    
    // If no text element clicked, check other elements
    if (!clickedElement) {
      for (const el of [...imageElements, ...shapeElements]) {
        const isClicked = x >= el.x && x <= el.x + el.width && 
                         y >= el.y && y <= el.y + el.height;
        console.log(`Checking ${el.type} at (${el.x}, ${el.y}): clicked=${isClicked}`);
        
        if (isClicked) {
          clickedElement = el;
          break;
        }
      }
    }
    
    if (clickedElement) {
      console.log('Clicked on existing element:', clickedElement);
      setSelectedElement(clickedElement.id);
      
      // If it's a text element, start editing
      if (clickedElement.type === 'text') {
        console.log('Starting text editing for:', clickedElement.content);
        startTextEditing(clickedElement.id);
      } else {
        setShowTextToolbar(true);
      }
    } else {
      console.log('Clicked on empty space, adding new element');
      setTextPosition({ x, y });
      setShowTextToolbar(true);
      setSelectedElement(null);
    }
  };

  const handleElementDrag = (e, elementId) => {
    if (!isDragging) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - dragOffset.x) / canvasScale;
    const y = (e.clientY - rect.top - dragOffset.y) / canvasScale;
    
    // Update element position
    setTextElements(prev => 
      prev.map(el => 
        el.id === elementId ? { ...el, x, y } : el
      )
    );
    setImageElements(prev => 
      prev.map(el => 
        el.id === elementId ? { ...el, x, y } : el
      )
    );
    setShapeElements(prev => 
      prev.map(el => 
        el.id === elementId ? { ...el, x, y } : el
      )
    );
    
    // Update modifications
    setModifications(prev => 
      prev.map(mod => 
        mod.id === elementId ? { ...mod, x, y } : mod
      )
    );
  };

  const startDrag = (e, element) => {
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - element.x * canvasScale,
      y: e.clientY - rect.top - element.y * canvasScale
    });
    setSelectedElement(element.id);
  };

  const stopDrag = () => {
    setIsDragging(false);
    setSelectedElement(null);
  };

  const deleteElement = (elementId) => {
    setTextElements(prev => prev.filter(el => el.id !== elementId));
    setImageElements(prev => prev.filter(el => el.id !== elementId));
    setShapeElements(prev => prev.filter(el => el.id !== elementId));
    setModifications(prev => prev.filter(mod => mod.id !== elementId));
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !pdfPageRendered) {
      console.log('Canvas not ready for rendering');
      return;
    }
    
    console.log('Rendering canvas elements...');
    console.log('Text elements:', textElements.length);
    console.log('Image elements:', imageElements.length);
    console.log('Shape elements:', shapeElements.length);
    
    const ctx = canvas.getContext('2d');
    
    // Clear the entire canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Re-render the PDF background
    if (pdfDoc && pdfPageRendered) {
      // This will be handled by the PDF.js render in the useEffect
      // We just need to clear and redraw our overlays
    }
    
    // Draw grid if enabled
    if (layoutTools.showGrid) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += layoutTools.gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += layoutTools.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
    
    // Draw guides if enabled
    if (layoutTools.showGuides) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.lineWidth = 1;
      layoutTools.guides.forEach(guide => {
        if (guide.type === 'vertical') {
          ctx.beginPath();
          ctx.moveTo(guide.position, 0);
          ctx.lineTo(guide.position, canvas.height);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, guide.position);
          ctx.lineTo(canvas.width, guide.position);
          ctx.stroke();
        }
      });
    }
    
    // Draw text elements with advanced features
    textElements.forEach(element => {
      console.log('Drawing text element:', element);
      if (element.type === 'text') {
        const style = element.style || {};
        const effects = element.effects || {};
        const typography = element.typography || {};
        
        // Apply typography settings
        let processedText = applyTypographySettings(element.content, typography);
        
        // Set up font with advanced features
        let fontWeight = style.bold ? 'bold' : 'normal';
        let fontStyle = style.italic ? 'italic' : 'normal';
        let fontSize = style.fontSize || 12;
        let fontFamily = style.fontFamily || 'Arial';
        
        // Apply small caps and all caps
        if (typography.smallCaps) {
          processedText = processedText.toUpperCase();
          fontSize = fontSize * 0.8; // Small caps are typically smaller
        }
        
        if (typography.allCaps) {
          processedText = processedText.toUpperCase();
        }
        
        ctx.font = `${fontWeight} ${fontStyle} ${fontSize}px ${fontFamily}`;
        
        // Apply text alignment
        const textMetrics = ctx.measureText(processedText);
        let x = element.x;
        if (style.textAlign === 'center') {
          x = element.x + (element.textBox?.width || 200) / 2;
        } else if (style.textAlign === 'right') {
          x = element.x + (element.textBox?.width || 200) - textMetrics.width;
        }
        
        // Apply opacity
        ctx.globalAlpha = style.opacity || 1;
        
        // Apply text effects
        if (effects.gradient) {
          const gradient = ctx.createLinearGradient(x, element.y, x + textMetrics.width, element.y);
          gradient.addColorStop(0, effects.gradientColors[0]);
          gradient.addColorStop(1, effects.gradientColors[1]);
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = style.color || '#000000';
        }
        
        // Apply shadow
        if (style.shadow) {
          ctx.shadowColor = style.shadowColor || '#000000';
          ctx.shadowBlur = style.shadowBlur || 2;
          ctx.shadowOffsetX = style.shadowOffsetX || 1;
          ctx.shadowOffsetY = style.shadowOffsetY || 1;
        }
        
        // Draw the text with effects
        applyTextEffects(ctx, processedText, x, element.y, effects);
        ctx.fillText(processedText, x, element.y);
        
        // Reset shadow
        if (style.shadow) {
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
        
        // Draw text box if it has a border or background
        if (element.textBox) {
          const box = element.textBox;
          if (box.border.width > 0) {
            ctx.strokeStyle = box.border.color;
            ctx.lineWidth = box.border.width;
            ctx.strokeRect(element.x, element.y - fontSize, box.width, fontSize + box.padding.top + box.padding.bottom);
          }
          
          if (box.background !== 'transparent') {
            ctx.fillStyle = box.background;
            ctx.fillRect(element.x, element.y - fontSize, box.width, fontSize + box.padding.top + box.padding.bottom);
          }
        }
        
        // Draw selection border for editable elements
        if (selectedElement === element.id) {
          ctx.strokeStyle = '#0077ff';
          ctx.lineWidth = 3;
          ctx.strokeRect(x - 3, element.y - fontSize - 3, 
                       textMetrics.width + 6, fontSize + 6);
          
          // Draw edit indicator
          ctx.fillStyle = '#0077ff';
          ctx.fillRect(x + textMetrics.width + 8, element.y - 12, 10, 10);
          
          // Draw text selection if active
          if (textSelection.elementId === element.id && textSelection.start !== textSelection.end) {
            const startX = x + ctx.measureText(processedText.substring(0, textSelection.start)).width;
            const endX = x + ctx.measureText(processedText.substring(0, textSelection.end)).width;
            ctx.fillStyle = 'rgba(0, 119, 255, 0.3)';
            ctx.fillRect(startX, element.y - fontSize, endX - startX, fontSize);
          }
        }
        
        // Draw subtle border for all editable text
        if (element.isEditable) {
          ctx.strokeStyle = 'rgba(0, 119, 255, 0.5)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x - 2, element.y - fontSize - 2, 
                       textMetrics.width + 4, fontSize + 4);
          
          // Add a small edit icon for all editable text
          ctx.fillStyle = 'rgba(0, 119, 255, 0.7)';
          ctx.fillRect(x + textMetrics.width + 2, element.y - 8, 6, 6);
        }
        
        // Reset global alpha
        ctx.globalAlpha = 1;
      }
    });

    // Draw image elements (both existing and new)
    imageElements.forEach(element => {
      console.log('Drawing image element:', element);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, element.x, element.y, element.width, element.height);
        
        if (selectedElement === element.id) {
          ctx.strokeStyle = '#77ff';
          ctx.lineWidth = 2;
          ctx.strokeRect(element.x - 2, element.y - 2, element.width + 4, element.height + 4);
        }
      };
      img.src = element.src;
    });

    // Draw shape elements (both existing and new)
    shapeElements.forEach(element => {
      console.log('Drawing shape element:', element);
      ctx.fillStyle = element.color || '#000000';
      ctx.strokeStyle = element.color || '#000000';
      ctx.lineWidth = 2;
      
      if (element.shapeType === 'rectangle') {
        ctx.fillRect(element.x, element.y, element.width, element.height);
      } else if (element.shapeType === 'circle') {
        ctx.beginPath();
        ctx.arc(element.x + element.width/2, element.y + element.height/2, element.width/2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      if (selectedElement === element.id) {
        ctx.strokeStyle = '#0077';
        ctx.lineWidth = 2;
        ctx.strokeRect(element.x - 2, element.y - 2, element.width + 4, element.height + 4);
      }
    });
    
    console.log('Canvas rendering complete');
  };

  // Load and render the actual PDF page using PDF.js
  useEffect(() => {
    const renderPDFPage = async () => {
      console.log('Rendering PDF page...');
      console.log('encryptedData:', encryptedData);
      console.log('canvasRef.current:', canvasRef.current);
      
      if (!encryptedData?.data || !canvasRef.current) {
        console.log('Missing data for rendering');
        return;
      }
      
      // Prevent multiple renders
      if (pdfPageRendered) {
        console.log('PDF already rendered, skipping...');
        return;
      }
      
      try {
        console.log('Decoding PDF data...');
        // Decode base64data
        const pdfBytes = atob(encryptedData.data);
        const typedarray = new Uint8Array(pdfBytes.length);
        for (let i = 0; i < pdfBytes.length; i++) {
          typedarray[i] = pdfBytes.charCodeAt(i);
        }
        
        console.log('Loading PDF with PDF.js...');
        const loadingTask = pdfjsLib.getDocument({ data: typedarray });
        const pdf = await loadingTask.promise;
        console.log('PDF loaded, pages:', pdf.numPages);
        
        setPdfDoc(pdf);
        const page = await pdf.getPage(currentPage + 1); // 1-based index
        const viewport = page.getViewport({ scale: canvasScale });
        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas before rendering
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        await page.render({ canvasContext: ctx, viewport }).promise;
        setPdfPageRendered(true);
        console.log('PDF page rendered successfully');
        
        // Load existing elements from the uploaded PDF
        console.log('Loading existing elements...');
        console.log('pdfPages:', pdfPages);
        console.log('currentPage:', currentPage);
        
        if (pdfPages && pdfPages.length > 0 && pdfPages[currentPage]) {
          const currentPageData = pdfPages[currentPage];
          console.log('Current page data:', currentPageData);
          console.log('Text elements found:', currentPageData.textElements?.length || 0);
          
          // Clear existing elements first
          setTextElements([]);
          setImageElements([]);
          setShapeElements([]);
          
          // Log each text element for debugging
          if (currentPageData.textElements) {
            currentPageData.textElements.forEach((textEl, index) => {
              console.log(`Text ${index}: "${textEl.content}" at (${textEl.x}, ${textEl.y})`);
            });
          }
          
          // Set elements after clearing
          setTextElements(currentPageData.textElements || []);
          setImageElements(currentPageData.imageElements || []);
          setShapeElements(currentPageData.shapeElements || []);
          
          console.log('Elements loaded:', {
            text: currentPageData.textElements?.length || 0,
            images: currentPageData.imageElements?.length || 0,
            shapes: currentPageData.shapeElements?.length || 0
          });
        } else {
          console.log('No page data available');
        }
      } catch (error) {
        console.error('Error rendering PDF:', error);
      }
    };
    
    if (activeTab === 'realtime') {
      renderPDFPage();
    }
    // eslint-disable-next-line
  }, [encryptedData, currentPage, canvasScale, activeTab, pdfPages, pdfPageRendered]);

  // Function to reset PDF render state
  const resetPDFRender = () => {
    setPdfPageRendered(false);
    setTextElements([]);
    setImageElements([]);
    setShapeElements([]);
    setSelectedElement(null);
    setShowTextToolbar(false);
  };

  // Reset when switching tabs
  useEffect(() => {
    if (activeTab !== 'realtime') {
      resetPDFRender();
    }
  }, [activeTab]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo/Redo
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              redo();
            } else {
              e.preventDefault();
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'c':
            e.preventDefault();
            const selectedText = textElements.find(el => el.id === selectedElement)?.content || '';
            copyToClipboard(selectedText);
            break;
          case 'v':
            e.preventDefault();
            pasteFromClipboard();
            break;
          case 'f':
            e.preventDefault();
            document.getElementById('find-input')?.focus();
            break;
          case 'h':
            e.preventDefault();
            document.getElementById('replace-input')?.focus();
            break;
          default:
            break;
        }
      }
      
      // Text editing shortcuts
      if (selectedElement && textElements.find(el => el.id === selectedElement)) {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            deleteTextElement(selectedElement);
            break;
          case 'Escape':
            e.preventDefault();
            setSelectedElement(null);
            setShowTextToolbar(false);
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, textElements, undoStack, redoStack]);

  useEffect(() => {
    renderCanvas();
    // eslint-disable-next-line
  }, [textElements, imageElements, shapeElements, selectedElement, canvasScale, pdfPageRendered, layoutTools, textSelection]);

  return (
    <div style={{ color: 'white', padding: '2rem' }}>
      <h1>PDF Editor</h1>
      
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        paddingBottom: '1rem'
      }}>
        <button
          onClick={() => setActiveTab('upload')}
          style={{
            background: activeTab === 'upload' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          📁 Upload PDF
        </button>
        <button
          onClick={() => setActiveTab('realtime')}
          style={{
            background: activeTab === 'realtime' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ✏️ Real-time Editor
        </button>
        <button
          onClick={() => setActiveTab('download')}
          style={{
            background: activeTab === 'download' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          💾 Download
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '3rem',
            textAlign: 'center',
            border: '2px dashed rgba(255,255,255,0.2)',
            marginBottom: '2rem'
          }}>
            <h3>Upload your PDF</h3>
            <p>Support for PDF, Word, Excel, PowerPoint, and more</p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={handleFileUpload}
              style={{ margin: '1rem 0' }}
            />
            {file && <p>Selected: {file.name}</p>}
          </div>

          {file && (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <h3>Encryption Settings</h3>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="password"
                  placeholder="Enter encryption password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    marginBottom: '1rem'
                  }}
                />
              </div>
              <button
                onClick={handleEncrypt}
                disabled={isProcessing}
                style={{
                  background: 'linear-gradient(45deg, #6672ff, #4776e6)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                {isProcessing ? 'Processing...' : '🔒 Upload & Process'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Real-time Editor Tab */}
      {activeTab === 'realtime' && (
        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Left Panel - Tools */}
          <div style={{
            width: '30%',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '1.5rem'
          }}>
            <h3>Editing Tools</h3>
            
            {/* Text Tool */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4>Text Tool</h4>
              <textarea
                placeholder="Enter text to add or edit existing text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  minHeight: '60px',
                  marginBottom: '0.5rem'
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <button
                  onClick={selectedElement ? finishTextEditing : addTextElement}
                  disabled={!editText.trim()}
                  style={{
                    background: 'linear-gradient(45deg, #6672ff, #4776e6)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    flex: 1
                  }}
                >
                  {selectedElement ? 'Finish Editing' : 'Add Text'}
                </button>
                {selectedElement && (
                  <button
                    onClick={() => {
                      setEditText('');
                      setShowTextToolbar(false);
                      setSelectedElement(null);
                    }}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
              
              {/* Text Editing Controls */}
              {selectedElement && textElements.find(el => el.id === selectedElement)?.type === 'text' && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,119,255,0.1)', borderRadius: '4px' }}>
                  <h5 style={{ color: 'white', marginBottom: '0.5rem' }}>Text Editing Options</h5>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        const element = textElements.find(el => el.id === selectedElement);
                        if (element) {
                          replaceTextElement(selectedElement, editText);
                        }
                      }}
                      disabled={!editText.trim()}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Replace Text
                    </button>
                    <button
                      onClick={() => {
                        const element = textElements.find(el => el.id === selectedElement);
                        if (element) {
                          insertTextAtPosition(element.x + 100, element.y, editText);
                        }
                      }}
                      disabled={!editText.trim()}
                      style={{
                        background: '#ffc107',
                        color: 'black',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Insert After
                    </button>
                    <button
                      onClick={() => deleteTextElement(selectedElement)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Delete Text
                    </button>
                  </div>
                </div>
              )}
              
              {selectedElement && (
                <p style={{ color: '#0077ff', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Editing: {textElements.find(el => el.id === selectedElement)?.content}
                </p>
              )}
            </div>

            {/* Image Tool */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4>Image Tool</h4>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    addImageElement(e.target.files[0]);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white'
                }}
              />
            </div>

            {/* Shape Tool */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4>Shape Tool</h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => addShapeElement('rectangle')}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Rectangle
                </button>
                <button
                  onClick={() => addShapeElement('circle')}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Circle
                </button>
              </div>
            </div>

            {/* Advanced Text Style Controls */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4>Advanced Text Style</h4>
              
              {/* Font Family */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ color: 'white', fontSize: '0.9rem' }}>Font Family:</label>
                <select
                  value={textStyle.fontFamily}
                  onChange={(e) => setTextStyle({...textStyle, fontFamily: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '0.8rem'
                  }}
                >
                  {fontLibrary.map(font => (
                    <option key={font.name} value={font.name}>{font.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Font Size */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ color: 'white', fontSize: '0.9rem' }}>Font Size:</label>
                <input
                  type="range"
                  min="8"
                  max="72"
                  value={textStyle.fontSize}
                  onChange={(e) => setTextStyle({...textStyle, fontSize: parseInt(e.target.value)})}
                  style={{ width: '100%' }}
                />
                <span style={{ color: 'white', fontSize: '0.8rem' }}>{textStyle.fontSize}px</span>
              </div>
              
              {/* Color */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ color: 'white', fontSize: '0.9rem' }}>Color:</label>
                <input
                  type="color"
                  value={textStyle.color}
                  onChange={(e) => setTextStyle({...textStyle, color: e.target.value})}
                  style={{ width: '100%', height: '30px' }}
                />
              </div>
              
              {/* Text Alignment */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ color: 'white', fontSize: '0.9rem' }}>Alignment:</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {['left', 'center', 'right'].map(align => (
                    <button
                      key={align}
                      onClick={() => setTextStyle({...textStyle, textAlign: align})}
                      style={{
                        background: textStyle.textAlign === align ? '#0077ff' : 'rgba(255,255,255,0.1)',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        flex: 1
                      }}
                    >
                      {align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Basic Formatting */}
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                <button
                  onClick={() => setTextStyle({...textStyle, bold: !textStyle.bold})}
                  style={{
                    background: textStyle.bold ? '#0077ff' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  B
                </button>
                <button
                  onClick={() => setTextStyle({...textStyle, italic: !textStyle.italic})}
                  style={{
                    background: textStyle.italic ? '#0077ff' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  I
                </button>
                <button
                  onClick={() => setTextStyle({...textStyle, underline: !textStyle.underline})}
                  style={{
                    background: textStyle.underline ? '#0077ff' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  U
                </button>
                <button
                  onClick={() => setTextStyle({...textStyle, strikethrough: !textStyle.strikethrough})}
                  style={{
                    background: textStyle.strikethrough ? '#0077ff' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  S
                </button>
              </div>
              
              {/* Advanced Typography */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ color: 'white', fontSize: '0.9rem' }}>Typography:</label>
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setTypographySettings({...typographySettings, smallCaps: !typographySettings.smallCaps})}
                    style={{
                      background: typographySettings.smallCaps ? '#0077ff' : 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Small Caps
                  </button>
                  <button
                    onClick={() => setTypographySettings({...typographySettings, allCaps: !typographySettings.allCaps})}
                    style={{
                      background: typographySettings.allCaps ? '#0077ff' : 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    All Caps
                  </button>
                </div>
              </div>
              
              {/* Text Effects */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ color: 'white', fontSize: '0.9rem' }}>Effects:</label>
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setTextStyle({...textStyle, shadow: !textStyle.shadow})}
                    style={{
                      background: textStyle.shadow ? '#0077ff' : 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Shadow
                  </button>
                  <button
                    onClick={() => setTextEffects({...textEffects, outline: !textEffects.outline})}
                    style={{
                      background: textEffects.outline ? '#0077ff' : 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Outline
                  </button>
                  <button
                    onClick={() => setTextEffects({...textEffects, glow: !textEffects.glow})}
                    style={{
                      background: textEffects.glow ? '#0077ff' : 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Glow
                  </button>
                </div>
              </div>
              
              {/* Opacity */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ color: 'white', fontSize: '0.9rem' }}>Opacity:</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={textStyle.opacity || 1}
                  onChange={(e) => setTextStyle({...textStyle, opacity: parseFloat(e.target.value)})}
                  style={{ width: '100%' }}
                />
                <span style={{ color: 'white', fontSize: '0.8rem' }}>{Math.round((textStyle.opacity || 1) * 100)}%</span>
              </div>
            </div>

            {/* Advanced Editing Tools */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4>Advanced Tools</h4>
              
              {/* Undo/Redo */}
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                <button
                  onClick={undo}
                  disabled={undoStack.length === 0}
                  style={{
                    background: undoStack.length > 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    cursor: undoStack.length > 0 ? 'pointer' : 'not-allowed',
                    fontSize: '0.8rem',
                    flex: 1
                  }}
                >
                  Undo
                </button>
                <button
                  onClick={redo}
                  disabled={redoStack.length === 0}
                  style={{
                    background: redoStack.length > 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    cursor: redoStack.length > 0 ? 'pointer' : 'not-allowed',
                    fontSize: '0.8rem',
                    flex: 1
                  }}
                >
                  Redo
                </button>
              </div>
              
              {/* Copy/Paste */}
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                <button
                  onClick={() => {
                    const selectedText = textElements.find(el => el.id === selectedElement)?.content || '';
                    copyToClipboard(selectedText);
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    flex: 1
                  }}
                >
                  Copy
                </button>
                <button
                  onClick={pasteFromClipboard}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    flex: 1
                  }}
                >
                  Paste
                </button>
              </div>
              
              {/* Find and Replace */}
              <div style={{ marginBottom: '0.5rem' }}>
                <input
                  id="find-input"
                  type="text"
                  placeholder="Find text..."
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '0.8rem',
                    marginBottom: '0.25rem'
                  }}
                />
                <input
                  id="replace-input"
                  type="text"
                  placeholder="Replace with..."
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '0.8rem',
                    marginBottom: '0.25rem'
                  }}
                />
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={() => findTextInDocument(findText, searchOptions)}
                    disabled={!findText}
                    style={{
                      background: findText ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: findText ? 'pointer' : 'not-allowed',
                      fontSize: '0.8rem',
                      flex: 1
                    }}
                  >
                    Find
                  </button>
                  <button
                    onClick={() => replaceTextInDocument(findText, replaceText, searchOptions)}
                    disabled={!findText || !replaceText}
                    style={{
                      background: (findText && replaceText) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: (findText && replaceText) ? 'pointer' : 'not-allowed',
                      fontSize: '0.8rem',
                      flex: 1
                    }}
                  >
                    Replace
                  </button>
                </div>
                {findResults.length > 0 && (
                  <p style={{ color: '#0077ff', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                    Found {findResults.length} matches
                  </p>
                )}
              </div>
              
              {/* Text Flow Controls */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ color: 'white', fontSize: '0.9rem' }}>Text Flow:</label>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
                  <button
                    onClick={() => setTextFlow({...textFlow, columns: Math.max(1, textFlow.columns - 1)})}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    -
                  </button>
                  <span style={{ color: 'white', fontSize: '0.8rem', lineHeight: '2rem' }}>
                    {textFlow.columns} Column{textFlow.columns !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setTextFlow({...textFlow, columns: textFlow.columns + 1})}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => setTextFlowSettings({...textFlowSettings, autoFlow: !textFlowSettings.autoFlow})}
                  style={{
                    background: textFlowSettings.autoFlow ? '#0077ff' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    width: '100%'
                  }}
                >
                  Auto Flow Text
                </button>
              </div>
              
              {/* Text Style Presets */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ color: 'white', fontSize: '0.9rem' }}>Style Presets:</label>
                <select
                  onChange={(e) => applyTextStylePreset(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '0.8rem'
                  }}
                >
                  <option value="">Select Preset...</option>
                  {textStylePresets.map(preset => (
                    <option key={preset.name} value={preset.name}>{preset.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Layout Tools */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4>Layout Tools</h4>
              
              {/* Grid Controls */}
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
                  <button
                    onClick={() => setLayoutTools({...layoutTools, showGrid: !layoutTools.showGrid})}
                    style={{
                      background: layoutTools.showGrid ? '#0077ff' : 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      flex: 1
                    }}
                  >
                    Show Grid
                  </button>
                  <button
                    onClick={() => setLayoutTools({...layoutTools, snapToGrid: !layoutTools.snapToGrid})}
                    style={{
                      background: layoutTools.snapToGrid ? '#0077ff' : 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      flex: 1
                    }}
                  >
                    Snap to Grid
                  </button>
                </div>
                <div style={{ marginBottom: '0.25rem' }}>
                  <label style={{ color: 'white', fontSize: '0.8rem' }}>Grid Size:</label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={layoutTools.gridSize}
                    onChange={(e) => setLayoutTools({...layoutTools, gridSize: parseInt(e.target.value)})}
                    style={{ width: '100%' }}
                  />
                  <span style={{ color: 'white', fontSize: '0.7rem' }}>{layoutTools.gridSize}px</span>
                </div>
              </div>
              
              {/* Guides */}
              <div style={{ marginBottom: '0.5rem' }}>
                <button
                  onClick={() => setLayoutTools({...layoutTools, showGuides: !layoutTools.showGuides})}
                  style={{
                    background: layoutTools.showGuides ? '#0077ff' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    width: '100%'
                  }}
                >
                  Show Guides
                </button>
              </div>
            </div>

            {/* Zoom Controls */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4>Zoom</h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setCanvasScale(Math.max(0.5, canvasScale - 0.1))}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  -
                </button>
                <span style={{ color: 'white', lineHeight: '2rem' }}>{Math.round(canvasScale * 100)}%</span>
                <button
                  onClick={() => setCanvasScale(Math.min(3, canvasScale + 0.1))}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div style={{ marginBottom: '1.5rem' }}>
              <button
                onClick={saveEditedPDF}
                disabled={isProcessing || modifications.length === 0}
                style={{
                  background: modifications.length > 0 ? 'linear-gradient(45deg, #28745, #20c997)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '4px',
                  cursor: modifications.length > 0 ? 'pointer' : 'not-allowed',
                  fontSize: '0.9rem',
                  width: '100%'
                }}
              >
                {isProcessing ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>

            {/* Selected Element Controls */}
            {selectedElement && (
              <div>
                <h4>Selected Element</h4>
                
                {/* Text Editing */}
                {textElements.find(el => el.id === selectedElement) && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ color: 'white', fontSize: '0.9rem' }}>Edit Text:</label>
                    <textarea
                      value={textElements.find(el => el.id === selectedElement)?.content || ''}
                      onChange={(e) => editExistingText(selectedElement, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        minHeight: '60px',
                        marginBottom: '0.5rem'
                      }}
                    />
                  </div>
                )}
                
                {/* Image Editing */}
                {imageElements.find(el => el.id === selectedElement) && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ color: 'white', fontSize: '0.9rem' }}>Replace Image:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          editExistingImage(selectedElement, e.target.files[0]);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'white'
                      }}
                    />
                  </div>
                )}
                
                {/* Shape Editing */}
                {shapeElements.find(el => el.id === selectedElement) && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ color: 'white', fontSize: '0.9rem' }}>Shape Color:</label>
                    <input
                      type="color"
                      value={shapeElements.find(el => el.id === selectedElement)?.color || '#000000'}
                      onChange={(e) => editExistingShape(selectedElement, { color: e.target.value })}
                      style={{
                        width: '100%',
                        height: '30px',
                        marginBottom: '0.5rem'
                      }}
                    />
                    <label style={{ color: 'white', fontSize: '0.9rem' }}>Size:</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input
                        type="number"
                        placeholder="Width"
                        value={shapeElements.find(el => el.id === selectedElement)?.width || 100}
                        onChange={(e) => editExistingShape(selectedElement, { width: parseInt(e.target.value) })}
                        style={{
                          width: '50%',
                          padding: '0.25rem',
                          borderRadius: '4px',
                          border: '1px solid rgba(255,255,255,0.2)',
                          background: 'rgba(255,255,255,0.05)',
                          color: 'white'
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Height"
                        value={shapeElements.find(el => el.id === selectedElement)?.height || 100}
                        onChange={(e) => editExistingShape(selectedElement, { height: parseInt(e.target.value) })}
                        style={{
                          width: '50%',
                          padding: '0.25rem',
                          borderRadius: '4px',
                          border: '1px solid rgba(255,255,255,0.2)',
                          background: 'rgba(255,255,255,0.05)',
                          color: 'white'
                        }}
                      />
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => deleteElement(selectedElement)}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    width: '100%'
                  }}
                >
                  Delete Element
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Canvas */}
          <div style={{ flex: 1 }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <h3>PDF Preview</h3>
              <div style={{
                display: 'inline-block',
                background: '#f0f0f0',
                padding: '1rem',
                borderRadius: '8px',
                marginTop: '1rem'
              }}>
                <canvas
                  ref={canvasRef}
                  width={595 * canvasScale}
                  height={842 * canvasScale}
                  onClick={handleCanvasClick}
                  onMouseDown={(e) => {
                    const element = [...textElements, ...imageElements, ...shapeElements].find(el => 
                      e.clientX >= el.x * canvasScale && 
                      e.clientX <= (el.x + (el.width || 10) * canvasScale) &&
                      e.clientY >= (el.y - (el.style?.fontSize || 0) * canvasScale) &&
                      e.clientY <= (el.y + (el.height || 0) * canvasScale)
                    );
                    if (element) {
                      startDrag(e, element);
                    }
                  }}
                  onMouseMove={(e) => {
                    if (isDragging && selectedElement) {
                      handleElementDrag(e, selectedElement);
                    }
                  }}
                  onMouseUp={stopDrag}
                  style={{
                    border: '1px solid #ccc',
                    cursor: 'crosshair',
                    background: 'white'
                  }}
                />
              </div>
              <p style={{ color: 'white', marginTop: '1rem', fontSize: '0.9rem' }}>
                Click anywhere to add elements. Drag elements to move them. Select elements to delete them.
              </p>
              <p style={{ color: '#0077ff', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                💡 <strong>Tip:</strong> Click on any text in the PDF to edit it. Editable text shows blue borders.
              </p>
              {modifications.length > 0 && (
                <p style={{ color: '#28745', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  {modifications.length} modification(s) pending. Click "Save Changes" to apply.
                </p>
              )}
              
              {/* Status Bar */}
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '0.5rem',
                borderRadius: '4px',
                marginTop: '1rem',
                fontSize: '0.8rem',
                color: 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Zoom: {Math.round(canvasScale * 100)}%</span>
                  <span>Page: {currentPage + 1}</span>
                  <span>Elements: {textElements.length + imageElements.length + shapeElements.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.8 }}>
                  <span>Ctrl+Z: Undo | Ctrl+Y: Redo</span>
                  <span>Ctrl+C: Copy | Ctrl+V: Paste</span>
                  <span>Ctrl+F: Find | Ctrl+H: Replace</span>
                </div>
                {selectedElement && (
                  <div style={{ marginTop: '0.25rem', padding: '0.25rem', background: 'rgba(0,119,255,0.2)', borderRadius: '2px' }}>
                    <span>Selected: {textElements.find(el => el.id === selectedElement)?.content?.substring(0, 30) || 'Element'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Tab */}
      {activeTab === 'download' && (
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h3>Download Edited PDF</h3>
          {encryptedData ? (
            <div>
              <p style={{ marginBottom: '1rem' }}>Your edited PDF is ready for download.</p>
              <button
                onClick={handleDownload}
                style={{
                  background: 'linear-gradient(45deg, #6672ff, #4776e6)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                💾 Download Edited PDF
              </button>
            </div>
          ) : (
            <p>No file available. Please upload and edit a PDF first.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PDFEditor;