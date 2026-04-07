import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const systemItemTypes = [
  { name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { name: "command", icon: "Terminal", color: "#f97316", isSystem: true },
  { name: "note", icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "file", icon: "File", color: "#6b7280", isSystem: true },
  { name: "image", icon: "Image", color: "#ec4899", isSystem: true },
  { name: "link", icon: "Link", color: "#10b981", isSystem: true },
];

async function main() {
  console.log("Seeding system item types...");

  for (const type of systemItemTypes) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, userId: null },
    });
    if (!existing) {
      await prisma.itemType.create({ data: type });
    }
  }

  // Fetch system types for reference
  const [snippetType, promptType, commandType, linkType] = await Promise.all([
    prisma.itemType.findFirstOrThrow({ where: { name: "snippet", userId: null } }),
    prisma.itemType.findFirstOrThrow({ where: { name: "prompt", userId: null } }),
    prisma.itemType.findFirstOrThrow({ where: { name: "command", userId: null } }),
    prisma.itemType.findFirstOrThrow({ where: { name: "link", userId: null } }),
  ]);

  console.log("Seeding demo user...");

  const hashedPassword = await bcrypt.hash("12345678", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@devstash.io" },
    update: {},
    create: {
      email: "demo@devstash.io",
      name: "Demo User",
      password: hashedPassword,
      isPro: false,
      emailVerified: new Date(),
    },
  });

  console.log("Seeding collections and items...");

  // ── React Patterns ──────────────────────────────────────────────
  const reactPatterns = await prisma.collection.upsert({
    where: { id: "seed-react-patterns" },
    update: { isFavorite: true },
    create: {
      id: "seed-react-patterns",
      name: "React Patterns",
      description: "Reusable React patterns and hooks",
      isFavorite: true,
      userId: user.id,
      defaultTypeId: snippetType.id,
    },
  });

  const reactItems = await Promise.all([
    prisma.item.upsert({
      where: { id: "seed-react-1" },
      update: {},
      create: {
        id: "seed-react-1",
        title: "Custom Hooks",
        contentType: "TEXT",
        language: "typescript",
        content: `import { useState, useEffect, useCallback, useRef } from "react";

// useDebounce — delay state updates until the user stops typing
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// useLocalStorage — persist state in localStorage with SSR safety
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

// usePrevious — track the previous value of any state or prop
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => { ref.current = value; });
  return ref.current;
}`,
        description: "useDebounce, useLocalStorage, and usePrevious hooks",
        userId: user.id,
        itemTypeId: snippetType.id,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-react-2" },
      update: {},
      create: {
        id: "seed-react-2",
        title: "Component Patterns",
        contentType: "TEXT",
        language: "typescript",
        content: `import React, { createContext, useContext, useState } from "react";

// ── Context Provider Pattern ──────────────────────────────────
interface ThemeContextValue {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

// ── Compound Component Pattern ────────────────────────────────
interface CardProps { children: React.ReactNode; className?: string }

function Card({ children, className = "" }: CardProps) {
  return <div className={\`rounded-lg border bg-card \${className}\`}>{children}</div>;
}
Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pb-0">{children}</div>;
};
Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="p-6">{children}</div>;
};

export { Card };`,
        description: "Context provider and compound component patterns",
        userId: user.id,
        itemTypeId: snippetType.id,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-react-3" },
      update: {},
      create: {
        id: "seed-react-3",
        title: "Utility Functions",
        contentType: "TEXT",
        language: "typescript",
        content: `// cn — merge Tailwind classes safely (requires clsx + tailwind-merge)
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// formatDate — locale-aware date formatting
export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...opts,
  }).format(new Date(date));
}

// truncate — shorten a string and append ellipsis
export function truncate(str: string, length: number) {
  return str.length > length ? str.slice(0, length) + "…" : str;
}

// sleep — promise-based delay for async flows
export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));`,
        description: "cn, formatDate, truncate, and sleep utilities",
        userId: user.id,
        itemTypeId: snippetType.id,
      },
    }),
  ]);

  await Promise.all(
    reactItems.map((item) =>
      prisma.itemCollection.upsert({
        where: { itemId_collectionId: { itemId: item.id, collectionId: reactPatterns.id } },
        update: {},
        create: { itemId: item.id, collectionId: reactPatterns.id },
      })
    )
  );

  // ── AI Workflows ────────────────────────────────────────────────
  const aiWorkflows = await prisma.collection.upsert({
    where: { id: "seed-ai-workflows" },
    update: { isFavorite: true },
    create: {
      id: "seed-ai-workflows",
      name: "AI Workflows",
      description: "AI prompts and workflow automations",
      isFavorite: true,
      userId: user.id,
      defaultTypeId: promptType.id,
    },
  });

  const aiItems = await Promise.all([
    prisma.item.upsert({
      where: { id: "seed-ai-1" },
      update: {},
      create: {
        id: "seed-ai-1",
        title: "Code Review Prompt",
        contentType: "TEXT",
        content: `You are a senior software engineer performing a thorough code review. Review the following code and provide:

1. **Correctness** — identify bugs, edge cases, or logic errors
2. **Security** — flag any OWASP Top 10 vulnerabilities or insecure patterns
3. **Performance** — note inefficiencies, N+1 queries, or unnecessary re-renders
4. **Readability** — suggest naming improvements and simplifications
5. **Best practices** — highlight deviations from language/framework conventions

Format your response as a structured list grouped by severity: Critical, Major, Minor, and Suggestions.

Code to review:
\`\`\`
{{code}}
\`\`\``,
        description: "Structured code review covering correctness, security, performance, and best practices",
        userId: user.id,
        itemTypeId: promptType.id,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-ai-2" },
      update: {},
      create: {
        id: "seed-ai-2",
        title: "Documentation Generation",
        contentType: "TEXT",
        content: `Generate comprehensive documentation for the following code. Include:

- **Overview** — what this module/function does in plain English
- **Parameters** — name, type, description, and whether required or optional
- **Return value** — type and description
- **Throws** — any errors or exceptions that may be raised
- **Example usage** — a realistic, runnable code example
- **Notes** — edge cases, performance considerations, or caveats

Use JSDoc format for functions. Keep the tone concise and developer-friendly.

Code:
\`\`\`
{{code}}
\`\`\``,
        description: "Generate JSDoc-style documentation with examples and edge cases",
        userId: user.id,
        itemTypeId: promptType.id,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-ai-3" },
      update: {},
      create: {
        id: "seed-ai-3",
        title: "Refactoring Assistance",
        contentType: "TEXT",
        content: `Refactor the following code to improve quality without changing its external behavior. Focus on:

1. **Eliminate duplication** — extract repeated logic into reusable functions
2. **Simplify conditionals** — use early returns, guard clauses, and ternaries where appropriate
3. **Improve naming** — rename variables and functions to clearly express intent
4. **Reduce complexity** — break long functions into smaller, single-responsibility units
5. **Modern syntax** — apply language features that improve readability (destructuring, optional chaining, etc.)

Provide the refactored code followed by a brief explanation of each change made.

Code to refactor:
\`\`\`
{{code}}
\`\`\``,
        description: "Guided refactoring prompt focusing on duplication, naming, and complexity",
        userId: user.id,
        itemTypeId: promptType.id,
      },
    }),
  ]);

  await Promise.all(
    aiItems.map((item) =>
      prisma.itemCollection.upsert({
        where: { itemId_collectionId: { itemId: item.id, collectionId: aiWorkflows.id } },
        update: {},
        create: { itemId: item.id, collectionId: aiWorkflows.id },
      })
    )
  );

  // ── DevOps ──────────────────────────────────────────────────────
  const devops = await prisma.collection.upsert({
    where: { id: "seed-devops" },
    update: {},
    create: {
      id: "seed-devops",
      name: "DevOps",
      description: "Infrastructure and deployment resources",
      userId: user.id,
      defaultTypeId: snippetType.id,
    },
  });

  const devopsItems = await Promise.all([
    prisma.item.upsert({
      where: { id: "seed-devops-1" },
      update: {},
      create: {
        id: "seed-devops-1",
        title: "Docker + GitHub Actions CI",
        contentType: "TEXT",
        language: "yaml",
        content: `# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: \${{ github.ref == 'refs/heads/main' }}
          tags: ghcr.io/\${{ github.repository }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max`,
        description: "GitHub Actions workflow for building and pushing Docker images to GHCR",
        userId: user.id,
        itemTypeId: snippetType.id,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-devops-2" },
      update: {},
      create: {
        id: "seed-devops-2",
        title: "Deploy to Production",
        contentType: "TEXT",
        content: `#!/usr/bin/env bash
set -euo pipefail

APP="devstash"
REGISTRY="ghcr.io/your-org/\${APP}"
TAG="\${1:-latest}"

echo "Pulling \${REGISTRY}:\${TAG}..."
docker pull "\${REGISTRY}:\${TAG}"

echo "Stopping old container..."
docker stop "\${APP}" 2>/dev/null || true
docker rm   "\${APP}" 2>/dev/null || true

echo "Starting new container..."
docker run -d \\
  --name "\${APP}" \\
  --restart unless-stopped \\
  -p 3000:3000 \\
  --env-file /etc/\${APP}/.env \\
  "\${REGISTRY}:\${TAG}"

echo "Deploy complete — running \${TAG}"`,
        description: "Shell script to pull and restart a Docker container on a remote server",
        userId: user.id,
        itemTypeId: commandType.id,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-devops-3" },
      update: {},
      create: {
        id: "seed-devops-3",
        title: "Docker Documentation",
        contentType: "URL",
        url: "https://docs.docker.com/get-started/",
        description: "Official Docker getting-started guide",
        userId: user.id,
        itemTypeId: linkType.id,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-devops-4" },
      update: {},
      create: {
        id: "seed-devops-4",
        title: "GitHub Actions Docs",
        contentType: "URL",
        url: "https://docs.github.com/en/actions",
        description: "Official GitHub Actions documentation",
        userId: user.id,
        itemTypeId: linkType.id,
      },
    }),
  ]);

  await Promise.all(
    devopsItems.map((item) =>
      prisma.itemCollection.upsert({
        where: { itemId_collectionId: { itemId: item.id, collectionId: devops.id } },
        update: {},
        create: { itemId: item.id, collectionId: devops.id },
      })
    )
  );

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
