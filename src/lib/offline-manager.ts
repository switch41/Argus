import { useEffect, useState } from "react";
import { toast } from "sonner";

interface OfflineMutation {
  id: string;
  mutationName: string;
  args: any;
  timestamp: number;
}

const QUEUE_KEY = "safe_travel_offline_queue";

export class OfflineManager {
  private static getStoredQueue(): OfflineMutation[] {
    try {
      if (typeof window === "undefined" || !window.localStorage) return [];
      return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    } catch (e) {
      console.error("Failed to load offline queue:", e);
      return [];
    }
  }

  private static saveQueue(queue: OfflineMutation[]) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      }
    } catch (e) {
      console.error("Failed to save offline queue:", e);
    }
  }

  static addToQueue(mutationName: string, args: any) {
    const queue = this.getStoredQueue();
    const fresh: OfflineMutation = {
      id: Math.random().toString(36).substring(7),
      mutationName,
      args,
      timestamp: Date.now(),
    };
    queue.push(fresh);
    this.saveQueue(queue);
    toast.info("Offline: Action queued for background sync.");
  }

  static getQueue() {
    return this.getStoredQueue();
  }

  static clearQueue() {
    this.saveQueue([]);
  }

  static async sync(mutationRunner: (name: string, args: any) => Promise<any>) {
    let queue = this.getStoredQueue();
    if (queue.length === 0) return;

    toast.loading(`Syncing ${queue.length} offline actions...`);
    
    for (const item of [...queue]) {
      try {
        await mutationRunner(item.mutationName, item.args);
        queue = queue.filter(q => q.id !== item.id);
        this.saveQueue(queue);
      } catch (e) {
        console.error(`Failed to sync mutation ${item.mutationName}:`, e);
      }
    }
    
    if (queue.length === 0) {
      toast.dismiss();
      toast.success("All offline actions successfully synced!");
    } else {
      toast.error(`Sync partial: ${queue.length} items remaining.`);
    }
  }
}

export function useOfflineSync(mutationRunner: (name: string, args: any) => Promise<any>) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      OfflineManager.sync(mutationRunner);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (navigator.onLine) {
      OfflineManager.sync(mutationRunner);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [mutationRunner]);

  return { isOnline };
}
