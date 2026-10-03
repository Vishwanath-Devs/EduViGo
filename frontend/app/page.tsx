export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between border-b border-gray-100 px-8 py-5">
        <div className="text-2xl font-bold tracking-tight">EduViGo</div>

        <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
          <a href="#features" className="hover:text-black">
            Features
          </a>
          <a href="#about" className="hover:text-black">
            About
          </a>
        </div>

        <a
  href="/login"
  className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
>
  Login
</a>
      </nav>

      {/* Hero */}
      <section className="flex min-h-[calc(100vh-81px)] items-center justify-center px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600">
            AI-powered learning for students
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl">
            Study smarter.
            <br />
            <span className="text-gray-500">Prepare better.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            EduViGo helps students prepare for exams with organized study
            materials, important questions, previous-year papers, and an
            AI-powered study assistant.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
           <a
  href="/register"
  className="rounded-xl bg-black px-7 py-3.5 font-medium text-white transition hover:bg-gray-800"
>
  Get Started
</a>

            <a
              href="#features"
              className="rounded-xl border border-gray-300 px-7 py-3.5 font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-gray-100 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Everything in one place
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Built for focused exam preparation.
            </h2>

            <p className="mt-4 text-gray-600">
              Find what you need, understand difficult topics, and prepare
              with a clear study workflow.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 p-7">
              <h3 className="text-xl font-semibold">
                Previous Year Questions
              </h3>
              <p className="mt-3 leading-7 text-gray-600">
                Access organized previous-year questions and study patterns
                from past examinations.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-7">
              <h3 className="text-xl font-semibold">
                Important Questions
              </h3>
              <p className="mt-3 leading-7 text-gray-600">
                Quickly find important questions organized by subjects and
                modules.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-7">
              <h3 className="text-xl font-semibold">
                AI Study Assistant
              </h3>
              <p className="mt-3 leading-7 text-gray-600">
                Ask questions and get clear, exam-focused explanations while
                you study.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-t border-gray-100 bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            A simpler way to prepare.
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            EduViGo brings study resources and AI assistance together in one
            place, helping students spend less time searching and more time
            learning.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-8 text-center text-sm text-gray-500">
        © 2026 EduViGo. Built for students.
      </footer>
    </main>
  );
}