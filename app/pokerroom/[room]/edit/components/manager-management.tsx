"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addManager, removeManager } from "../api";
import { toast } from "sonner";
import { User } from "@prisma/client";
import { Loader2, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RoomManagerWithUser {
  id: string;
  user: User;
}

interface ManagerManagementProps {
  roomId: string;
  managers: RoomManagerWithUser[];
  isCreator: boolean;
}

export default function ManagerManagement({
  roomId,
  managers: initialManagers,
  isCreator,
}: ManagerManagementProps) {
  const [email, setEmail] = useState("");
  const [managers, setManagers] = useState(initialManagers);
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({
    add: false,
  });

  const setLoading = (key: string, value: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  };

  if (!isCreator) {
    return null;
  }

  async function handleAddManager(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading("add", true);
      const newManager = await addManager(roomId, email);
      setManagers([...managers, newManager]);
      setEmail("");
      toast.success("Manager added successfully");
    } catch (error) {
      toast.error("Failed to add manager");
    } finally {
      setLoading("add", false);
    }
  }

  async function handleRemoveManager(managerId: string) {
    try {
      setLoading(managerId, true);
      await removeManager(roomId, managerId);
      setManagers(managers.filter((m) => m.id !== managerId));
      toast.success("Manager removed successfully");
    } catch (error) {
      toast.error("Failed to remove manager");
    } finally {
      setLoading(managerId, false);
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Room Managers</CardTitle>
        <CardDescription>Manage who can edit this room</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddManager} className="flex gap-2 mb-4">
          <Input
            type="email"
            placeholder="Enter email to add manager"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loadingStates.add}
          />
          <Button type="submit" disabled={loadingStates.add}>
            {loadingStates.add ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add"
            )}
          </Button>
        </form>

        <div className="space-y-2">
          {managers.map((manager) => (
            <div
              key={manager.id}
              className="flex items-center justify-between p-2 bg-muted rounded-md"
            >
              <span>{manager.user.email}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveManager(manager.id)}
                disabled={loadingStates[manager.id]}
              >
                {loadingStates[manager.id] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
