from backend.app.database.database import supabase


# =========================================================
# STOP WORDS
# =========================================================

STOP_WORDS = {
    "what",
    "is",
    "are",
    "the",
    "a",
    "an",
    "of",
    "for",
    "to",
    "in",
    "on",
    "and",
    "or",
    "explain",
    "define",
    "give",
    "describe",
    "with",
    "about",
    "how",
    "does",
    "do",
    "why",
    "which",
    "write",
    "program",
    "difference",
    "differences",
    "between",
    "compare",
    "comparison",
    "distinguish",
    "differentiate",
    "please",
    "can",
    "you",
    "me",
    "tell",
}


# =========================================================
# DATABASE SELECT
# =========================================================

QUESTION_FIELDS = (
    "id, subject_id, module, question, answer, marks, question_type"
)


# =========================================================
# KEYWORD EXTRACTION
# =========================================================

def extract_keywords(question: str) -> list[str]:
    """
    Extract meaningful keywords from the student's question.

    Example:

        What is an AVL tree?

    becomes:

        ["avl", "tree"]
    """

    words = (
        question
        .lower()
        .replace("?", " ")
        .replace(",", " ")
        .replace(".", " ")
        .replace(":", " ")
        .replace(";", " ")
        .replace("!", " ")
        .replace("(", " ")
        .replace(")", " ")
        .replace("[", " ")
        .replace("]", " ")
        .replace("{", " ")
        .replace("}", " ")
        .split()
    )

    keywords = []

    for word in words:

        cleaned = "".join(
            character
            for character in word
            if character.isalnum()
        )

        if not cleaned:
            continue

        if len(cleaned) < 3:
            continue

        if cleaned in STOP_WORDS:
            continue

        keywords.append(cleaned)

    return list(
        dict.fromkeys(keywords)
    )


# =========================================================
# NORMALIZE TEXT
# =========================================================

def normalize_text(value: str | None) -> str:
    """
    Normalize text for local comparison and scoring.
    """

    if not value:
        return ""

    return (
        value
        .lower()
        .replace("?", " ")
        .replace(",", " ")
        .replace(".", " ")
        .replace(":", " ")
        .replace(";", " ")
        .replace("!", " ")
        .replace("(", " ")
        .replace(")", " ")
        .replace("[", " ")
        .replace("]", " ")
        .replace("{", " ")
        .replace("}", " ")
    )


# =========================================================
# ADD UNIQUE RESULT
# =========================================================

def _add_result(
    results: dict[str, dict],
    item: dict,
) -> None:
    """
    Add a question to the result dictionary without duplicates.
    """

    item_id = item.get("id")

    if not item_id:
        return

    if item_id not in results:
        results[item_id] = item


# =========================================================
# SEARCH EXACT PHRASE
# =========================================================

def _search_exact_phrase(
    question: str,
    results: dict[str, dict],
) -> None:
    """
    Search the complete student question phrase.

    This helps when the database contains something close to
    the actual question.
    """

    cleaned_question = " ".join(
        extract_keywords(question)
    )

    if not cleaned_question:
        return

    response = (
        supabase
        .table("questions")
        .select(QUESTION_FIELDS)
        .ilike(
            "question",
            f"%{cleaned_question}%",
        )
        .limit(10)
        .execute()
    )

    for item in response.data or []:
        _add_result(
            results,
            item,
        )


# =========================================================
# SEARCH KEYWORDS IN QUESTION
# =========================================================

def _search_question_keywords(
    keywords: list[str],
    results: dict[str, dict],
) -> None:
    """
    Search individual keywords inside the question column.
    """

    for keyword in keywords:

        response = (
            supabase
            .table("questions")
            .select(QUESTION_FIELDS)
            .ilike(
                "question",
                f"%{keyword}%",
            )
            .limit(10)
            .execute()
        )

        for item in response.data or []:
            _add_result(
                results,
                item,
            )


# =========================================================
# SEARCH KEYWORDS IN ANSWER
# =========================================================

def _search_answer_keywords(
    keywords: list[str],
    results: dict[str, dict],
) -> None:
    """
    Search keywords inside stored academic answers.

    Question matches are considered more relevant later during
    scoring, so answer matches do not automatically dominate.
    """

    for keyword in keywords:

        response = (
            supabase
            .table("questions")
            .select(QUESTION_FIELDS)
            .ilike(
                "answer",
                f"%{keyword}%",
            )
            .limit(10)
            .execute()
        )

        for item in response.data or []:
            _add_result(
                results,
                item,
            )


