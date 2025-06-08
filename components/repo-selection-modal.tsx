"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Github,
  Loader2,
  Search,
  Lock,
  Globe,
  Star,
  GitBranch,
  Calendar,
  ArrowRight,
  Info,
  CheckCircle,
} from "lucide-react"

interface Repo {
  name: string
  full_name: string
  html_url: string
  private: boolean
  description: string
  stargazers_count: number
  updated_at: string
  default_branch: string
  language: string
}

interface RepoSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRepoSelected: (repo: string) => void
}

export function RepoSelectionModal({ open, onOpenChange, onRepoSelected }: RepoSelectionModalProps) {
  const [repos, setRepos] = useState<Repo[]>([])
  const [filteredRepos, setFilteredRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

  useEffect(() => {
    if (open) {
      fetchRepos()
    }
  }, [open])

  useEffect(() => {
    if (searchTerm) {
      setFilteredRepos(
        repos.filter(
          (repo) =>
            repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            repo.description?.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )
    } else {
      setFilteredRepos(repos)
    }
  }, [searchTerm, repos])

const fetchRepos = async () => {
  try {
    setLoading(true)
    setError(null)

    const response = await fetch('http://localhost:8080/api/github/repos', {
      method: "GET",
      credentials: "include", // Important for cookies
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    setRepos(data)
    setFilteredRepos(data)
  } catch (err) {
    setError(err instanceof Error ? err.message : "Unknown error occurred")
  } finally {
    setLoading(false)
  }
}
  const handleRepoSelect = async (repoFullName: string) => {
    setSelectedRepo(repoFullName)
    setIsScanning(true)

    try {
      // Call your backend to start scanning the selected repo
      const response = await fetch(`${BACKEND_URL}/api/scan/private`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoFullName: repoFullName,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to start repository scan")
      }

      const results = await response.json()
      onRepoSelected(repoFullName)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan repository")
      setSelectedRepo(null)
    } finally {
      setIsScanning(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Github className="h-6 w-6 text-gray-900" />
            Select a Repository to Scan
          </DialogTitle>
          <DialogDescription>
            Choose a repository from your GitHub account to scan for Helm chart security vulnerabilities.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500 mb-4" />
            <p className="text-muted-foreground">Loading your repositories...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Repository Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredRepos.length} {filteredRepos.length === 1 ? "repository" : "repositories"} found
              </p>
              <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected to GitHub
              </Badge>
            </div>

            {/* Repository List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredRepos.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Github className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      {searchTerm ? "No repositories match your search." : "No repositories found."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredRepos.map((repo) => (
                  <Card
                    key={repo.full_name}
                    className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                      selectedRepo === repo.full_name
                        ? "border-teal-500 bg-teal-50"
                        : "border-transparent hover:border-teal-200"
                    }`}
                    onClick={() => !isScanning && handleRepoSelect(repo.full_name)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            {repo.private ? (
                              <Lock className="h-4 w-4 text-orange-500" />
                            ) : (
                              <Globe className="h-4 w-4 text-green-500" />
                            )}
                            {repo.name}
                            <Badge variant="outline" className="text-xs">
                              {repo.private ? "Private" : "Public"}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {repo.description || "No description available"}
                          </CardDescription>
                        </div>
                        {selectedRepo === repo.full_name && isScanning ? (
                          <div className="flex items-center gap-2 text-teal-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Scanning...</span>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                          >
                            Select <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {repo.language && (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            {repo.language}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {repo.stargazers_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          {repo.default_branch}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Updated {formatDate(repo.updated_at)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            What happens next?
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-blue-600" />
              We'll scan your repository for Helm charts
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-blue-600" />
              Analyze security vulnerabilities
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-blue-600" />
              Check for best practices
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-blue-600" />
              Generate detailed report
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
