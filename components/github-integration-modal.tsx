"use client"

import { useState , useEffect} from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Github,
  Lock,
  Globe,
  Shield,
  ArrowRight,
  Info,
  CheckCircle,
  ExternalLink,
  GitBranch,
  Folder,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GitHubIntegrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanComplete?: (results: any) => void // Add this prop
}

export function GitHubIntegrationModal({ open, onOpenChange, onScanComplete }: GitHubIntegrationModalProps) {
  const [publicRepoUrl, setPublicRepoUrl] = useState("")
  const [isValidUrl, setIsValidUrl] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanProgress, setScanProgress] = useState<string>("")
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);


  // Update these to match your backend configuration
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
  const GITHUB_REDIRECT_URI = `${BACKEND_URL}/api/github/callback`

  const validateGitHubUrl = (url: string) => {
    const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/
    const isValid = githubUrlPattern.test(url.trim())
    setIsValidUrl(isValid)
    return isValid
  }
  
      useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/status`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.authenticated || false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    if (open) {
      checkAuthStatus();
    }
  }, [open]);

  const handlePublicRepoSubmit = async () => {
    if (!validateGitHubUrl(publicRepoUrl)) return
    
    setIsConnecting(true)
    setError(null)
    setScanProgress("Starting scan...")

    try {
      console.log('Starting scan for:', publicRepoUrl)
      
      // 1. Start the scan and get scan ID
      const response = await fetch(`${BACKEND_URL}/api/scan/public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl: publicRepoUrl
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Scan start failed:', response.status, errorText)
        throw new Error(`Failed to start scan: ${response.status} ${errorText}`)
      }

      const scanData = await response.json()
      console.log('Scan started:', scanData)
      
      const { id, status, message } = scanData
      
      if (status === 'failed') {
        throw new Error(message || 'Scan failed to start')
      }

      if (!id) {
        throw new Error('No scan ID returned from server')
      }

      setScanProgress("Scan started, waiting for completion...")

      // 2. Poll for results with better error handling
      const pollResults = async (scanId: string, attempt: number = 1): Promise<any> => {
        const maxAttempts = 30 // 60 seconds max
        
        if (attempt > maxAttempts) {
          throw new Error('Scan timeout - please try again')
        }

        try {
          console.log(`Polling attempt ${attempt} for scan ${scanId}`)
          setScanProgress(`Checking scan progress... (${attempt}/${maxAttempts})`)
          
          const res = await fetch(`${BACKEND_URL}/api/scan/results/${scanId}`)
          console.log('Poll response status:', res.status)
          
          if (!res.ok) {
            if (res.status === 404) {
              console.log('Scan not found yet, retrying...')
              await new Promise(resolve => setTimeout(resolve, 2000))
              return pollResults(scanId, attempt + 1)
            }
            throw new Error(`Failed to fetch scan status: ${res.status}`)
          }

          const data = await res.json()
          console.log('Poll response data:', data)
          
          switch (data.status) {
            case 'completed':
              console.log('Scan completed successfully')
              setScanProgress("Scan completed!")
              return data
            case 'failed':
              throw new Error(data.errorMessage || 'Scan failed')
            case 'processing':
              console.log('Scan still processing...')
              // Continue polling after delay
              await new Promise(resolve => setTimeout(resolve, 2000))
              return pollResults(scanId, attempt + 1)
            default:
              console.log('Unknown status:', data.status)
              await new Promise(resolve => setTimeout(resolve, 2000))
              return pollResults(scanId, attempt + 1)
          }
        } catch (err) {
          console.error('Polling error:', err)
          if (attempt < 3) {
            // Retry a few times for network errors
            await new Promise(resolve => setTimeout(resolve, 2000))
            return pollResults(scanId, attempt + 1)
          }
          throw err
        }
      }

      // 3. Start polling and wait for results
      const results = await pollResults(id)
      
      console.log('Final results:', results)

      // 4. Handle completed results
      if (onScanComplete) {
        onScanComplete(results)
      }

      // 5. Store results and navigate - KEY FIX HERE
      try {
        localStorage.setItem('scanResults', JSON.stringify(results))
        localStorage.setItem('scanId', id)
        console.log('Results stored in localStorage with scanId:', id)
      } catch (storageError) {
        console.error('Failed to store in localStorage:', storageError)
        // Continue anyway, the results page can fetch from API
      }

      // 6. Navigate to results page with scan ID in URL - IMPORTANT FIX
      const resultsUrl = `/results?id=${id}&type=public`;
      console.log('Navigating to:', resultsUrl);
      window.location.href = resultsUrl;
      
    } catch (err) {
      console.error('Scan failed:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      setScanProgress("")
    } finally {
      setIsConnecting(false)
    }
  }

  const handlePrivateRepoConnect = () => {
    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15)

    // Store state in localStorage for validation later
    localStorage.setItem("github_oauth_state", state)

    // Redirect to backend's GitHub auth endpoint
    window.location.href = `${BACKEND_URL}/api/github/auth?state=${state}&redirect_uri=${encodeURIComponent(window.location.origin + '/repositories')}`;
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setPublicRepoUrl(url)
    setError(null)
    if (url) {
      validateGitHubUrl(url)
    } else {
      setIsValidUrl(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Github className="h-6 w-6 text-gray-900" />
            Connect GitHub Repository
          </DialogTitle>
          <DialogDescription>
            Connect your GitHub repository to scan Helm charts for security vulnerabilities and best practices.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="public" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="public" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Public Repository
            </TabsTrigger>
            <TabsTrigger value="private" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Private Repository
            </TabsTrigger>
          </TabsList>

          <TabsContent value="public" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-600" />
                  Public Repository Access
                </CardTitle>
                <CardDescription>
                  For public repositories, simply provide the GitHub URL. No authentication required.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="repo-url">GitHub Repository URL</Label>
                  <Input
                    id="repo-url"
                    type="url"
                    placeholder="https://github.com/username/repository-name"
                    value={publicRepoUrl}
                    onChange={handleUrlChange}
                    className={`${
                      publicRepoUrl && !isValidUrl ? "border-red-500 focus:border-red-500" : ""
                    } ${publicRepoUrl && isValidUrl ? "border-green-500 focus:border-green-500" : ""}`}
                  />
                  {publicRepoUrl && !isValidUrl && (
                    <p className="text-sm text-red-600">Please enter a valid GitHub repository URL</p>
                  )}
                  {publicRepoUrl && isValidUrl && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Valid GitHub repository URL
                    </p>
                  )}
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Example:</strong> https://github.com/kubernetes/helm or
                    https://github.com/your-org/your-repo
                  </AlertDescription>
                </Alert>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>We only read your repository. No modifications are made.</span>
                  </div>
                  <Button
                    onClick={handlePublicRepoSubmit}
                    disabled={!isValidUrl || isConnecting}
                    className="bg-teal-500 hover:bg-teal-600"
                  >
                    {isConnecting ? (
                      "Connecting..."
                    ) : (
                      <>
                        Connect Repository <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="private" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-blue-600" />
                  Private Repository Access
                </CardTitle>
                <CardDescription>
                  {isAuthenticated 
                    ? "You're connected to GitHub. Go to repositories to select and scan your private repos."
                    : "For private repositories, we need GitHub OAuth permission to securely access your code."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {authLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : isAuthenticated ? (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        GitHub Connected Successfully!
                      </h4>
                      <p className="text-sm text-green-800">
                        You can now access and scan your private repositories.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                        <Badge variant="secondary" className="bg-gray-100">
                          <Folder className="h-3 w-3 mr-1" />
                          Permission: Read-only
                        </Badge>
                      </div>

                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Ready to scan:</strong> Your GitHub account is connected. You can now browse and scan your private repositories.
                        </AlertDescription>
                      </Alert>
                    </div>

                    <Separator />

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button
                        onClick={() => {
                          onOpenChange(false);
                          window.location.href = '/repositories';
                        }}
                        className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
                        size="lg"
                      >
                        <Folder className="h-5 w-5 mr-2" />
                        Go to Repositories
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">What happens when you connect?</h4>
                      <ul className="space-y-1 text-sm text-blue-800">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          You'll be redirected to GitHub for secure authentication
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          We'll request read-only access to your repositories
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          You can revoke access anytime from your GitHub settings
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-gray-100">
                          <GitBranch className="h-3 w-3 mr-1" />
                          Scope: Repository Access
                        </Badge>
                        <Badge variant="secondary" className="bg-gray-100">
                          <Folder className="h-3 w-3 mr-1" />
                          Permission: Read-only
                        </Badge>
                      </div>

                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Security Promise:</strong> We never modify your code or store your repository contents. We
                          only scan for Helm charts and analyze them for security issues.
                        </AlertDescription>
                      </Alert>
                    </div>

                    <Separator />

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button
                        onClick={handlePrivateRepoConnect}
                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                        size="lg"
                      >
                        <Github className="h-5 w-5 mr-2" />
                        Connect with GitHub
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      By connecting, you agree to our secure access to scan your Helm charts for security analysis.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            What we'll scan for:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Security vulnerabilities
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Syntax errors
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Best practices compliance
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Resource visualization
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}