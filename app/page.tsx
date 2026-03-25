import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-6 animate-fadeIn">
        <BookOpen size={64} className="text-gold mx-auto" />
        <h1 className="text-4xl font-bold text-cream">Book Club</h1>
        <p className="text-text-secondary max-w-md">
          Building a production grade book club platform
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
      </div>
    </main>
  );
}
