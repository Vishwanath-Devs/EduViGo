"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Moon,
  Sun,
  Monitor,
  MessageSquare,
  BookOpen,
  Bell,
  Shield,
  ChevronDown,
} from "lucide-react";

type Settings = {
  theme: "light" | "dark" | "system";
  enterToSend: boolean;
  chatHistory: boolean;
  notifications: boolean;
  language: string;
  answerStyle: string;
};

const defaultSettings: Settings = {
  theme: "system",
  enterToSend: true,
  chatHistory: true,
  notifications: false,
  language: "English",
  answerStyle: "Detailed",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("eduvigo-settings");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        setSettings({
          ...defaultSettings,
          ...parsed,
        });
      } catch {
        console.error("Unable to load EduViGo settings.");
      }
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "eduvigo-settings",
      JSON.stringify(settings)
    );

    applyTheme(settings.theme);
  }, [settings, loaded]);

  function updateSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <main
      className={`min-h-screen transition-colors duration-200 ${
        settings.theme === "dark"
          ? "bg-[#111111] text-white"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="mx-auto max-w-3xl px-6 py-8">

        {/* Back */}
        <button
          onClick={() => {
            window.location.href = "/dashboard";
          }}
          className={`mb-8 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
            settings.theme === "dark"
              ? "text-gray-300 hover:bg-gray-800 hover:text-white"
              : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
          }`}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Settings
          </h1>

          <p
            className={`mt-2 ${
              settings.theme === "dark"
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            Customize your EduViGo experience.
          </p>
        </div>

        {/* Appearance */}
        <section
          className={`overflow-hidden rounded-2xl border ${
            settings.theme === "dark"
              ? "border-gray-700 bg-[#181818]"
              : "border-gray-200 bg-white"
          }`}
        >
          <SectionHeader
            icon={<Sun size={19} />}
            title="Appearance"
            description="Choose how EduViGo looks."
            dark={settings.theme === "dark"}
          />

          <div className="p-6">
            <div className="grid grid-cols-3 gap-3">
              <ThemeButton
                icon={<Sun size={18} />}
                label="Light"
                active={settings.theme === "light"}
                dark={settings.theme === "dark"}
                onClick={() => updateSetting("theme", "light")}
              />

              <ThemeButton
                icon={<Moon size={18} />}
                label="Dark"
                active={settings.theme === "dark"}
                dark={settings.theme === "dark"}
                onClick={() => updateSetting("theme", "dark")}
              />

              <ThemeButton
                icon={<Monitor size={18} />}
                label="System"
                active={settings.theme === "system"}
                dark={settings.theme === "dark"}
                onClick={() => updateSetting("theme", "system")}
              />
            </div>
          </div>
        </section>

        {/* Chat */}
        <section
          className={`mt-6 overflow-hidden rounded-2xl border ${
            settings.theme === "dark"
              ? "border-gray-700 bg-[#181818]"
              : "border-gray-200 bg-white"
          }`}
        >
          <SectionHeader
            icon={<MessageSquare size={19} />}
            title="Chat preferences"
            description="Control how your conversations work."
            dark={settings.theme === "dark"}
          />

          <div
            className={`divide-y ${
              settings.theme === "dark"
                ? "divide-gray-700"
                : "divide-gray-100"
            }`}
          >
            <SettingToggle
              title="Enter to send"
              description="Press Enter to send. Shift + Enter creates a new line."
              enabled={settings.enterToSend}
              dark={settings.theme === "dark"}
              onChange={(value) =>
                updateSetting("enterToSend", value)
              }
            />

            <SettingToggle
              title="Show chat history"
              description="Show your saved conversations in the sidebar."
              enabled={settings.chatHistory}
              dark={settings.theme === "dark"}
              onChange={(value) =>
                updateSetting("chatHistory", value)
              }
            />
          </div>
        </section>

        {/* Study */}
        <section
          className={`mt-6 overflow-hidden rounded-2xl border ${
            settings.theme === "dark"
              ? "border-gray-700 bg-[#181818]"
              : "border-gray-200 bg-white"
          }`}
        >
          <SectionHeader
            icon={<BookOpen size={19} />}
            title="Study preferences"
            description="Customize your learning experience."
            dark={settings.theme === "dark"}
          />

          <div className="space-y-5 p-6">
            <SelectSetting
              label="Answer style"
              description="Preferred level of detail for AI answers."
              value={settings.answerStyle}
              options={["Concise", "Detailed"]}
              dark={settings.theme === "dark"}
              onChange={(value) =>
                updateSetting("answerStyle", value)
              }
            />

            <SelectSetting
              label="Language"
              description="Preferred language for study responses."
              value={settings.language}
              options={["English", "Kannada", "Hindi"]}
              dark={settings.theme === "dark"}
              onChange={(value) =>
                updateSetting("language", value)
              }
            />
          </div>
        </section>

        {/* Notifications */}
        <section
          className={`mt-6 overflow-hidden rounded-2xl border ${
            settings.theme === "dark"
              ? "border-gray-700 bg-[#181818]"
              : "border-gray-200 bg-white"
          }`}
        >
          <SectionHeader
            icon={<Bell size={19} />}
            title="Notifications"
            description="Manage EduViGo notifications."
            dark={settings.theme === "dark"}
          />

          <SettingToggle
            title="Email notifications"
            description="Allow EduViGo to send account and study-related emails."
            enabled={settings.notifications}
            dark={settings.theme === "dark"}
            onChange={(value) =>
              updateSetting("notifications", value)
            }
          />
        </section>

        {/* Privacy */}
        <section
          className={`mt-6 overflow-hidden rounded-2xl border ${
            settings.theme === "dark"
              ? "border-gray-700 bg-[#181818]"
              : "border-gray-200 bg-white"
          }`}
        >
          <SectionHeader
            icon={<Shield size={19} />}
            title="Privacy"
            description="Information about your conversations."
            dark={settings.theme === "dark"}
          />

          <div className="px-6 py-5">
            <p
              className={`text-sm leading-6 ${
                settings.theme === "dark"
                  ? "text-gray-400"
                  : "text-gray-600"
              }`}
            >
              Your conversations are associated with your EduViGo
              account and are accessible only through your authenticated
              account.
            </p>
          </div>
        </section>

        <p
          className={`py-8 text-center text-xs ${
            settings.theme === "dark"
              ? "text-gray-500"
              : "text-gray-400"
          }`}
        >
          Settings are saved automatically.
        </p>
      </div>
    </main>
  );
}

