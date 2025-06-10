"use client"

import { useEffect, useState } from "react"
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
  ArrowLeft,
  Shield,
  Filter,
  SortAsc,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [filteredRepos, setFilteredRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [filterType, setFilterType] = useState<"all" | "public" | "private">("all")
  const [sortBy, setSortBy] = useState<"name" | "updated" | "stars">("updated")

  const router = useRouter()
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

  useEffect(() => {
    fetchRepos()
  }, [])

  useEffect(() => {
    let filtered = repos

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (repo) =>
          repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          repo.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((repo) => (filterType === "private" ? repo.private : !repo.private))
    }

    // Sort repositories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "stars":
          return b.stargazers_count - a.stargazers_count
        case "updated":
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
    })

    setFilteredRepos(filtered)
  }, [searchTerm, repos, filterType, sortBy])

  const fetchRepos = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${BACKEND_URL}/api/github/repos`, {
        method: "GET",
        credentials: "include",
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
  // repoFullName should be "AbdullahTarar/node-helm-chart"
  console.log("Scanning repo:", repoFullName); // Debug log

  setSelectedRepo(repoFullName);
  setIsScanning(true);

  try {
    const response = await fetch(`${BACKEND_URL}/api/scan/private`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoUrl: `https://github.com/${repoFullName}`, // ✅ Correct format
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to start scan");
    }

    const { id } = await response.json();
    router.push(`/results?id=${id}`); // Redirect to results page
  } catch (err) {
    setError(err instanceof Error ? err.message : "Scan failed");
  } finally {
    setIsScanning(false);
  }
};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      JavaScript: "bg-yellow-500",
      TypeScript: "bg-blue-500",
      Python: "bg-green-500",
      Go: "bg-cyan-500",
      Java: "bg-red-500",
      "C#": "bg-purple-500",
      PHP: "bg-indigo-500",
      Ruby: "bg-red-600",
      Rust: "bg-orange-600",
      Swift: "bg-orange-500",
    }
    return colors[language] || "bg-gray-500"
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
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Github className="h-8 w-8 text-gray-900" />
              Select a Repository to Scan
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose a repository from your GitHub account to scan for Helm chart security vulnerabilities and best
              practices.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-teal-500 mb-4" />
              <p className="text-muted-foreground text-lg">Loading your repositories...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search and Filter Bar */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search repositories by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Filter by Type */}
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as "all" | "public" | "private")}
                        className="px-3 py-2 border rounded-md text-sm"
                      >
                        <option value="all">All Repositories</option>
                        <option value="public">Public Only</option>
                        <option value="private">Private Only</option>
                      </select>
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4 text-muted-foreground" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "name" | "updated" | "stars")}
                        className="px-3 py-2 border rounded-md text-sm"
                      >
                        <option value="updated">Recently Updated</option>
                        <option value="name">Name</option>
                        <option value="stars">Most Stars</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Repository Stats */}
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {filteredRepos.length} {filteredRepos.length === 1 ? "repository" : "repositories"} found
                </p>
                <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected to GitHub
                </Badge>
              </div>

              {/* Repository Grid */}
              {filteredRepos.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Github className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No repositories found</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      {searchTerm
                        ? "No repositories match your search criteria. Try adjusting your search or filters."
                        : "No repositories found in your GitHub account."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredRepos.map((repo) => (
                    <Card
                      key={repo.full_name}
                      className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                        selectedRepo === repo.full_name
                          ? "border-teal-500 bg-teal-50"
                          : "border-transparent hover:border-teal-200"
                      }`}
                      onClick={() => !isScanning && handleRepoSelect(repo.full_name)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="flex items-center gap-2 text-lg truncate">
                              {repo.private ? (
                                <Lock className="h-4 w-4 text-orange-500 flex-shrink-0" />
                              ) : (
                                <Globe className="h-4 w-4 text-green-500 flex-shrink-0" />
                              )}
                              <span className="truncate">{repo.name}</span>
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {repo.private ? "Private" : "Public"}
                              </Badge>
                              {repo.language && (
                                <Badge variant="outline" className="text-xs">
                                  <div className={`w-2 h-2 rounded-full mr-1 ${getLanguageColor(repo.language)}`}></div>
                                  {repo.language}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {selectedRepo === repo.full_name && isScanning ? (
                            <div className="flex items-center gap-2 text-teal-600">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 flex-shrink-0"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-sm mb-3 line-clamp-2">
                          {repo.description || "No description available"}
                        </CardDescription>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
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
                            {formatDate(repo.updated_at)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h4 className="font-medium text-blue-900 mb-4 flex items-center gap-2">
                <Info className="h-4 w-4" />
                What happens when you select a repository?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-600 flex-shrink-0" />
                  <span>Scan repository for Helm charts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-600 flex-shrink-0" />
                  <span>Analyze security vulnerabilities</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-600 flex-shrink-0" />
                  <span>Check best practices compliance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-600 flex-shrink-0" />
                  <span>Generate detailed security report</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
