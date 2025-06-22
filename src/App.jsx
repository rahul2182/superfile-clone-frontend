import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  FileText, 
  Image, 
  Type, 
  QrCode, 
  Search,
  Upload,
  Download,
  Zap,
  Shield,
  Star,
  Users,
  Loader2,import { CheckCircle, AlertCircle, Minimize, Code, Hash } from "lucide-react";'
import './App.css'

// Backend API base URL
const API_BASE_URL = 'http://localhost:5000/api'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Tool implementations
  const [wordCountText, setWordCountText] = useState('')
  const [textCaseInput, setTextCaseInput] = useState('')
  const [qrCodeText, setQrCodeText] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [imageFiles, setImageFiles] = useState([])
  const [compressQuality, setCompressQuality] = useState(85)
  const [jsonText, setJsonText] = useState('')
  const [base64Text, setBase64Text] = useState('')
  
  // Results
  const [pdfImages, setPdfImages] = useState([])
  const [convertedPdf, setConvertedPdf] = useState(null)
  const [compressedImage, setCompressedImage] = useState(null)
  const [processedText, setProcessedText] = useState('')

  const tools = [
    {
      id: 'pdf-to-image',
      title: 'PDF to Image',
      description: 'Convert PDFs to high-quality images instantly.',
      icon: FileText,
      category: 'Convert',
      color: 'bg-blue-500'
    },
    {
      id: 'image-to-pdf',
      title: 'Image to PDF',
      description: 'Transform images into PDFs quickly and easily.',
      icon: Image,
      category: 'Convert',
      color: 'bg-green-500'
    },
    {
      id: 'compress-image',
      title: 'Image Compressor',
      description: 'Reduce image file sizes without losing quality.',
      icon: Compress,
      category: 'Convert',
      color: 'bg-red-500'
    },
    {
      id: 'word-counter',
      title: 'Word Counter',
      description: 'Quickly count words and characters in your text.',
      icon: Type,
      category: 'Text',
      color: 'bg-purple-500'
    },
    {
      id: 'qr-generator',
      title: 'QR Code Generator',
      description: 'Create custom QR codes for any purpose.',
      icon: QrCode,
      category: 'Generate',
      color: 'bg-orange-500'
    },
    {
      id: 'text-case',
      title: 'Text Case Converter',
      description: 'Convert text to any case in seconds.',
      icon: Type,
      category: 'Text',
      color: 'bg-pink-500'
    },
    {
      id: 'json-beautifier',
      title: 'JSON Beautifier',
      description: 'Format and beautify your JSON code.',
      icon: Code,
      category: 'Text',
      color: 'bg-indigo-500'
    },
    {
      id: 'base64-encoder',
      title: 'Base64 Encoder/Decoder',
      description: 'Encode and decode Base64 text.',
      icon: Hash,
      category: 'Text',
      color: 'bg-teal-500'
    }
  ]

  const filteredTools = tools.filter(tool => 
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const countWords = (text) => {
    if (!text.trim()) return { words: 0, characters: 0, charactersNoSpaces: 0 }
    const words = text.trim().split(/\s+/).length
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    return { words, characters, charactersNoSpaces }
  }

  const convertTextCase = (text, caseType) => {
    switch (caseType) {
      case 'upper':
        return text.toUpperCase()
      case 'lower':
        return text.toLowerCase()
      case 'title':
        return text.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )
      case 'sentence':
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
      default:
        return text
    }
  }

  const generateQRCode = (text) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`
  }

  const downloadFile = (dataUrl, filename) => {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePdfToImages = async () => {
    if (!pdfFile) {
      setError('Please select a PDF file')
      return
    }

    setLoading(true)
    setError('')
    setPdfImages([])

    const formData = new FormData()
    formData.append('file', pdfFile)

    try {
      const response = await fetch(`${API_BASE_URL}/pdf-to-images`, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setPdfImages(result.images)
        setSuccess(`Successfully converted ${result.total_pages} pages`)
      } else {
        setError(result.error || 'Failed to convert PDF')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleImagesToPdf = async () => {
    if (imageFiles.length === 0) {
      setError('Please select image files')
      return
    }

    setLoading(true)
    setError('')
    setConvertedPdf(null)

    const formData = new FormData()
    Array.from(imageFiles).forEach(file => {
      formData.append('files', file)
    })

    try {
      const response = await fetch(`${API_BASE_URL}/images-to-pdf`, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setConvertedPdf(result)
        setSuccess(`Successfully created PDF with ${result.pages_count} pages`)
      } else {
        setError(result.error || 'Failed to convert images')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleCompressImage = async () => {
    if (!pdfFile) { // Reusing pdfFile state for image compression
      setError('Please select an image file')
      return
    }

    setLoading(true)
    setError('')
    setCompressedImage(null)

    const formData = new FormData()
    formData.append('file', pdfFile)
    formData.append('quality', compressQuality)

    try {
      const response = await fetch(`${API_BASE_URL}/compress-image`, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setCompressedImage(result)
        setSuccess(`Image compressed by ${result.compression_ratio}%`)
      } else {
        setError(result.error || 'Failed to compress image')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleJsonBeautify = async () => {
    if (!jsonText.trim()) {
      setError('Please enter JSON text')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/text-tools/beautify-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: jsonText })
      })

      const result = await response.json()

      if (result.success) {
        setProcessedText(result.beautified_text)
        setSuccess('JSON beautified successfully')
      } else {
        setError(result.error || 'Failed to beautify JSON')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleBase64Encode = async () => {
    if (!base64Text.trim()) {
      setError('Please enter text to encode')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/text-tools/base64-encode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: base64Text })
      })

      const result = await response.json()

      if (result.success) {
        setProcessedText(result.encoded_text)
        setSuccess('Text encoded successfully')
      } else {
        setError(result.error || 'Failed to encode text')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleBase64Decode = async () => {
    if (!base64Text.trim()) {
      setError('Please enter Base64 text to decode')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/text-tools/base64-decode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: base64Text })
      })

      const result = await response.json()

      if (result.success) {
        setProcessedText(result.decoded_text)
        setSuccess('Text decoded successfully')
      } else {
        setError(result.error || 'Failed to decode text')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const renderTool = (toolId) => {
    // Clear messages when switching tools
    if (error || success) {
      setTimeout(() => {
        setError('')
        setSuccess('')
      }, 100)
    }

    switch (toolId) {
      case 'word-counter':
        const stats = countWords(wordCountText)
        return (
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your text here..."
              value={wordCountText}
              onChange={(e) => setWordCountText(e.target.value)}
              className="min-h-32"
            />
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.words}</div>
                  <div className="text-sm text-muted-foreground">Words</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.characters}</div>
                  <div className="text-sm text-muted-foreground">Characters</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.charactersNoSpaces}</div>
                  <div className="text-sm text-muted-foreground">No Spaces</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'text-case':
        return (
          <div className="space-y-4">
            <Textarea
              placeholder="Enter text to convert..."
              value={textCaseInput}
              onChange={(e) => setTextCaseInput(e.target.value)}
              className="min-h-32"
            />
            <div className="grid grid-cols-2 gap-4">
              {[
                { type: 'upper', label: 'UPPERCASE' },
                { type: 'lower', label: 'lowercase' },
                { type: 'title', label: 'Title Case' },
                { type: 'sentence', label: 'Sentence case' }
              ].map(({ type, label }) => (
                <Card key={type}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-muted rounded text-sm min-h-16">
                      {convertTextCase(textCaseInput, type)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 'qr-generator':
        return (
          <div className="space-y-4">
            <Input
              placeholder="Enter text or URL for QR code..."
              value={qrCodeText}
              onChange={(e) => setQrCodeText(e.target.value)}
            />
            {qrCodeText && (
              <Card>
                <CardContent className="p-6 text-center">
                  <img 
                    src={generateQRCode(qrCodeText)} 
                    alt="Generated QR Code"
                    className="mx-auto mb-4"
                  />
                  <Button onClick={() => downloadFile(generateQRCode(qrCodeText), 'qrcode.png')}>
                    <Download className="w-4 h-4 mr-2" />
                    Download QR Code
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'pdf-to-image':
        return (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Upload PDF File</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select a PDF file to convert to images
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <Button asChild>
                    <label htmlFor="pdf-upload" className="cursor-pointer">
                      Choose PDF File
                    </label>
                  </Button>
                </div>
                {pdfFile && (
                  <div className="mt-4 p-4 bg-muted rounded">
                    <p className="font-medium">Selected: {pdfFile.name}</p>
                    <Button 
                      onClick={handlePdfToImages} 
                      disabled={loading}
                      className="mt-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        'Convert to Images'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {pdfImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Converted Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {pdfImages.map((img, index) => (
                      <div key={index} className="text-center">
                        <img 
                          src={img.data} 
                          alt={`Page ${img.page}`}
                          className="w-full border rounded mb-2"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => downloadFile(img.data, img.filename)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Page {img.page}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'image-to-pdf':
        return (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Upload Image Files</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select image files to convert to PDF
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImageFiles(e.target.files)}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button asChild>
                    <label htmlFor="image-upload" className="cursor-pointer">
                      Choose Image Files
                    </label>
                  </Button>
                </div>
                {imageFiles.length > 0 && (
                  <div className="mt-4 p-4 bg-muted rounded">
                    <p className="font-medium">Selected {imageFiles.length} file(s)</p>
                    <Button 
                      onClick={handleImagesToPdf} 
                      disabled={loading}
                      className="mt-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        'Convert to PDF'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {convertedPdf && (
              <Card>
                <CardHeader>
                  <CardTitle>Converted PDF</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="mb-4">PDF created with {convertedPdf.pages_count} pages</p>
                  <Button onClick={() => downloadFile(convertedPdf.pdf_data, convertedPdf.filename)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'compress-image':
        return (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Upload Image File</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select an image file to compress
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                    className="hidden"
                    id="compress-upload"
                  />
                  <Button asChild>
                    <label htmlFor="compress-upload" className="cursor-pointer">
                      Choose Image File
                    </label>
                  </Button>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    Quality: {compressQuality}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={compressQuality}
                    onChange={(e) => setCompressQuality(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                {pdfFile && (
                  <div className="mt-4 p-4 bg-muted rounded">
                    <p className="font-medium">Selected: {pdfFile.name}</p>
                    <Button 
                      onClick={handleCompressImage} 
                      disabled={loading}
                      className="mt-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Compressing...
                        </>
                      ) : (
                        'Compress Image'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {compressedImage && (
              <Card>
                <CardHeader>
                  <CardTitle>Compressed Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Original Size</p>
                      <p className="font-medium">{(compressedImage.original_size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Compressed Size</p>
                      <p className="font-medium">{(compressedImage.compressed_size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <img 
                      src={compressedImage.compressed_image} 
                      alt="Compressed"
                      className="max-w-full h-auto border rounded mb-4"
                    />
                    <Button onClick={() => downloadFile(compressedImage.compressed_image, compressedImage.filename)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Compressed Image
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'json-beautifier':
        return (
          <div className="space-y-4">
            <Textarea
              placeholder="Enter JSON text to beautify..."
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="min-h-32"
            />
            <div className="flex gap-2">
              <Button onClick={handleJsonBeautify} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Beautify JSON'
                )}
              </Button>
            </div>
            {processedText && (
              <Card>
                <CardHeader>
                  <CardTitle>Beautified JSON</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96">
                    {processedText}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'base64-encoder':
        return (
          <div className="space-y-4">
            <Textarea
              placeholder="Enter text to encode/decode..."
              value={base64Text}
              onChange={(e) => setBase64Text(e.target.value)}
              className="min-h-32"
            />
            <div className="flex gap-2">
              <Button onClick={handleBase64Encode} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Encode'
                )}
              </Button>
              <Button onClick={handleBase64Decode} disabled={loading} variant="outline">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Decode'
                )}
              </Button>
            </div>
            {processedText && (
              <Card>
                <CardHeader>
                  <CardTitle>Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                    {processedText}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )

      default:
        return <div>Tool not implemented yet.</div>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">SuperFile Clone</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button 
                onClick={() => setActiveTab('home')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'home' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                All Tools
              </button>
              <button 
                onClick={() => setActiveTab('convert')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'convert' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                Convert
              </button>
              <button 
                onClick={() => setActiveTab('text')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'text' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                Text Tools
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error/Success Messages */}
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {activeTab === 'home' && (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Explore Free Tools for
                <br />
                <span className="text-blue-600">PDF, Image & Document Management</span>
              </h1>
              <div className="max-w-md mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search any tool..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {filteredTools.map((tool) => {
                const IconComponent = tool.icon
                return (
                  <Card key={tool.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tool.title}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {tool.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        {tool.description}
                      </CardDescription>
                      <Button 
                        onClick={() => setActiveTab(tool.id)}
                        className="w-full"
                        size="sm"
                      >
                        Try Now
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Features Section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-12">
                Why Choose <span className="text-blue-600">SuperFile Clone?</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Future of File Management</h3>
                  <p className="text-muted-foreground">
                    Your all-in-one file solution. Join a growing community of satisfied users who've streamlined their workflows with our innovative tools.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Weekly Innovation</h3>
                  <p className="text-muted-foreground">
                    We're constantly evolving! Expect exciting new tools and features every week, keeping your workflow at the cutting edge.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Unmatched Security</h3>
                  <p className="text-muted-foreground">
                    Your data is our top priority. We utilize the latest security standards, and once your files are downloaded, they're promptly deleted from our servers.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tool Pages */}
        {activeTab !== 'home' && activeTab !== 'convert' && activeTab !== 'text' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setActiveTab('home')}
                className="mb-4"
              >
                ← Back to All Tools
              </Button>
              {(() => {
                const tool = tools.find(t => t.id === activeTab)
                if (!tool) return null
                const IconComponent = tool.icon
                return (
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`w-16 h-16 ${tool.color} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">{tool.title}</h1>
                      <p className="text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                )
              })()}
            </div>
            <Card>
              <CardContent className="p-6">
                {renderTool(activeTab)}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Category Pages */}
        {(activeTab === 'convert' || activeTab === 'text') && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setActiveTab('home')}
                className="mb-4"
              >
                ← Back to All Tools
              </Button>
              <h1 className="text-3xl font-bold mb-2">
                {activeTab === 'convert' ? 'Convert Tools' : 'Text Tools'}
              </h1>
              <p className="text-muted-foreground">
                {activeTab === 'convert' 
                  ? 'Transform your files between different formats'
                  : 'Powerful text processing and manipulation tools'
                }
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools
                .filter(tool => 
                  activeTab === 'convert' ? tool.category === 'Convert' : tool.category === 'Text' || tool.category === 'Generate'
                )
                .map((tool) => {
                  const IconComponent = tool.icon
                  return (
                    <Card key={tool.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{tool.title}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4">
                          {tool.description}
                        </CardDescription>
                        <Button 
                          onClick={() => setActiveTab(tool.id)}
                          className="w-full"
                          size="sm"
                        >
                          Try Now
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App

