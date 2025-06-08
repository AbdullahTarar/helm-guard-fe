"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Download,
  Github,
  Eye,
  Code,
  Server,
  Database,
  Network,
  Lock,
  Clock,
  FileText,
  ExternalLink,
  Copy,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"

// Mock data - replace with actual API data
const mockScanResults = {
  repository: {
    name: "my-app-helm-chart",
    url: "https://github.com/username/my-app-helm-chart",
    branch: "main",
    lastCommit: "abc123f",
    scanDate: "2024-01-15T10:30:00Z",
  },
  summary: {
    totalIssues: 12,
    critical: 2,
    high: 3,
    medium: 4,
    low: 3,
    passed: 28,
    score: 75,
  },
  charts: [
    {
      name: "my-app",
      path: "charts/my-app",
      version: "1.2.3",
      issues: 8,
      resources: 12,
    },
    {
      name: "database",
      path: "charts/database",
      version: "2.1.0",
      issues: 4,
      resources: 6,
    },
  ],
  securityFindings: [
    {
      id: "SEC-001",
      severity: "critical",
      title: "Container running as root",
      description: "Container is configured to run as root user, which poses security risks",
      file: "charts/my-app/templates/deployment.yaml",
      line: 45,
      recommendation: "Set securityContext.runAsNonRoot: true and securityContext.runAsUser to a non-root UID",
      category: "Security Context",
    },
    {
      id: "SEC-002",
      severity: "critical",
      title: "Privileged container detected",
      description: "Container is running in privileged mode",
      file: "charts/my-app/templates/deployment.yaml",
      line: 52,
      recommendation: "Remove privileged: true unless absolutely necessary",
      category: "Security Context",
    },
    {
      id: "SEC-003",
      severity: "high",
      title: "Missing resource limits",
      description: "No CPU or memory limits specified",
      file: "charts/my-app/templates/deployment.yaml",
      line: 38,
      recommendation: "Add resources.limits.cpu and resources.limits.memory",
      category: "Resource Management",
    },
    {
      id: "SEC-004",
      severity: "high",
      title: "Insecure image tag",
      description: "Using 'latest' tag instead of specific version",
      file: "charts/my-app/values.yaml",
      line: 12,
      recommendation: "Use specific image tags instead of 'latest'",
      category: "Image Security",
    },
    {
      id: "SEC-005",
      severity: "medium",
      title: "Missing network policy",
      description: "No network policies defined for pod-to-pod communication",
      file: "charts/my-app/templates/",
      line: null,
      recommendation: "Add NetworkPolicy resources to restrict traffic",
      category: "Network Security",
    },
  ],
  resources: [
    { type: "Deployment", name: "my-app", namespace: "default", replicas: 3 },
    { type: "Service", name: "my-app-service", namespace: "default", ports: ["80", "443"] },
    { type: "ConfigMap", name: "my-app-config", namespace: "default", keys: 5 },
    { type: "Secret", name: "my-app-secrets", namespace: "default", keys: 3 },
    { type: "Ingress", name: "my-app-ingress", namespace: "default", hosts: ["app.example.com"] },
    { type: "PersistentVolumeClaim", name: "data-pvc", namespace: "default", size: "10Gi" },
  ],
  bestPractices: [
    {
      category: "Security",
      passed: 6,
      total: 10,
      items: [
        { name: "Non-root user", status: "failed", severity: "critical" },
        { name: "Read-only filesystem", status: "passed", severity: "medium" },
        { name: "No privileged containers", status: "failed", severity: "critical" },
        { name: "Resource limits set", status: "failed", severity: "high" },
        { name: "Image vulnerability scan", status: "passed", severity: "medium" },
        { name: "Secrets not in environment", status: "passed", severity: "high" },
      ],
    },
    {
      category: "Reliability",
      passed: 8,
      total: 10,
      items: [
        { name: "Health checks configured", status: "passed", severity: "high" },
        { name: "Resource requests set", status: "passed", severity: "medium" },
        { name: "Multiple replicas", status: "passed", severity: "medium" },
        { name: "Pod disruption budget", status: "failed", severity: "medium" },
        { name: "Graceful shutdown", status: "passed", severity: "low" },
      ],
    },
  ],
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-200"
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "low":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "critical":
      return <XCircle className="h-4 w-4" />
    case "high":
      return <AlertTriangle className="h-4 w-4" />
    case "medium":
      return <Info className="h-4 w-4" />
    case "low":
      return <Info className="h-4 w-4" />
    default:
      return <Info className="h-4 w-4" />
  }
}

const getResourceIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "deployment":
      return <Server className="h-4 w-4" />
    case "service":
      return <Network className="h-4 w-4" />
    case "configmap":
      return <FileText className="h-4 w-4" />
    case "secret":
      return <Lock className="h-4 w-4" />
    case "ingress":
      return <ExternalLink className="h-4 w-4" />
    case "persistentvolumeclaim":
      return <Database className="h-4 w-4" />
    default:
      return <Code className="h-4 w-4" />
  }
}

