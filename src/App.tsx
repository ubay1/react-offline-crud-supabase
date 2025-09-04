/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import "./css/index.css";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form";
import { Input } from "./components/ui/input";
import { deleteUser, getAllUsers, updateUser } from "@/lib/db";
import { useSync } from "@/hooks/useSync";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { supabase } from "./lib/supabase-client";
import { toast } from "sonner";

function App() {
  const isOnline = useOnlineStatus();
  const [users, setUsers] = useState<unknown[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // ===================== React Hook Form + Zod =================== //
  const schemaTest = z.object({
    username: z.string().min(1, {
      message: "Username is required",
    }),
    email: z
      .string()
      .min(1, {
        message: "Email is required",
      })
      .email({
        message: "Email must be a valid email address",
      }),
  });

  type FormValues = z.infer<typeof schemaTest>;
  const form = useForm<FormValues>({
    resolver: zodResolver(schemaTest),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  useSync();

  const loadUsers = async () => {
    const all = await getAllUsers();
    setUsers(all);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUpdateData = async (data: FormValues) => {
    const payload = {
      id: editingId ?? crypto.randomUUID(),
      name: data.username,
      email: data.email,
    };

    if (navigator.onLine) {
      const { error } = await supabase.from("users").upsert(payload);
      if (error) {
        console.error("Supabase save failed, fallback to IndexedDB:", error);
        await updateUser(payload);
        toast.error("Failed to save to Supabase, fallback to IndexedDB 🔄");
      } else {
        await updateUser(payload);
        toast.success(
          editingId ? "Updated in Supabase ✅" : "Saved in Supabase ✅"
        );
      }
    } else {
      await updateUser(payload);
      toast.info(
        editingId
          ? "Updated offline in IndexedDB 🔄"
          : "Saved offline in IndexedDB 🔄"
      );
    }

    setEditingId(null);
    form.reset();
    await loadUsers();
  };

  const deleteData = async (id: string) => {
    if (navigator.onLine) {
      await supabase.from("users").delete().eq("id", id);
      await deleteUser(id);
      toast.success("Successfully deleted from Supabase ✅");
    } else {
      await deleteUser(id);
      toast.info("Deleted offline from IndexedDB 🔄");
    }
    await loadUsers();
  };

  const editData = (user: any) => {
    setEditingId(user.id);
    form.setValue("username", user.name);
    form.setValue("email", user.email);
  };

  return (
    <div className={"min-h-dvh w-full gap-4 p-4"}>
      <div
        className={`px-2 py-1 rounded text-white text-sm w-fit mb-4 ${
          isOnline ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {isOnline ? "🟢 Online" : "🔴 Offline"}
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{editingId ? "Update User" : "Create User"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                className="w-full flex flex-col gap-4"
                onSubmit={form.handleSubmit(createUpdateData)}
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter username"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">{editingId ? "Update" : "Submit"}</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Table className="border shadow-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u: any) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" onClick={() => editData(u)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteData(u.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default App;
