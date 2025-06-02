"use client"

import type React from "react"

import { useState } from "react"
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
}

export function GitHubIntegrationModal({ open, onOpenChange }: GitHubIntegrationModalProps) {
  const [publicRepoUrl, setPublicRepoUrl] = useState("")
  const [isValidUrl, setIsValidUrl] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  // GitHub OAuth configuration (these would come from your environment variables)
  const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "your_github_client_id"
  const REDIRECT_URI = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI || "https://yourdomain.com/api/github/callback"

  const validateGitHubUrl = (url: string) => {
    const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/
    const isValid = githubUrlPattern.test(url.trim())
    setIsValidUrl(isValid)
    return isValid
  }

  const handlePublicRepoSubmit = () => {
    if (validateGitHubUrl(publicRepoUrl)) {
      setIsConnecting(true)
      // Here you would send the public repo URL to your backend
      console.log("Connecting to public repo:", publicRepoUrl)

      // Simulate API call
      setTimeout(() => {
        setIsConnecting(false)
        onOpenChange(false)
        // Redirect to analysis page or show success
      }, 2000)
    }
  }

  const handlePrivateRepoConnect = () => {
    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15)

    // Store state in localStorage or session for validation later
    localStorage.setItem("github_oauth_state", state)

    // Construct GitHub OAuth URL
    const githubAuthUrl = new URL("https://github.com/login/oauth/authorize")
    githubAuthUrl.searchParams.append("client_id", GITHUB_CLIENT_ID)
    githubAuthUrl.searchParams.append("redirect_uri", REDIRECT_URI)
    githubAuthUrl.searchParams.append("scope", "repo")
    githubAuthUrl.searchParams.append("state", state)

    // Redirect to GitHub OAuth
    window.location.href = githubAuthUrl.toString()
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setPublicRepoUrl(url)
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
                  For private repositories, we need GitHub OAuth permission to securely access your code.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
