"use client";

import { PokerRoom } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Edit2, Save } from "lucide-react";
import { toast } from "sonner";

interface RoomManagementProps {
  room: PokerRoom;
  onRoomUpdate: (roomId: string, data: { name: string; currency: string; defaultBuyIn: number }) => Promise<void>;
}

export default function RoomManagement({ room, onRoomUpdate }: RoomManagementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: room.name,
    currency: room.currency,
    defaultBuyIn: room.defaultBuyIn
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: room.name,
      currency: room.currency,
      defaultBuyIn: room.defaultBuyIn
    });
  };

  const handleSave = async () => {
    try {
      await onRoomUpdate(room.id, editData);
      setIsEditing(false);
      toast("Room settings updated successfully!");
    } catch (error) {
      toast("Failed to update room settings", { 
        description: "Please try again"
      });
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Room Settings</h2>
        {!isEditing && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEdit}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Room Name</label>
            <Input
              value={editData.name}
              onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              className="max-w-[300px]"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Currency</label>
            <Input
              value={editData.currency}
              onChange={(e) => setEditData(prev => ({ ...prev, currency: e.target.value }))}
              className="max-w-[100px]"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Default Buy-in</label>
            <Input
              type="number"
              value={editData.defaultBuyIn}
              onChange={(e) => setEditData(prev => ({ ...prev, defaultBuyIn: parseFloat(e.target.value) }))}
              className="max-w-[150px]"
            />
          </div>
          <Button onClick={handleSave} className="mt-4">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <p><span className="font-medium">Name:</span> {room.name}</p>
          <p><span className="font-medium">Currency:</span> {room.currency}</p>
          <p><span className="font-medium">Default Buy-in:</span> {room.defaultBuyIn} {room.currency}</p>
        </div>
      )}
    </div>
  );
} 