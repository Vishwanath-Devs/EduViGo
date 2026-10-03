"use client";

import { useEffect, useState } from "react";
import { BookOpen, FileText, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Mode = "answer" | "questions";

export default function AdminPage() {
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [mode, setMode] = useState<Mode>("answer");

  const [semester, setSemester] = useState("1");
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [module, setModule] = useState("1");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [questions, setQuestions] = useState<string[]>([""]);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const semesters = Array.from({ length: 8 }, (_, i) => i + 1);
  const modules = Array.from({ length: 5 }, (_, i) => i + 1);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  async function checkAdminAccess() {
    console.log("ADMIN CHECK STARTED");

    setCheckingAccess(true);

    try {
      // --------------------------------------------------
      // STEP 1: Check logged-in user
      // --------------------------------------------------

      console.log("Checking logged-in user...");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log("USER RESULT:", user);
      console.log("USER ERROR:", userError);

      if (userError) {
        console.error("Auth error:", userError);
        window.location.href = "/login";
        return;
      }

      if (!user) {
        console.log("No logged-in user.");
        window.location.href = "/login";
        return;
      }

      console.log("Logged-in user ID:", user.id);
      console.log("Logged-in user email:", user.email);

      // --------------------------------------------------
      // STEP 2: Check profile
      // --------------------------------------------------

      console.log("Checking admin profile...");

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      console.log("PROFILE RESULT:", profile);
      console.log("PROFILE ERROR:", profileError);

      if (profileError) {
        console.error("Error checking admin profile:", profileError);

        setCheckingAccess(false);
        setAuthorized(false);

        window.location.href = "/dashboard";
        return;
      }

      if (!profile) {
        console.log("No profile found for this user.");

        setCheckingAccess(false);
        setAuthorized(false);

        window.location.href = "/dashboard";
        return;
      }

      // --------------------------------------------------
      // STEP 3: Check admin status
      // --------------------------------------------------

      console.log("Profile found.");
      console.log("is_admin value:", profile.is_admin);

      if (!profile.is_admin) {
        console.log("User is NOT an admin.");

        setCheckingAccess(false);
        setAuthorized(false);

        window.location.href = "/dashboard";
        return;
      }

      // --------------------------------------------------
      // STEP 4: Access granted
      // --------------------------------------------------

      console.log("ADMIN ACCESS GRANTED");

      setAuthorized(true);
      setCheckingAccess(false);
    } catch (err) {
      console.error("ADMIN CHECK FAILED:", err);

      setCheckingAccess(false);
      setAuthorized(false);

      window.location.href = "/dashboard";
    }
  }

  function resetForm() {
    setSubjectName("");
    setSubjectCode("");
    setQuestion("");
    setAnswer("");
    setQuestions([""]);
    setSuccess("");
    setError("");
  }

  function addQuestionInput() {
    setQuestions([...questions, ""]);
  }

  function updateQuestion(index: number, value: string) {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  }

  function removeQuestionInput(index: number) {
    if (questions.length === 1) return;

    setQuestions(questions.filter((_, i) => i !== index));
  }

  async function getOrCreateSubject() {
    const cleanName = subjectName.trim();
    const cleanCode = subjectCode.trim().toUpperCase();

    if (!cleanName || !cleanCode) {
      throw new Error("Please enter subject name and subject code.");
    }

    const {
      data: existingSubject,
      error: findError,
    } = await supabase
      .from("subjects")
      .select("id")
      .eq("semester", Number(semester))
      .eq("subject_code", cleanCode)
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (existingSubject) {
      return existingSubject.id;
    }

    const {
      data: newSubject,
      error: insertError,
    } = await supabase
      .from("subjects")
      .insert({
        semester: Number(semester),
        subject_name: cleanName,
        subject_code: cleanCode,
      })
      .select("id")
      .single();

    if (insertError) {
      throw insertError;
    }

    return newSubject.id;
  }

  async function handleSingleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!question.trim() || !answer.trim()) {
      setError("Please enter both the question and answer.");
      return;
    }

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const subjectId = await getOrCreateSubject();

      const { error: questionError } = await supabase
        .from("questions")
        .insert({
          subject_id: subjectId,
          module: Number(module),
          question: question.trim(),
          answer: answer.trim(),
        });

      if (questionError) {
        throw questionError;
      }

      setSuccess("Question and answer added successfully.");

      setQuestion("");
      setAnswer("");
    } catch (err: any) {
      console.error("Error adding question:", err);

      setError(
        err?.message || "Unable to add question."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleMultipleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validQuestions = questions
      .map((item) => item.trim())
      .filter((item) => item !== "");

    if (validQuestions.length === 0) {
      setError("Please enter at least one question.");
      return;
    }

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const subjectId = await getOrCreateSubject();

      const rows = validQuestions.map((item) => ({
        subject_id: subjectId,
        module: Number(module),
        question: item,
        answer: null,
      }));

      const { error: questionError } = await supabase
        .from("questions")
        .insert(rows);

      if (questionError) {
        throw questionError;
      }

      setSuccess(
        `${validQuestions.length} question${
          validQuestions.length === 1 ? "" : "s"
        } added successfully.`
      );

      setQuestions([""]);
    } catch (err: any) {
      console.error("Error adding questions:", err);

      setError(
        err?.message || "Unable to add questions."
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // ACCESS CHECK SCREEN
  // --------------------------------------------------

  if (checkingAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Checking admin access...
          </p>

          <p className="mt-2 text-xs text-gray-400">
            Please wait
          </p>
        </div>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  // --------------------------------------------------
  // ADMIN PAGE
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">
              EduViGo Admin
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage academic questions and answers
            </p>
          </div>

          <Link
            href="/admin/content"
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium transition hover:bg-gray-200"
          >
            <BookOpen size={18} />
            Academic Content
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Mode selector */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setMode("answer");
              setSuccess("");
              setError("");
            }}
            className={`rounded-xl border p-5 text-left transition ${
              mode === "answer"
                ? "border-black bg-black text-white"
                : "border-gray-200 bg-white hover:border-gray-400"
            }`}
          >
            <div className="mb-3 flex items-center gap-3">
              <FileText size={22} />

              <span className="text-lg font-semibold">
                Add Question + Answer
              </span>
            </div>

            <p
              className={`text-sm ${
                mode === "answer"
                  ? "text-gray-300"
                  : "text-gray-500"
              }`}
            >
              Add one question together with a verified answer.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("questions");
              setSuccess("");
              setError("");
            }}
            className={`rounded-xl border p-5 text-left transition ${
              mode === "questions"
                ? "border-black bg-black text-white"
                : "border-gray-200 bg-white hover:border-gray-400"
            }`}
          >
            <div className="mb-3 flex items-center gap-3">
              <Plus size={22} />

              <span className="text-lg font-semibold">
                Add Questions Only
              </span>
            </div>

            <p
              className={`text-sm ${
                mode === "questions"
                  ? "text-gray-300"
                  : "text-gray-500"
              }`}
            >
              Add multiple questions without answers.
            </p>
          </button>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              {mode === "answer"
                ? "Add Question & Answer"
                : "Add Questions"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select the academic details before adding content.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Semester */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Semester
              </label>

              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
              >
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                    {sem === 1
                      ? "st"
                      : sem === 2
                      ? "nd"
                      : sem === 3
                      ? "rd"
                      : "th"}{" "}
                    Semester
                  </option>
                ))}
              </select>
            </div>

            {/* Module */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Module
              </label>

              <select
                value={module}
                onChange={(e) => setModule(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
              >
                {modules.map((mod) => (
                  <option key={mod} value={mod}>
                    Module {mod}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Subject Name
              </label>

              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Enter subject name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            {/* Subject Code */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Subject Code
              </label>

              <input
                type="text"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                placeholder="Enter subject code"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 uppercase outline-none focus:border-black"
                required
              />
            </div>
          </div>

          {/* Single question */}
          {mode === "answer" && (
            <form
              onSubmit={handleSingleSubmit}
              className="mt-6"
            >
              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium">
                  Question
                </label>

                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter the question..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium">
                  Answer
                </label>

                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter the verified answer..."
                  rows={8}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add Question"}
              </button>
            </form>
          )}

          {/* Multiple questions */}
          {mode === "questions" && (
            <form
              onSubmit={handleMultipleSubmit}
              className="mt-6"
            >
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">
                  Questions
                </label>

                <div className="space-y-3">
                  {questions.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3"
                    >
                      <textarea
                        value={item}
                        onChange={(e) =>
                          updateQuestion(
                            index,
                            e.target.value
                          )
                        }
                        placeholder={`Question ${index + 1}`}
                        rows={3}
                        className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                        required
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeQuestionInput(index)
                        }
                        disabled={questions.length === 1}
                        className="mt-2 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                        title="Remove question"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={addQuestionInput}
                className="mb-6 flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                <Plus size={17} />
                Add Another Question
              </button>

              <div>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Add Questions"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}