export default function ResultsPage() {
  const [selectedFinding, setSelectedFinding] = useState<string | null>(null)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
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
            <Shield className="h-6 w-6 text-teal-500" />
            <span className="font-bold">HelmGuard</span>
          </Link>
        </div>
      </header>

      <main className="container py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Scan Results</h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Github className="h-4 w-4" />
                <span>{mockScanResults.repository.name}</span>
                <span>•</span>
                <span>Branch: {mockScanResults.repository.branch}</span>
                <span>•</span>
                <Clock className="h-4 w-4" />
                <span>{new Date(mockScanResults.repository.scanDate).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Rescan
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Security Score Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-500" />
                Security Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl font-bold text-teal-600">{mockScanResults.summary.score}/100</div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Overall Security Rating</div>
                  <Badge className="bg-yellow-100 text-yellow-800">Needs Improvement</Badge>
                </div>
              </div>
              <Progress value={mockScanResults.summary.score} className="mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{mockScanResults.summary.critical}</div>
                  <div className="text-sm text-muted-foreground">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{mockScanResults.summary.high}</div>
                  <div className="text-sm text-muted-foreground">High</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{mockScanResults.summary.medium}</div>
                  <div className="text-sm text-muted-foreground">Medium</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{mockScanResults.summary.low}</div>
                  <div className="text-sm text-muted-foreground">Low</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{mockScanResults.summary.passed}</div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="security" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="security" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Security Issues
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="practices" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Best Practices
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Charts
              </TabsTrigger>
            </TabsList>

            {/* Security Issues Tab */}
            <TabsContent value="security" className="space-y-6">
              <div className="grid gap-4">
                {mockScanResults.securityFindings.map((finding) => (
                  <Card
                    key={finding.id}
                    className={`cursor-pointer transition-all ${
                      selectedFinding === finding.id ? "ring-2 ring-teal-500" : ""
                    }`}
                    onClick={() => setSelectedFinding(selectedFinding === finding.id ? null : finding.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{getSeverityIcon(finding.severity)}</div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{finding.title}</CardTitle>
                            <CardDescription className="mt-1">{finding.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(finding.severity)}>{finding.severity}</Badge>
                          <Badge variant="outline">{finding.category}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    {selectedFinding === finding.id && (
                      <CardContent className="pt-0">
                        <Separator className="mb-4" />
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Location</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                              <FileText className="h-4 w-4" />
                              <span>{finding.file}</span>
                              {finding.line && (
                                <>
                                  <span>:</span>
                                  <span>Line {finding.line}</span>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(finding.file)}
                                className="ml-auto h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Recommendation</h4>
                            <Alert>
                              <CheckCircle className="h-4 w-4" />
                              <AlertDescription>{finding.recommendation}</AlertDescription>
                            </Alert>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kubernetes Resources</CardTitle>
                  <CardDescription>Resources that will be created when this Helm chart is deployed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {mockScanResults.resources.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getResourceIcon(resource.type)}
                          <div>
                            <div className="font-medium">{resource.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {resource.type} • {resource.namespace}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {resource.replicas && <Badge variant="outline">{resource.replicas} replicas</Badge>}
                          {resource.ports && <Badge variant="outline">Ports: {resource.ports.join(", ")}</Badge>}
                          {resource.keys && <Badge variant="outline">{resource.keys} keys</Badge>}
                          {resource.size && <Badge variant="outline">{resource.size}</Badge>}
                          {resource.hosts && <Badge variant="outline">Host: {resource.hosts[0]}</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Best Practices Tab */}
            <TabsContent value="practices" className="space-y-6">
              <div className="grid gap-6">
                {mockScanResults.bestPractices.map((category, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {category.category}
                        <Badge variant="outline">
                          {category.passed}/{category.total} passed
                        </Badge>
                      </CardTitle>
                      <Progress value={(category.passed / category.total) * 100} className="mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {item.status === "passed" ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span>{item.name}</span>
                            </div>
                            <Badge className={getSeverityColor(item.severity)}>{item.severity}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Charts Tab */}
            <TabsContent value="charts" className="space-y-6">
              <div className="grid gap-4">
                {mockScanResults.charts.map((chart, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Code className="h-5 w-5 text-teal-500" />
                          {chart.name}
                        </div>
                        <Badge variant="outline">v{chart.version}</Badge>
                      </CardTitle>
                      <CardDescription>{chart.path}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{chart.issues}</div>
                          <div className="text-sm text-muted-foreground">Issues Found</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{chart.resources}</div>
                          <div className="text-sm text-muted-foreground">Resources</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
