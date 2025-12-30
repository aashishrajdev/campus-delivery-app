"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Mail, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAllUsersForAdmin, sendAdminEmailAction } from "@/app/actions/user-actions";

export function AdminUserEmailDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false); // For initial fetch
    const [sending, startTransition] = useTransition(); // For sending
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState("");
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [files, setFiles] = useState<{ name: string; content: string; encoding: string }[]>([]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            const validFiles: { name: string; content: string; encoding: string }[] = [];

            for (const file of selectedFiles) {
                // Check size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`File ${file.name} is too large (Max 5MB)`);
                    continue;
                }

                // Convert to Base64
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve) => {
                    reader.onload = () => {
                        const result = reader.result as string;
                        // Remove data URL prefix (e.g. "data:image/png;base64,")
                        const base64 = result.split(',')[1];
                        resolve(base64);
                    };
                });
                reader.readAsDataURL(file);
                const base64Content = await base64Promise;

                validFiles.push({
                    name: file.name,
                    content: base64Content,
                    encoding: 'base64'
                });
            }
            setFiles(validFiles);
        } else {
            setFiles([]);
        }
    };

    // Fetch users when dialog opens
    useEffect(() => {
        if (open && users.length === 0) {
            setLoading(true);
            getAllUsersForAdmin()
                .then((data) => {
                    setUsers(data);
                })
                .finally(() => setLoading(false));
        }
    }, [open, users.length]);

    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    const toggleUser = (userId: string) => {
        const next = new Set(selectedUsers);
        if (next.has(userId)) {
            next.delete(userId);
        } else {
            next.add(userId);
        }
        setSelectedUsers(next);
    };

    const toggleAll = () => {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set());
        } else {
            const allIds = filteredUsers.map((u) => u._id);
            setSelectedUsers(new Set(allIds));
        }
    };

    const handleSend = async () => {
        if (selectedUsers.size === 0) {
            toast.error("Please select at least one user.");
            return;
        }
        if (!subject.trim() || !content.trim()) {
            toast.error("Subject and content are required.");
            return;
        }

        startTransition(async () => {
            const res = await sendAdminEmailAction(
                Array.from(selectedUsers),
                subject,
                content,
                files
            );
            if (res.ok) {
                toast.success(res.message);
                setOpen(false);
                // Reset form
                setSubject("");
                setContent("");
                setFiles([]);
                setSelectedUsers(new Set());
            } else {
                toast.error(res.error || "Failed to send email");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" className="rounded-lg gap-2">
                    <Mail className="w-4 h-4" />
                    Send Mail (Users)
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Send Email to Users</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4 px-1">
                    {/* Search & Select Section */}
                    <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-9"
                            />
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between pb-2 border-b">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="select-all"
                                            checked={filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length}
                                            onCheckedChange={toggleAll}
                                        />
                                        <Label htmlFor="select-all" className="cursor-pointer text-sm font-medium">
                                            Select All ({filteredUsers.length})
                                        </Label>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {selectedUsers.size} selected
                                    </span>
                                </div>

                                <div className="h-[150px] overflow-y-auto space-y-1 pr-2">
                                    {filteredUsers.length === 0 ? (
                                        <p className="text-sm text-center text-muted-foreground py-4">No users found.</p>
                                    ) : (
                                        filteredUsers.map(user => (
                                            <div key={user._id} className="flex items-center gap-2 p-2 hover:bg-muted rounded text-sm transition-colors">
                                                <Checkbox
                                                    id={`user-${user._id}`}
                                                    checked={selectedUsers.has(user._id)}
                                                    onCheckedChange={() => toggleUser(user._id)}
                                                />
                                                <Label htmlFor={`user-${user._id}`} className="cursor-pointer flex-1 grid grid-cols-2 gap-2">
                                                    <span className="font-medium truncate">{user.name}</span>
                                                    <span className="text-muted-foreground truncate">{user.email}</span>
                                                </Label>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Email Content Section */}
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                placeholder="Enter email subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="content">Message Body</Label>
                            <Textarea
                                id="content"
                                placeholder="Write your message here..."
                                className="min-h-[150px] resize-y"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>

                        {/* Attachments Section */}
                        <div className="space-y-1">
                            <Label>Attachments (Optional)</Label>
                            <div className="flex flex-col gap-2">
                                <Input
                                    type="file"
                                    multiple
                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                    className="cursor-pointer"
                                    onChange={handleFileChange}
                                />
                                <div className="text-xs text-muted-foreground flex justify-between">
                                    <span>Supported: Images, PDF, Docs</span>
                                    <span>Max Size: 5MB</span>
                                </div>

                                {/* Selected Files List */}
                                {files.length > 0 && (
                                    <div className="text-sm space-y-1 text-muted-foreground">
                                        {files.map((f, i) => (
                                            <div key={i} className="flex justify-between items-center bg-muted/50 p-1 px-2 rounded">
                                                <span className="truncate max-w-[200px]">{f.name}</span>
                                                <span className="text-xs">{(f.content.length * 0.75 / 1024).toFixed(1)} KB</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSend} disabled={sending || selectedUsers.size === 0}>
                        {sending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email ({selectedUsers.size})
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
