"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  LogOut,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AccountPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setName(user.user_metadata?.name || "Student");
    setEmail(user.email || "");
    setCreatedAt(
      new Date(user.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );

    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function handleDeleteAccount() {
    const firstConfirm = window.confirm(
      "Are you sure you want to delete your EduViGo account?"
    );

    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      "This will permanently delete your account and your conversations. This action cannot be undone."
    );

    if (!secondConfirm) return;

    setDeleting(true);

    const { error } = await supabase.rpc("delete_current_user");

    if (error) {
      console.error("Error deleting account:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      window.alert(
        "Unable to delete your account right now. Please try again."
      );

      setDeleting(false);
      return;
    }

    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-6 py-8 text-gray-900">
        <p className="text-sm text-gray-500">Loading account...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <button
          onClick={() => {
            window.location.href = "/dashboard";
          }}
          className="mb-8 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Account
          </h1>
          <p className="mt-2 text-gray-500">
            Manage your EduViGo account and personal information.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-lg font-semibold">Profile information</h2>
            <p className="mt-1 text-sm text-gray-500">
              Information associated with your EduViGo account.
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="flex items-center gap-4 px-6 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <User size={19} className="text-gray-600" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Name
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Mail size={19} className="text-gray-600" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Email
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Calendar size={19} className="text-gray-600" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Member since
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {createdAt}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-lg font-semibold">Account actions</h2>
          </div>

          <div className="space-y-3 p-6">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <LogOut size={18} />
              <div>
                <p>Log out</p>
                <p className="mt-0.5 text-xs font-normal text-gray-400">
                  Sign out of your EduViGo account.
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-red-200 bg-white">
          <div className="border-b border-red-100 px-6 py-5">
            <h2 className="text-lg font-semibold text-red-600">
              Danger zone
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              These actions cannot be easily undone.
            </p>
          </div>

          <div className="p-6">
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="flex w-full items-center gap-3 rounded-xl border border-red-200 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={18} />

              <div>
                <p>{deleting ? "Deleting account..." : "Delete account"}</p>
                <p className="mt-0.5 text-xs font-normal text-red-400">
                  Permanently delete your account and conversations.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}