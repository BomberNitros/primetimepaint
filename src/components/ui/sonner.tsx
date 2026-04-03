import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      offset={72}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border group-[.toaster]:shadow-lg group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:!bg-[#166534] group-[.toaster]:!border-[#22c55e] group-[.toaster]:!text-[#dcfce7]",
          error:
            "group-[.toaster]:!bg-[#713f12] group-[.toaster]:!border-[#eab308] group-[.toaster]:!text-[#fef9c3]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
