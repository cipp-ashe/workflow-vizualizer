# UI Components

## Overview

This directory contains reusable UI components that are used throughout the application. These components are built on top of shadcn/ui, which provides a set of accessible, customizable components that follow best practices.

## Components

### Button

A versatile button component with various styles and sizes.

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="sm">Small</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Badge

A small badge component for displaying status or labels.

```tsx
import { Badge } from "@/components/ui/badge";

<Badge>Default</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="secondary">Secondary</Badge>
```

### Card

A container component for grouping related content.

```tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>;
```

### Collapsible

A component for showing and hiding content.

```tsx
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

<Collapsible>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>
    <p>Content</p>
  </CollapsibleContent>
</Collapsible>;
```

### Navigation Menu

A component for creating navigation menus.

```tsx
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuLink href="/">Home</NavigationMenuLink>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href="/about">About</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>;
```

### Scroll Area

A scrollable area component.

```tsx
import { ScrollArea } from "@/components/ui/scroll-area";

<ScrollArea className="h-[200px]">
  <div className="p-4">
    <p>Content that will scroll</p>
    {/* More content */}
  </div>
</ScrollArea>;
```

### Tabs

A component for creating tabbed interfaces.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Tab 1 content</TabsContent>
  <TabsContent value="tab2">Tab 2 content</TabsContent>
</Tabs>;
```

## Usage Guidelines

- Use these components consistently throughout the application
- Follow the component's API and don't override styles directly
- If you need to customize a component, extend it rather than modifying it
- If you need a new component, create it in this directory and follow the same pattern
