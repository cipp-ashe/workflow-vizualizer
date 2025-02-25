declare module "@radix-ui/react-tabs" {
  import * as React from "react";

  type PrimitiveButtonProps = React.ComponentPropsWithoutRef<"button">;
  type PrimitiveDivProps = React.ComponentPropsWithoutRef<"div">;

  // Root
  interface TabsRootProps extends PrimitiveDivProps {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    orientation?: "horizontal" | "vertical";
    dir?: "ltr" | "rtl";
    activationMode?: "automatic" | "manual";
  }
  const Root: React.FC<TabsRootProps>;

  // List
  interface TabsListProps extends PrimitiveDivProps {
    loop?: boolean;
  }
  const List: React.ForwardRefExoticComponent<
    TabsListProps & React.RefAttributes<HTMLDivElement>
  >;

  // Trigger
  interface TabsTriggerProps extends PrimitiveButtonProps {
    value: string;
    disabled?: boolean;
  }
  const Trigger: React.ForwardRefExoticComponent<
    TabsTriggerProps & React.RefAttributes<HTMLButtonElement>
  >;

  // Content
  interface TabsContentProps extends PrimitiveDivProps {
    value: string;
    forceMount?: boolean;
  }
  const Content: React.ForwardRefExoticComponent<
    TabsContentProps & React.RefAttributes<HTMLDivElement>
  >;

  export { Root, List, Trigger, Content };
}
