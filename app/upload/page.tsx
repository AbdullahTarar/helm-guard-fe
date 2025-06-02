"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileArchive, FolderOpen, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface UploadedFile {
  file: File
  preview?: string
  status: "pending" | "success" | "error"
  error?: string
}

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const onDropTgz = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      status: "pending" as const,
    }))
    setUploadedFiles((prev) => [...prev, ...newFiles])
  }, [])

  const {
    getRootProps: getTgzRootProps,
    getInputProps: getTgzInputProps,
    isDragActive: isTgzDragActive,
  } = useDropzone({
    onDrop: onDropTgz,
    accept: {
      "application/gzip": [".tgz"],
      "application/x-gzip": [".tgz"],
      "application/x-tar": [".tar.gz"],
    },
    multiple: false,
  })

  const analyzeChart = async () => {
    setIsAnalyzing(true)
    // Simulate analysis
    setTimeout(() => {
      setUploadedFiles((prev) => prev.map((file) => ({ ...file, status: "success" as const })))
      setIsAnalyzing(false)
    }, 2000)
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <div className="flex-1" />
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">HelmGuard</span>
          </Link>
        </div>
      </header>

      <main className="container py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Upload Helm Chart for Analysis</h1>
            <p className="text-muted-foreground">
              Choose how you'd like to upload your Helm chart for security analysis
            </p>
          </div>

          <Tabs defaultValue="tgz" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tgz" className="flex items-center gap-2">
                <FileArchive className="h-4 w-4" />
                Packaged Chart (.tgz)
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Individual Files
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tgz" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileArchive className="h-5 w-5 text-teal-500" />
                    Upload Packaged Helm Chart
                  </CardTitle>
                  <CardDescription>
                    Upload a .tgz file containing your packaged Helm chart. This is the easiest way to analyze your
                    complete chart.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    {...getTgzRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isTgzDragActive ? "border-teal-500 bg-teal-50" : "border-gray-300 hover:border-teal-400"
                    }`}
                  >
                    <input {...getTgzInputProps()} />
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    {isTgzDragActive ? (
                      <p className="text-teal-600">Drop the .tgz file here...</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-lg font-medium">Drag & drop your .tgz file here</p>
                        <p className="text-sm text-muted-foreground">or click to browse files</p>
                        <div className="flex justify-center gap-2 mt-4">
                          <Badge variant="secondary">.tgz</Badge>
                          <Badge variant="secondary">.tar.gz</Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h3 className="font-medium">Uploaded Files</h3>
                      {uploadedFiles.map((uploadedFile, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileArchive className="h-5 w-5 text-teal-500" />
                            <div>
                              <p className="font-medium">{uploadedFile.file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {uploadedFile.status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {uploadedFile.status === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
                            <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}

                      <Button
                        onClick={analyzeChart}
                        disabled={isAnalyzing}
                        className="w-full bg-teal-500 hover:bg-teal-600"
                      >
                        {isAnalyzing ? "Analyzing Chart..." : "Analyze Helm Chart"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-teal-500" />
                    Upload Individual Files
                  </CardTitle>
                  <CardDescription>
                    Upload individual files from your Helm chart for more granular control.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      For individual file uploads, please use the dedicated file upload page.
                    </p>
                    <Link href="/upload/files">
                      <Button variant="outline" className="gap-2">
                        <FolderOpen className="h-4 w-4" />
                        Go to File Upload
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <Upload className="h-4 w-4 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-blue-900">What happens after upload?</h3>
                  <p className="text-sm text-blue-700">
                    Your Helm chart will be analyzed for security vulnerabilities, syntax errors, and best practices.
                    You'll receive a detailed report with recommendations and visualizations of what resources will be
                    created.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