# =========================================================
# SCORE RESULT
# =========================================================

def _score_result(
    item: dict,
    keywords: list[str],
    original_question: str,
) -> int:
    """
    Calculate a relevance score.

    Question matches receive more weight than answer matches.
    """

    stored_question = normalize_text(
        item.get("question")
    )

    stored_answer = normalize_text(
        item.get("answer")
    )

    user_question = normalize_text(
        original_question
    )

    score = 0

    # ---------------------------------------------------------
    # Exact phrase match
    # ---------------------------------------------------------

    if (
        user_question
        and user_question in stored_question
    ):
        score += 100

    # ---------------------------------------------------------
    # Keyword matching
    # ---------------------------------------------------------

    for keyword in keywords:

        keyword_lower = keyword.lower()

        # Strong match in stored question
        if keyword_lower in stored_question:
            score += 20

        # Weaker match in stored answer
        if keyword_lower in stored_answer:
            score += 5

    # ---------------------------------------------------------
    # Multiple keyword matches
    # ---------------------------------------------------------

    question_keyword_matches = sum(
        1
        for keyword in keywords
        if keyword.lower() in stored_question
    )

    if question_keyword_matches >= 2:
        score += 15

    if question_keyword_matches >= 3:
        score += 20

    return score


# =========================================================
# RETRIEVE QUESTIONS
# =========================================================

def retrieve_questions(
    question: str,
) -> list[dict]:
    """
    Retrieve the most relevant academic questions from Supabase.
    """

    keywords = extract_keywords(
        question
    )

    if not keywords:
        return []

    results: dict[str, dict] = {}

    # ---------------------------------------------------------
    # 1. Exact / phrase search
    # ---------------------------------------------------------

    try:
        _search_exact_phrase(
            question,
            results,
        )
    except Exception as error:
        print(
            "EduViGo RAG phrase search error:",
            error,
        )

    # ---------------------------------------------------------
    # 2. Search keywords in questions
    # ---------------------------------------------------------

    try:
        _search_question_keywords(
            keywords,
            results,
        )
    except Exception as error:
        print(
            "EduViGo RAG question search error:",
            error,
        )

    # ---------------------------------------------------------
    # 3. Search keywords in answers
    # ---------------------------------------------------------

    try:
        _search_answer_keywords(
            keywords,
            results,
        )
    except Exception as error:
        print(
            "EduViGo RAG answer search error:",
            error,
        )

    if not results:
        return []

    # ---------------------------------------------------------
    # Score results
    # ---------------------------------------------------------

    scored_results = []

    for item in results.values():

        score = _score_result(
            item=item,
            keywords=keywords,
            original_question=question,
        )

        if score > 0:
            scored_results.append(
                (
                    score,
                    item,
                )
            )

    # ---------------------------------------------------------
    # Sort by relevance
    # ---------------------------------------------------------

    scored_results.sort(
        key=lambda result: result[0],
        reverse=True,
    )

    # ---------------------------------------------------------
    # Return top results
    # ---------------------------------------------------------

    return [
        item
        for _, item in scored_results[:5]
    ]


# =========================================================
# BUILD ACADEMIC CONTEXT
# =========================================================

def build_academic_context(
    questions: list[dict],
) -> str:
    """
    Convert retrieved academic records into context for the AI.
    """

    if not questions:
        return (
            "No matching academic material was found "
            "in the EduViGo database."
        )

    parts = []

    for index, item in enumerate(
        questions,
        start=1,
    ):

        marks = item.get(
            "marks"
        )

        if marks is None:
            marks = "8-10 marks"

        question_text = item.get(
            "question",
            "",
        )

        answer_text = item.get(
            "answer",
            "",
        )

        module = item.get(
            "module",
            "",
        )

        question_type = item.get(
            "question_type",
            "",
        )

        parts.append(
            f"Academic Source {index}\n"
            f"Question: {question_text}\n"
            f"Answer: {answer_text}\n"
            f"Module: {module}\n"
            f"Question Type: {question_type}\n"
            f"Expected Marks: {marks}"
        )

    return "\n\n".join(
        parts
    )