/* -------------------------------- */
/* Theme                            */
/* -------------------------------- */

function applyTheme(theme: Settings["theme"]) {
  const root = document.documentElement;

  if (theme === "dark") {
    root.dataset.theme = "dark";
    return;
  }

  if (theme === "light") {
    root.dataset.theme = "light";
    return;
  }

  const systemDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  root.dataset.theme = systemDark ? "dark" : "light";
}

/* -------------------------------- */
/* Section Header                   */
/* -------------------------------- */

function SectionHeader({
  icon,
  title,
  description,
  dark,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  dark: boolean;
}) {
  return (
    <div
      className={`border-b px-6 py-5 ${
        dark ? "border-gray-700" : "border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={dark ? "text-gray-300" : "text-gray-600"}>
          {icon}
        </span>

        <div>
          <h2 className="font-semibold">{title}</h2>

          <p
            className={`mt-1 text-sm ${
              dark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- */
/* Theme Button                     */
/* -------------------------------- */

function ThemeButton({
  icon,
  label,
  active,
  dark,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  dark: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-4 text-sm transition ${
        active
          ? "border-gray-900 bg-gray-900 text-white"
          : dark
            ? "border-gray-700 bg-[#222222] text-gray-300 hover:bg-[#2a2a2a]"
            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* -------------------------------- */
/* Toggle                           */
/* -------------------------------- */

function SettingToggle({
  title,
  description,
  enabled,
  dark,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  dark: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-6 py-5">
      <div>
        <p
          className={`text-sm font-medium ${
            dark ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </p>

        <p
          className={`mt-1 max-w-xl text-xs leading-5 ${
            dark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!enabled)}
        aria-pressed={enabled}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? "bg-black" : dark ? "bg-gray-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

/* -------------------------------- */
/* Select                           */
/* -------------------------------- */

function SelectSetting({
  label,
  description,
  value,
  options,
  dark,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  options: string[];
  dark: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div>
        <p
          className={`text-sm font-medium ${
            dark ? "text-white" : "text-gray-900"
          }`}
        >
          {label}
        </p>

        <p
          className={`mt-1 text-xs ${
            dark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {description}
        </p>
      </div>

      <div className="relative shrink-0">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`appearance-none rounded-lg border py-2 pl-3 pr-9 text-sm outline-none ${
            dark
              ? "border-gray-700 bg-[#222222] text-white"
              : "border-gray-200 bg-white text-gray-900"
          }`}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </div>
  );
}