"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, FileText, ArrowLeft, X, Plus, Eye } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ChartFile {
  name: string
  content: string
  type: "chart" | "values" | "template" | "other"
}

export default function FilesUploadPage() {
  const [chartFiles, setChartFiles] = useState<ChartFile[]>([])
  const [valuesContent, setValuesContent] = useState("")
  const [customValues, setCustomValues] = useState<{ name: string; content: string }[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const content = reader.result as string
        const fileType = getFileType(file.name)

        setChartFiles((prev) => [
          ...prev,
          {
            name: file.name,
            content,
            type: fileType,
          },
        ])
      }
      reader.readAsText(file)
    })
  }, [])

  const getFileType = (filename: string): ChartFile["type"] => {
    if (filename === "Chart.yaml" || filename === "Chart.yml") return "chart"
    if (filename === "values.yaml" || filename === "values.yml") return "values"
    if (filename.includes("template") || filename.endsWith(".yaml") || filename.endsWith(".yml")) return "template"
    return "other"
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/yaml": [".yaml", ".yml"],
      "application/x-yaml": [".yaml", ".yml"],
      "text/plain": [".yaml", ".yml"],
    },
  })

  const removeFile = (index: number) => {
    setChartFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const addCustomValues = () => {
    setCustomValues((prev) => [...prev, { name: "", content: "" }])
  }

  const updateCustomValues = (index: number, field: "name" | "content", value: string) => {
    setCustomValues((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const removeCustomValues = (index: number) => {
    setCustomValues((prev) => prev.filter((_, i) => i !== index))
  }

  const getFileTypeColor = (type: ChartFile["type"]) => {
    switch (type) {
      case "chart":
        return "bg-blue-100 text-blue-800"
      case "values":
        return "bg-green-100 text-green-800"
      case "template":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const analyzeFiles = () => {
    // This would send the files to your Go backend for analysis
    console.log("Analyzing files:", { chartFiles, valuesContent, customValues })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center space-x-4">
          <Link href="/upload" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Upload</span>
          </Link>
          <div className="flex-1" />
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">HelmGuard</span>
          </Link>
        </div>
      </header>

      <main className="container py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Upload Individual Chart Files</h1>
            <p className="text-muted-foreground">Upload your Helm chart files individually for detailed analysis</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* File Upload Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-teal-500" />
                    Upload Chart Files
                  </CardTitle>
                  <CardDescription>Drag and drop your YAML files or click to browse</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive ? "border-teal-500 bg-teal-50" : "border-gray-300 hover:border-teal-400"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    {isDragActive ? (
                      <p className="text-teal-600">Drop the files here...</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-medium">Drop YAML files here</p>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                        <div className="flex justify-center gap-2 mt-2">
                          <Badge variant="secondary">Chart.yaml</Badge>
                          <Badge variant="secondary">values.yaml</Badge>
                          <Badge variant="secondary">templates/*.yaml</Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  {chartFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-medium">Uploaded Files</h4>
                      {chartFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-teal-500" />
                            <span className="text-sm font-medium">{file.name}</span>
                            <Badge className={`text-xs ${getFileTypeColor(file.type)}`}>{file.type}</Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                                <DialogHeader>
                                  <DialogTitle>{file.name}</DialogTitle>
                                </DialogHeader>
                                <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">{file.content}</pre>
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Default values.yaml</CardTitle>
                  <CardDescription>Paste your default values.yaml content here</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="# Default values for your chart
# This is a YAML-formatted file.
# Declare variables to be substituted into your templates.

replicaCount: 1

image:
  repository: nginx
  pullPolicy: IfNotPresent
  tag: ''

service:
  type: ClusterIP
  port: 80"
                    value={valuesContent}
                    onChange={(e) => setValuesContent(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Custom Values Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Custom Values Files
                    <Button onClick={addCustomValues} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Values File
                    </Button>
                  </CardTitle>
                  <CardDescription>Add custom values files for different environments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customValues.map((values, index) => (
                    <div key={index} className="space-y-2 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`values-name-${index}`}>Values File Name</Label>
                        <Button variant="ghost" size="sm" onClick={() => removeCustomValues(index)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <input
                        id={`values-name-${index}`}
                        type="text"
                        placeholder="e.g., values-prod.yaml"
                        value={values.name}
                        onChange={(e) => updateCustomValues(index, "name", e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                      <Textarea
                        placeholder="# Custom values content..."
                        value={values.content}
                        onChange={(e) => updateCustomValues(index, "content", e.target.value)}
                        className="min-h-[120px] font-mono text-sm"
                      />
                    </div>
                  ))}

                  {customValues.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="mx-auto h-8 w-8 mb-2" />
                      <p>No custom values files added yet</p>
                      <p className="text-sm">Click "Add Values File" to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-green-900">Ready to Analyze</h3>
                    <p className="text-sm text-green-700">
                      Upload your Chart.yaml, templates, and values files to get a comprehensive security analysis.
                    </p>
                    <Button
                      onClick={analyzeFiles}
                      className="w-full bg-teal-500 hover:bg-teal-600"
                      disabled={chartFiles.length === 0}
                    >
                      Analyze Chart Files
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="rounded-full bg-blue-100 p-3 w-fit mx-auto mb-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-blue-900">Syntax Preservation</h4>
                  <p className="text-sm text-blue-700">
                    Your YAML syntax and formatting will be preserved exactly as uploaded
                  </p>
                </div>
                <div className="text-center">
                  <div className="rounded-full bg-blue-100 p-3 w-fit mx-auto mb-2">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-blue-900">Multiple Formats</h4>
                  <p className="text-sm text-blue-700">
                    Support for .yaml, .yml files and various Helm chart structures
                  </p>
                </div>
                <div className="text-center">
                  <div className="rounded-full bg-blue-100 p-3 w-fit mx-auto mb-2">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-blue-900">Preview & Edit</h4>
                  <p className="text-sm text-blue-700">Preview uploaded files and make edits before analysis</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
