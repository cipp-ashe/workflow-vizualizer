// This is a test file to check if TypeScript is still analyzing node_modules
console.log("TypeScript is working correctly");

// Import something from the project to ensure TypeScript is still analyzing project files
import { cn } from "@/lib/utils";

export function testFunction() {
  return cn("test-class");
}
