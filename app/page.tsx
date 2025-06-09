'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Github, Shield, Eye, AlertTriangle, CheckCircle, Code, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GitHubIntegrationModal } from "@/components/github-integration-modal";
import { RepoSelectionModal } from "@/components/repo-selection-modal";
import Link from "next/link";
import { Suspense } from "react"

export default function Home() {
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isReposelectionOpen, setIsReposelectionOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure we're on the client
      const params = new URLSearchParams(window.location.search);
      const auth = params.get('auth');
      if (auth === 'success') {
        setIsReposelectionOpen(true);
      }
    }
  }, []);


  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-teal-500" />
              <span className="inline-block font-bold">HelmGuard</span>
            </Link>
            <nav className="hidden gap-6 md:flex">
              <Link
                href="#features"
                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                How It Works
              </Link>
              <Link
                href="#benefits"
                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Benefits
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="h-9 gap-1" onClick={() => setIsGitHubModalOpen(true)}>
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </Button>
              <Link href="/upload">
                <Button size="sm" className="h-9 bg-teal-500 hover:bg-teal-600 gap-1">
                  <Upload className="h-4 w-4" />
                  Upload Chart
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Enhanced Hero Section with Luminous Effects */}
        <section className="hero-section relative overflow-hidden space-y-6 pb-8 pt-10 md:pb-12 md:pt-16 lg:py-32">
          {/* Animated Background */}
          <div className="hero-background">
            {/* Main gradient orbs */}
            <div className="hero-orb hero-orb-1"></div>
            <div className="hero-orb hero-orb-2"></div>
            <div className="hero-orb hero-orb-3"></div>

            {/* Floating particles */}
            <div className="hero-particle hero-particle-1"></div>
            <div className="hero-particle hero-particle-2"></div>
            <div className="hero-particle hero-particle-3"></div>
            <div className="hero-particle hero-particle-4"></div>
            <div className="hero-particle hero-particle-5"></div>
            <div className="hero-particle hero-particle-6"></div>

            {/* Geometric shapes */}
            <div className="hero-shape hero-shape-1"></div>
            <div className="hero-shape hero-shape-2"></div>

            {/* Grid overlay */}
            <div className="hero-grid"></div>
          </div>

          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center relative z-10">
            <div className="hero-badge rounded-2xl bg-teal-500/10 px-4 py-1.5 text-sm font-medium text-teal-500">
              Open Source Helm Security
            </div>
            <h1 className="hero-title text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Secure Your Kubernetes <span className="hero-highlight text-teal-500">Helm Charts</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Connect your GitHub repository and scan your Helm charts for security vulnerabilities, syntax errors, and
              best practices. Visualize what your charts will create before deployment.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                className="hero-button-primary bg-teal-500 hover:bg-teal-600 gap-2"
                onClick={() => setIsGitHubModalOpen(true)}
              >
                Connect GitHub <ArrowRight className="h-4 w-4" />
              </Button>
              <Link href="/upload">
                <Button variant="outline" size="lg" className="hero-button-secondary">
                  Upload Chart
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container space-y-6 py-8 md:py-12 lg:py-24" id="features">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Key Features</h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Our tool provides comprehensive analysis of your Helm charts to ensure security and reliability
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                <Eye className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="mt-4 text-xl font-bold">Visualization</h3>
              <p className="mt-2 text-muted-foreground">
                Preview exactly what resources your Helm chart will create in your Kubernetes cluster
              </p>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                <AlertTriangle className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="mt-4 text-xl font-bold">Security Analysis</h3>
              <p className="mt-2 text-muted-foreground">
                Identify security vulnerabilities and misconfigurations before deployment
              </p>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                <Code className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="mt-4 text-xl font-bold">Syntax Validation</h3>
              <p className="mt-2 text-muted-foreground">
                Catch syntax errors and formatting issues in your Helm templates
              </p>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                <Github className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="mt-4 text-xl font-bold">GitHub Integration</h3>
              <p className="mt-2 text-muted-foreground">
                Seamlessly connect to your GitHub repositories for continuous scanning
              </p>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                <CheckCircle className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="mt-4 text-xl font-bold">Best Practices</h3>
              <p className="mt-2 text-muted-foreground">
                Recommendations for following Kubernetes and Helm best practices
              </p>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                <Shield className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="mt-4 text-xl font-bold">Compliance Checks</h3>
              <p className="mt-2 text-muted-foreground">
                Ensure your deployments meet industry security standards and compliance requirements
              </p>
            </div>
          </div>
        </section>

        <section className="container py-8 md:py-12 lg:py-24" id="how-it-works">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">How It Works</h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Simple, powerful workflow to secure your Kubernetes deployments
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="mt-4 text-xl font-bold">Connect Repository</h3>
              <p className="mt-2 text-muted-foreground">
                Link your GitHub repository containing Helm charts to our platform
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="mt-4 text-xl font-bold">Automated Scanning</h3>
              <p className="mt-2 text-muted-foreground">
                Our tool analyzes your Helm charts for security issues and visualizes resources
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="mt-4 text-xl font-bold">Review & Fix</h3>
              <p className="mt-2 text-muted-foreground">
                Get detailed reports and recommendations to improve your Helm charts
              </p>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-8 md:py-12 lg:py-24" id="benefits">
          <div className="container">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Why Use HelmGuard?</h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Secure your Kubernetes deployments and save time with our comprehensive analysis
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
              <div className="rounded-lg border bg-background p-6">
                <h3 className="text-xl font-bold">Prevent Security Incidents</h3>
                <p className="mt-2 text-muted-foreground">
                  Identify and fix security vulnerabilities before they reach production environments
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6">
                <h3 className="text-xl font-bold">Save Development Time</h3>
                <p className="mt-2 text-muted-foreground">
                  Catch issues early in the development cycle, reducing debugging and rework time
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6">
                <h3 className="text-xl font-bold">Improve Deployment Confidence</h3>
                <p className="mt-2 text-muted-foreground">
                  Know exactly what resources will be created before applying changes to your cluster
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6">
                <h3 className="text-xl font-bold">Enforce Best Practices</h3>
                <p className="mt-2 text-muted-foreground">
                  Ensure your team follows Kubernetes and security best practices consistently
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              Ready to Secure Your Helm Charts?
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Join the community of developers who trust HelmGuard for their Kubernetes security
            </p>
            <Button size="lg" className="mt-4 bg-teal-500 hover:bg-teal-600" onClick={() => setIsGitHubModalOpen(true)}>
              Get Started for Free
            </Button>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-teal-500" />
            <p className="text-sm leading-loose text-center md:text-left">
              &copy; {new Date().getFullYear()} HelmGuard. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              GitHub
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Documentation
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>

      {/* GitHub Integration Modal */}
      <GitHubIntegrationModal open={isGitHubModalOpen} onOpenChange={setIsGitHubModalOpen} />
      <Suspense fallback={<div>Loading...</div>}>
        <RepoSelectionModal
        open={isReposelectionOpen}
        onOpenChange={setIsReposelectionOpen}
        onRepoSelected={(repo) => {
          console.log("scanning repo", repo)
          setIsReposelectionOpen(false)
        }}
      />
      </Suspense>

    </div>
  )
}
