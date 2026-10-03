"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Search,
  Trash2,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Question = {
  id: string;
  module: number;
  question: string;
  answer: string | null;
  created_at: string;
};

type Subject = {
  semester: number;
  subject_name: string;
  subject_code: string;
};

type ContentItem = {
  id: string;
  module: number;
  question: string;
  answer: string | null;
  created_at: string;
  subject: Subject;
};

type ContentSet = {
  key: string;
  semester: number;
  subject_name: string;
  subject_code: string;
  module: number;
  questionCount: number;
  created_at: string;
  questions: ContentItem[];
};

export default function AcademicContentPage() {
  const [authorized, setAuthorized] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [semester, setSemester] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [module, setModule] = useState("");

  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<ContentItem[]>([]);

  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  async function checkAdminAccess() {
    setCheckingAccess(true);

    console.log("CONTENT ADMIN CHECK STARTED");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User check failed:", userError);

      window.location.href = "/login";
      return;
    }

    console.log("Logged-in user:", user.id);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile check failed:", profileError);

      window.location.href = "/dashboard";
      return;
    }

    console.log("Admin profile:", profile);

    if (profile?.is_admin !== true) {
      console.log("ADMIN ACCESS DENIED");

      window.location.href = "/dashboard";
      return;
    }

    console.log("ADMIN ACCESS GRANTED");

    setAuthorized(true);
    setCheckingAccess(false);

    loadContent();
  }

  async function handleLogout() {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      alert("Unable to logout. Please try again.");
      setLoggingOut(false);
      return;
    }

    window.location.href = "/login";
  }

  async function loadContent() {
    setLoading(true);

    const { data, error } = await supabase
      .from("questions")
      .select(`
        id,
        module,
        question,
        answer,
        created_at,
        subjects (
          semester,
          subject_name,
          subject_code
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading academic content:", error);
      setContent([]);
      setLoading(false);
      return;
    }

    const formatted: ContentItem[] = (data || [])
      .map((item: any) => ({
        id: item.id,
        module: item.module,
        question: item.question,
        answer: item.answer,
        created_at: item.created_at,
        subject: Array.isArray(item.subjects)
          ? item.subjects[0]
          : item.subjects,
      }))
      .filter((item) => item.subject);

    setContent(formatted);
    setLoading(false);
  }

  const recentlyAdded = useMemo(() => {
    const map = new Map<string, ContentSet>();

    for (const item of content) {
      const key = [
        item.subject.semester,
        item.subject.subject_code.toLowerCase(),
        item.module,
      ].join("|");

      if (!map.has(key)) {
        map.set(key, {
          key,
          semester: item.subject.semester,
          subject_name: item.subject.subject_name,
          subject_code: item.subject.subject_code,
          module: item.module,
          questionCount: 0,
          created_at: item.created_at,
          questions: [],
        });
      }

      const set = map.get(key)!;

      set.questionCount += 1;
      set.questions.push(item);

      if (
        new Date(item.created_at).getTime() >
        new Date(set.created_at).getTime()
      ) {
        set.created_at = item.created_at;
      }
    }

    return Array.from(map.values())
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
      .slice(0, 10);
  }, [content]);

  async function handleSearch() {
    if (!semester || !subjectName.trim() || !subjectCode.trim()) {
      alert("Please enter semester, subject name and subject code.");
      return;
    }

    setSearching(true);
    setHasSearched(true);
    setSelectedKey(null);
    setSelectedQuestions([]);

    let query = supabase
      .from("questions")
      .select(`
        id,
        module,
        question,
        answer,
        created_at,
        subjects!inner (
          semester,
          subject_name,
          subject_code
        )
      `)
      .eq("subjects.semester", Number(semester));

    if (module) {
      query = query.eq("module", Number(module));
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error searching academic content:", error);
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const enteredSubject = subjectName.trim().toLowerCase();
    const enteredCode = subjectCode.trim().toLowerCase();

    const results: ContentItem[] = (data || [])
      .map((item: any) => ({
        id: item.id,
        module: item.module,
        question: item.question,
        answer: item.answer,
        created_at: item.created_at,
        subject: Array.isArray(item.subjects)
          ? item.subjects[0]
          : item.subjects,
      }))
      .filter((item) => {
        if (!item.subject) return false;

        const dbSubjectName = item.subject.subject_name
          .trim()
          .toLowerCase();

        const dbSubjectCode = item.subject.subject_code
          .trim()
          .toLowerCase();

        return (
          dbSubjectName === enteredSubject &&
          dbSubjectCode === enteredCode
        );
      })
      .sort((a, b) => {
        if (a.module !== b.module) {
          return a.module - b.module;
        }

        return (
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
        );
      });

    setSearchResults(results);
    setSearching(false);
  }

  function groupResults(items: ContentItem[]) {
    const map = new Map<string, ContentItem[]>();

    for (const item of items) {
      const key = [
        item.subject.semester,
        item.subject.subject_code.toLowerCase(),
        item.module,
      ].join("|");

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key)!.push(item);
    }

    return Array.from(map.entries()).map(([key, questions]) => ({
      key,
      semester: questions[0].subject.semester,
      subject_name: questions[0].subject.subject_name,
      subject_code: questions[0].subject.subject_code,
      module: questions[0].module,
      questionCount: questions.length,
      created_at: questions[0].created_at,
      questions,
    }));
  }

  function openSet(item: ContentSet) {
    if (selectedKey === item.key) {
      setSelectedKey(null);
      setSelectedQuestions([]);
      return;
    }

    setSelectedKey(item.key);
    setSelectedQuestions(item.questions);
  }

  function openSearchSet(item: ContentSet) {
    if (selectedKey === item.key) {
      setSelectedKey(null);
      setSelectedQuestions([]);
      return;
    }

    setSelectedKey(item.key);
    setSelectedQuestions(item.questions);
  }

  async function handleDelete(questionId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    setDeleting(questionId);

    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", questionId);

    if (error) {
      console.error("Error deleting question:", error);
      alert("Unable to delete the question.");
      setDeleting(null);
      return;
    }

    setContent((current) =>
      current.filter((item) => item.id !== questionId)
    );

    setSearchResults((current) =>
      current.filter((item) => item.id !== questionId)
    );

    setSelectedQuestions((current) =>
      current.filter((item) => item.id !== questionId)
    );

    setDeleting(null);
  }

  function clearSearch() {
    setSemester("");
    setSubjectName("");
    setSubjectCode("");
    setModule("");
    setSearchResults([]);
    setHasSearched(false);
    setSelectedKey(null);
    setSelectedQuestions([]);
  }

  const searchSets = groupResults(searchResults);

  if (checkingAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Checking admin access...
        </p>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8 text-gray-900">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <Link
              href="/admin"
              className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft size={16} />
              Back to Admin
            </Link>

            <h1 className="text-3xl font-bold">
              Academic Content
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View and manage questions added to EduViGo.
            </p>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={17} />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* LEFT — RECENTLY ADDED */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">
                Recently Added
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Latest 10 content sets
              </p>
            </div>

            {loading ? (
              <p className="py-8 text-center text-sm text-gray-500">
                Loading academic content...
              </p>
            ) : recentlyAdded.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
                <p className="text-sm text-gray-500">
                  No academic content has been added yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentlyAdded.map((item) => {
                  const isOpen = selectedKey === item.key;

                  return (
                    <div
                      key={item.key}
                      className="overflow-hidden rounded-xl border border-gray-200"
                    >
                      <button
                        type="button"
                        onClick={() => openSet(item)}
                        className="w-full p-4 text-left transition hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <span>
                                Semester {item.semester}
                              </span>

                              <span>•</span>

                              <span>
                                Module {item.module}
                              </span>
                            </div>

                            <h3 className="mt-1 font-semibold">
                              {item.subject_name}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              {item.subject_code}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                              {item.questionCount}{" "}
                              {item.questionCount === 1
                                ? "question"
                                : "questions"}
                            </span>

                            {isOpen ? (
                              <ChevronUp size={18} />
                            ) : (
                              <ChevronDown size={18} />
                            )}
                          </div>
                        </div>
                      </button>

                      {isOpen && (
                        <QuestionList
                          questions={selectedQuestions}
                          deleting={deleting}
                          onDelete={handleDelete}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* RIGHT — SEARCH */}
          <section className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">
                Search Academic Content
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Find questions by semester, subject and code.
              </p>
            </div>

            <div className="space-y-4">
              {/* Semester */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Semester
                </label>

                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                >
                  <option value="">Select semester</option>

                  {Array.from({ length: 8 }, (_, index) => (
                    <option key={index + 1} value={index + 1}>
                      Semester {index + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Subject Name
                </label>

                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Python"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                />
              </div>

              {/* Code */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Subject Code
                </label>

                <input
                  type="text"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="e.g. 1PY01"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm uppercase outline-none focus:border-black"
                />
              </div>

              {/* Module */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Module
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    (Optional)
                  </span>
                </label>

                <select
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                >
                  <option value="">All Modules</option>

                  {Array.from({ length: 5 }, (_, index) => (
                    <option key={index + 1} value={index + 1}>
                      Module {index + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Search size={17} />

                  {searching ? "Searching..." : "Search"}
                </button>

                <button
                  type="button"
                  onClick={clearSearch}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* SEARCH RESULTS */}
        {hasSearched && (
          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">
                Search Results
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {searchResults.length}{" "}
                {searchResults.length === 1
                  ? "question"
                  : "questions"}{" "}
                found
              </p>
            </div>

            {searchSets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
                <p className="font-medium">
                  No content found
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Check the semester, subject name and subject
                  code.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchSets.map((item) => {
                  const isOpen = selectedKey === item.key;

                  return (
                    <div
                      key={item.key}
                      className="overflow-hidden rounded-xl border border-gray-200"
                    >
                      <button
                        type="button"
                        onClick={() => openSearchSet(item)}
                        className="w-full p-4 text-left transition hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <span>
                                Semester {item.semester}
                              </span>

                              <span>•</span>

                              <span>
                                Module {item.module}
                              </span>
                            </div>

                            <h3 className="mt-1 font-semibold">
                              {item.subject_name}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              {item.subject_code}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                              {item.questionCount}{" "}
                              {item.questionCount === 1
                                ? "question"
                                : "questions"}
                            </span>

                            {isOpen ? (
                              <ChevronUp size={18} />
                            ) : (
                              <ChevronDown size={18} />
                            )}
                          </div>
                        </div>
                      </button>

                      {isOpen && (
                        <QuestionList
                          questions={selectedQuestions}
                          deleting={deleting}
                          onDelete={handleDelete}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function QuestionList({
  questions,
  deleting,
  onDelete,
}: {
  questions: ContentItem[];
  deleting: string | null;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="border-t border-gray-200 bg-gray-50 p-5">
      <div className="space-y-4">
        {questions.map((item, index) => (
          <div
            key={item.id}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-6">
                  {index + 1}. {item.question}
                </p>

                {item.answer ? (
                  <div className="mt-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Answer
                    </p>

                    <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                      {item.answer}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs italic text-gray-400">
                    Answer not added — Groq can generate it later.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onDelete(item.id)}
                disabled={deleting === item.id}
                title="Delete question"
                className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}