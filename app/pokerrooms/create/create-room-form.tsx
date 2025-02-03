"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z
    .string()
    .min(3, "Room name must be at least 3 characters")
    .max(50, "Room name must be less than 50 characters"),
  currency: z.enum(["€", "$", "£", "kr"]),
  defaultBuyIn: z
    .number()
    .min(1, "Default buy-in must be at least 1")
    .max(1000000, "Default buy-in must be less than 1,000,000"),
  password: z.string().optional(),
});

type Props = {
  userId: string;
};

export default function CreateRoomForm({ userId }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      currency: "kr",
      defaultBuyIn: 100,
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      setError(null);

      const payload = {
        ...values,
        creatorId: userId,
      };

      console.log("Submitting form with payload:", payload);

      const response = await fetch("/api/pokerrooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => null);
      console.log(
        "Response status:",
        response.status,
        "Response data:",
        responseData
      );

      if (!response.ok) {
        throw new Error(responseData?.message || "Failed to create room");
      }

      router.push(`/pokerroom/${responseData.id}`);
    } catch (error) {
      console.error("Error creating room:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create room"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md">
            {error}
          </div>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Name</FormLabel>
              <FormControl>
                <Input placeholder="My Poker Room" {...field} />
              </FormControl>
              <FormDescription>
                This will be the unique identifier for your room
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="€">Euro (€)</SelectItem>
                  <SelectItem value="$">US Dollar ($)</SelectItem>
                  <SelectItem value="£">British Pound (£)</SelectItem>
                  <SelectItem value="kr">Swedish Krona (kr)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultBuyIn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Buy-in</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                The default buy-in amount for games in this room (this can be
                edited per game)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Set a password to make the room private"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Leave empty to make the room publicly accessible
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Room"
          )}
        </Button>
      </form>
    </Form>
  );
}
