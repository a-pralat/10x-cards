import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

interface HeaderProps {
  user?: {
    email: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  const [currentPath, setCurrentPath] = useState("/");

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        window.location.href = "/login";
      } else {
        console.error("Failed to logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleTabChange = (value: string) => {
    window.location.href = value;
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <a href="/" className="text-xl font-bold">
            10x Cards
          </a>
          {user && (
            <Tabs value={currentPath} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="/generate">Generate Flashcards</TabsTrigger>
                <TabsTrigger value="/flashcards">My Flashcards</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" onClick={handleLogout}>
                Sign out
              </Button>
            </>
          ) : (
            <Button variant="outline" asChild>
              <a href="/login">Sign in</a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
