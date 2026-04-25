import React, { useEffect, useState } from "react";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

type GenericError = {
  error: string;
  stack: string;
};

function ErrorDialog({
  error,
  setError,
}: {
  error: GenericError;
  setError: (error: GenericError | null) => void;
}) {
  return (
    <Dialog
      defaultOpen={true}
      onOpenChange={() => {
        setError(null);
      }}
    >
      <DialogContent className="bg-red-700 text-white max-w-4xl">
        <DialogHeader>
          <DialogTitle>Runtime Error</DialogTitle>
        </DialogHeader>
        A runtime error occurred. Check the browser console for details.
        <div className="mt-4">
          <Collapsible>
            <CollapsibleTrigger>
              <div className="flex items-center font-bold cursor-pointer">
                See error details <ChevronDown />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="max-w-[460px]">
              <div className="mt-2 p-3 bg-neutral-800 rounded text-white text-sm overflow-x-auto max-h-60 max-w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <pre className="whitespace-pre">{error.stack}</pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <DialogFooter>
          <Button onClick={() => setError(null)}>Dismiss</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: GenericError | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
    this.setState({
      hasError: true,
      error: {
        error: error.message,
        stack: info.componentStack ?? error.stack ?? "",
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDialog
          error={{
            error: "An error occurred",
            stack: this.state.error?.stack ?? "",
          }}
          setError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}

export function InstrumentationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [error, setError] = useState<GenericError | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      console.error("Unhandled error:", event);
      setError({
        error: event.message,
        stack: event.error?.stack || "",
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled rejection:", event);
      setError({
        error: event.reason?.message ?? "Unknown error",
        stack: event.reason?.stack ?? "",
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return (
    <>
      <ErrorBoundary>{children}</ErrorBoundary>
      {error && <ErrorDialog error={error} setError={setError} />}
    </>
  );
}
