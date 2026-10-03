from typing import Any


# =========================================================
# QUESTION TYPE DETECTION
# =========================================================

def detect_question_type(question: str) -> str:
    text = question.lower().strip()

    # ---------------------------------------------------------
    # COMPARISON
    # ---------------------------------------------------------
    if any(
        phrase in text
        for phrase in [
            "difference between",
            "differences between",
            "differentiate between",
            "differentiate",
            "compare",
            "comparison between",
            "distinguish between",
        ]
    ):
        return "comparison"

    # ---------------------------------------------------------
    # ADVANTAGES + DISADVANTAGES
    # ---------------------------------------------------------
    if (
        "advantages and disadvantages" in text
        or "advantages & disadvantages" in text
        or (
            "advantage" in text
            and "disadvantage" in text
        )
    ):
        return "advantages_disadvantages"

    # ---------------------------------------------------------
    # ADVANTAGES
    # ---------------------------------------------------------
    if any(
        phrase in text
        for phrase in [
            "advantages of",
            "advantages",
            "benefits of",
            "benefits",
        ]
    ):
        return "advantages"

    # ---------------------------------------------------------
    # DISADVANTAGES
    # ---------------------------------------------------------
    if any(
        phrase in text
        for phrase in [
            "disadvantages of",
            "disadvantages",
            "limitations of",
            "limitations",
            "drawbacks of",
        ]
    ):
        return "disadvantages"

    # ---------------------------------------------------------
    # PROGRAMMING
    # ---------------------------------------------------------
    if any(
        phrase in text
        for phrase in [
            "write a program",
            "write program",
            "write code",
            "program in c",
            "program in c++",
            "program in java",
            "program in python",
            "implement in",
            "implementation of",
        ]
    ):
        return "programming"

    # ---------------------------------------------------------
    # ALGORITHM
    # ---------------------------------------------------------
    if "algorithm" in text:
        return "algorithm"

    # ---------------------------------------------------------
    # WORKING
    # ---------------------------------------------------------
    if any(
        phrase in text
        for phrase in [
            "how does",
            "how do",
            "how is",
            "how are",
            "working of",
            "working principle",
            "how it works",
        ]
    ):
        return "working"

    # ---------------------------------------------------------
    # PROCESS
    # ---------------------------------------------------------
    if any(
        phrase in text
        for phrase in [
            "process of",
            "steps involved",
            "steps in",
            "procedure for",
            "procedure of",
        ]
    ):
        return "process"

    # ---------------------------------------------------------
    # TYPES
    # ---------------------------------------------------------
    if any(
        phrase in text
        for phrase in [
            "types of",
            "type of",
            "different types",
            "classification of",
        ]
    ):
        return "types"

    # ---------------------------------------------------------
    # FEATURES
    # ---------------------------------------------------------
    if any(
        phrase in text
        for phrase in [
            "features of",
            "feature of",
            "characteristics of",
            "characteristic of",
        ]
    ):
        return "features"

    # ---------------------------------------------------------
    # COMPONENTS
    # ---------------------------------------------------------
    if any(
        phrase in text
        for phrase in [
            "components of",
            "component of",
            "elements of",
            "parts of",
        ]
    ):
        return "components"

    # ---------------------------------------------------------
    # DEFINITION
    # ---------------------------------------------------------
    if (
        text.startswith("what is ")
        or text.startswith("what are ")
        or text.startswith("define ")
        or text.startswith("definition of ")
        or text.startswith("meaning of ")
    ):
        return "definition"

    # ---------------------------------------------------------
    # EXPLANATION
    # ---------------------------------------------------------
    if (
        text.startswith("explain ")
        or " explain " in f" {text} "
    ):
        return "explanation"

    return "general"


# =========================================================
# ANSWER STRUCTURES
# =========================================================

def get_structure(question_type: str) -> dict[str, Any]:
    structures = {
        "definition": {
            "sections": [
                "definition",
                "key_points",
                "examples",
                "conclusion",
            ],
            "required": [
                "definition",
                "key_points",
                "conclusion",
            ],
            "optional": [
                "examples",
            ],
        },

        "explanation": {
            "sections": [
                "introduction",
                "explanation",
                "example",
                "conclusion",
            ],
            "required": [
                "introduction",
                "explanation",
                "conclusion",
            ],
            "optional": [
                "example",
            ],
        },

        "comparison": {
            "sections": [
                "introduction",
                "comparison",
                "conclusion",
            ],
            "required": [
                "introduction",
                "comparison",
                "conclusion",
            ],
            "optional": [],
        },

        "advantages": {
            "sections": [
                "introduction",
                "advantages",
                "conclusion",
            ],
            "required": [
                "introduction",
                "advantages",
                "conclusion",
            ],
            "optional": [],
        },

        "disadvantages": {
            "sections": [
                "introduction",
                "disadvantages",
                "conclusion",
            ],
            "required": [
                "introduction",
                "disadvantages",
                "conclusion",
            ],
            "optional": [],
        },

        "advantages_disadvantages": {
            "sections": [
                "introduction",
                "advantages",
                "disadvantages",
                "conclusion",
            ],
            "required": [
                "introduction",
                "advantages",
                "disadvantages",
                "conclusion",
            ],
            "optional": [],
        },

        "working": {
            "sections": [
                "introduction",
                "working",
                "example",
                "conclusion",
            ],
            "required": [
                "introduction",
                "working",
                "conclusion",
            ],
            "optional": [
                "example",
            ],
        },

        "process": {
            "sections": [
                "introduction",
                "steps",
                "conclusion",
            ],
            "required": [
                "introduction",
                "steps",
                "conclusion",
            ],
            "optional": [],
        },

        "types": {
            "sections": [
                "introduction",
                "types",
                "examples",
                "conclusion",
            ],
            "required": [
                "introduction",
                "types",
                "conclusion",
            ],
            "optional": [
                "examples",
            ],
        },

        "features": {
            "sections": [
                "introduction",
                "features",
                "conclusion",
            ],
            "required": [
                "introduction",
                "features",
                "conclusion",
            ],
            "optional": [],
        },

        "components": {
            "sections": [
                "introduction",
                "components",
                "conclusion",
            ],
            "required": [
                "introduction",
                "components",
                "conclusion",
            ],
            "optional": [],
        },

        "algorithm": {
            "sections": [
                "introduction",
                "algorithm",
                "example",
                "complexity",
                "conclusion",
            ],
            "required": [
                "introduction",
                "algorithm",
                "conclusion",
            ],
            "optional": [
                "example",
                "complexity",
            ],
        },

        "programming": {
            "sections": [
                "approach",
                "code",
                "explanation",
                "output",
                "conclusion",
            ],
            "required": [
                "approach",
                "code",
                "explanation",
            ],
            "optional": [
                "output",
                "conclusion",
            ],
        },

        "general": {
            "sections": [
                "answer",
                "key_points",
                "conclusion",
            ],
            "required": [
                "answer",
            ],
            "optional": [
                "key_points",
                "conclusion",
            ],
        },
    }

    return structures.get(
        question_type,
        structures["general"],
    )


# =========================================================
# AI JSON INSTRUCTIONS
# =========================================================

def get_json_schema_instruction(
    question_type: str,
) -> str:

    if question_type == "definition":
        return (
            "Return ONLY valid JSON.\n"
            "Do not include Markdown formatting in any value.\n"
            "Do not include a title field.\n"
            "Use exactly these fields:\n"
            "{\n"
            '  "definition": "one clear definition paragraph",\n'
            '  "key_points": ["point 1", "point 2", "point 3"],\n'
            '  "examples": ["example 1", "example 2"],\n'
            '  "conclusion": "short conclusion"\n'
            "}\n\n"
            "STRICT DEFINITION RULES:\n"
            "- Answer only what the concept is and what it means.\n"
            "- Start with a direct textbook-style definition.\n"
            "- Use only information supported by the academic context.\n"
            "- Key points must describe essential characteristics or meaning.\n"
            "- Use 3 to 5 key points maximum.\n"
            "- Use 1 to 3 examples maximum.\n"
            "- Examples must be supported by the academic context.\n"
            "- Do not explain implementation unless explicitly asked.\n"
            "- Do not add advantages or disadvantages.\n"
            "- Do not add history or unrelated technical details.\n"
            "- Do not turn the definition into a working explanation.\n"
            "- Keep the conclusion to one short sentence.\n"
            "- Do not invent information that is not present in the academic context.\n"
        )

    if question_type == "explanation":
        return (
            "Return ONLY valid JSON.\n"
            "Do not include Markdown formatting in any value.\n"
            "Do not include a title field.\n"
            "Use exactly these fields:\n"
            "{\n"
            '  "introduction": "short introduction",\n'
            '  "explanation": "detailed explanation",\n'
            '  "example": "example if supported by the context",\n'
            '  "conclusion": "short conclusion"\n'
            "}\n"
            "Use only information supported by the academic context."
        )

    if question_type == "comparison":
        return (
            "Return ONLY valid JSON.\n"
            "Do not include Markdown formatting in any value.\n"
            "Do not include a title field.\n"
            "Use exactly these fields:\n"
            "{\n"
            '  "introduction": "short introduction",\n'
            '  "comparison": [\n'
            '    {"aspect": "Aspect", '
            '"first": "First concept", '
            '"second": "Second concept"}\n'
            "  ],\n"
            '  "conclusion": "short conclusion"\n'
            "}\n"
            "Use only comparison information supported by the academic context."
        )

    if question_type == "advantages":
        return (
            "Return ONLY valid JSON.\n"
            "Do not include Markdown formatting in any value.\n"
            "Do not include a title field.\n"
            "Use exactly these fields:\n"
            "{\n"
            '  "introduction": "short introduction",\n'
            '  "advantages": ["advantage 1", "advantage 2"],\n'
            '  "conclusion": "short conclusion"\n'
            "}\n"
            "Use only advantages supported by the academic context."
        )

    if question_type == "disadvantages":
        return (
            "Return ONLY valid JSON.\n"
            "Do not include Markdown formatting in any value.\n"
            "Do not include a title field.\n"
            "Use exactly these fields:\n"
            "{\n"
            '  "introduction": "short introduction",\n'
            '  "disadvantages": ["disadvantage 1", "disadvantage 2"],\n'
            '  "conclusion": "short conclusion"\n'
            "}\n"
            "Use only disadvantages supported by the academic context."
        )

    if question_type == "advantages_disadvantages":
        return (
            "Return ONLY valid JSON.\n"
            "Do not include Markdown formatting in any value.\n"
            "Do not include a title field.\n"
            "Use exactly these fields:\n"
            "{\n"
            '  "introduction": "short introduction",\n'
            '  "advantages": ["advantage 1", "advantage 2"],\n'
            '  "disadvantages": ["disadvantage 1", "disadvantage 2"],\n'
            '  "conclusion": "short conclusion"\n'
            "}\n"
            "Use only information supported by the academic context."
        )

    if question_type == "working":
        return (
            "Return ONLY valid JSON.\n"
            "Do not include Markdown formatting in any value.\n"
            "Do not include a title field.\n"
            "Use exactly these fields:\n"
            "{\n"
            '  "introduction": "short introduction",\n'
            '  "working": ["step 1", "step 2", "step 3"],\n'
            '  "example": "example if supported by the context",\n'
            '  "conclusion": "short conclusion"\n'
            "}\n"
            "Working must be given as ordered steps supported by the context."
        )

    if question_type == "process":
        return (
            "Return ONLY valid JSON.\n"
            "Do not include Markdown formatting in any value.\n"
            "Do not include a title field.\n"
            "Use exactly these fields:\n"
            "{\n"
            '  "introduction": "short introduction",\n'
            '  "steps": ["step 1", "step 2", "step 3"],\n'
            '  "conclusion": "short conclusion"\n'
            "}\n"
            "Use only process information supported by the context."
        )

    if question_type == "types":
        return (
            "Return ONLY valid JSON.\n"
            "Do not include Markdown formatting in any value.\n"
            "Do not include a title field.\n"
            "Use exactly these fields:\n"
            "{\n"
            '  "introduction": "short introduction",\n'
            '  "types": ["type 1 - explanation", "type 2 - explanation"],\n'
            '  "examples": ["example 1", "example 2"],\n'
            '  "conclusion": "short conclusion"\n'
            "}\n"
            "Use only types and examples supported by the context."
        )

    if question_type == "features":
        return (
            "Return ONLY valid JSON.\n"
            "Do not include Markdown formatting in any value.\n"
            "Do not include a title field.\n"
            "Use exactly these fields:\n"
            "{\n"
            '  "introduction": "short introduction",\n'
            '  "features": ["feature 1", "feature 2"],\n'
            '  "conclusion": "short conclusion"\n'
            "}\n"
            "Use only features supported by the context."
        )

    if question_type == "components":
        return (
            "Return ONLY valid JSON.\n"
            "Do not include Markdown formatting in any value.\n"
            "Do not include a title field.\n"
            "Use exactly these fields:\n"
            "{\n"
            '  "introduction": "short introduction",\n'
            '  "components": ["component 1 - explanation", '
            '"component 2 - explanation"],\n'
            '  "conclusion": "short conclusion"\n'
            "}\n"
            "Use only components supported by the context."
        )

    if question_type == "algorithm":
        return (
            "Return ONLY valid JSON.\n"
            "Do not include Markdown formatting in any value.\n"
            "Do not include a title field.\n"
            "Use exactly these fields:\n"
            "{\n"
            '  "introduction": "short introduction",\n'
            '  "algorithm": ["step 1", "step 2", "step 3"],\n'
            '  "example": "example if supported by the context",\n'
            '  "complexity": "complexity if supported by the context",\n'
            '  "conclusion": "short conclusion"\n'
            "}\n"
            "Use only information supported by the academic context."
        )

    if question_type == "programming":
        return (
            "Return ONLY valid JSON.\n"
            "Do not include Markdown formatting in any value.\n"
            "Do not include a title field.\n"
            "Use exactly these fields:\n"
            "{\n"
            '  "approach": "short explanation of approach",\n'
            '  "code": "complete code if supported by the context",\n'
            '  "explanation": "explanation of important code",\n'
            '  "output": "expected output if supported by the context",\n'
            '  "conclusion": "short conclusion"\n'
            "}\n"
            "Do not invent code or output that is not supported by the context."
        )

    return (
        "Return ONLY valid JSON.\n"
        "Do not include Markdown formatting in any value.\n"
        "Do not include a title field.\n"
        "Use exactly these fields:\n"
        "{\n"
        '  "answer": "direct answer",\n'
        '  "key_points": ["point 1", "point 2"],\n'
        '  "conclusion": "short conclusion"\n'
        "}\n"
        "Use only information supported by the academic context."
    )


# =========================================================
# SAFE VALUE CONVERSION
# =========================================================

def _as_list(value: Any) -> list[str]:
    if value is None:
        return []

    if isinstance(value, str):
        text = value.strip()

        if not text:
            return []

        return [text]

    if isinstance(value, list):
        result = []

        for item in value:
            if item is None:
                continue

            if isinstance(item, str):
                text = item.strip()

                if text:
                    result.append(text)
            else:
                result.append(str(item))

        return result

    return [str(value)]


def _as_text(value: Any) -> str:
    if value is None:
        return ""

    if isinstance(value, str):
        return value.strip()

    if isinstance(value, list):
        return " ".join(
            str(item).strip()
            for item in value
            if item is not None
        ).strip()

    return str(value).strip()


# =========================================================
# TITLE CLEANING
# =========================================================

def _clean_title(
    question: str,
    question_type: str,
) -> str:
    """
    Creates a clean title from the user's question.

    The AI is not allowed to control the title.
    This prevents malformed Markdown such as:

    *What is programming language – Definition**

    or:

    **What is programming language – Definition**

    becoming duplicated.
    """

    title = question.strip()

    # Remove question mark at the end.
    title = title.rstrip("?").strip()

    # Remove Markdown formatting.
    title = title.replace("**", "")
    title = title.replace("__", "")
    title = title.replace("*", "")
    title = title.replace("_", "")
    title = title.replace("###", "")
    title = title.replace("##", "")
    title = title.replace("#", "")

    title = title.strip()

    # Remove accidental definition suffix.
    lower_title = title.lower()

    suffixes = [
        " – definition",
        " - definition",
        " — definition",
        ": definition",
    ]

    for suffix in suffixes:
        if lower_title.endswith(suffix):
            title = title[: -len(suffix)].strip()
            break

    if not title:
        title = "Answer"

    return title


# =========================================================
# ANSWER RENDERING
# =========================================================

def render_answer(
    question: str,
    question_type: str,
    data: dict[str, Any],
) -> str:

    if not isinstance(data, dict):
        raise ValueError(
            "AI response must be a JSON object."
        )

    output = []

    # ---------------------------------------------------------
    # TITLE
    # ---------------------------------------------------------
    title = _clean_title(
        question=question,
        question_type=question_type,
    )

    if question_type == "definition":
        output.append(
            f"**{title} – Definition**"
        )
    else:
        output.append(
            f"**{title}**"
        )

    # ---------------------------------------------------------
    # DEFINITION
    # ---------------------------------------------------------
    if question_type == "definition":

        definition = _as_text(
            data.get("definition")
        )

        if definition:
            output.append(definition)

        key_points = _as_list(
            data.get("key_points")
        )

        if key_points:
            output.append("### Key Points")

            for item in key_points:
                output.append(
                    f"- {item}"
                )

        examples = _as_list(
            data.get("examples")
        )

        if examples:
            output.append("### Examples")

            for item in examples:
                output.append(
                    f"- {item}"
                )

        conclusion = _as_text(
            data.get("conclusion")
        )

        if conclusion:
            output.append("### Conclusion")
            output.append(conclusion)

        return "\n\n".join(output)

    # ---------------------------------------------------------
    # EXPLANATION
    # ---------------------------------------------------------
    if question_type == "explanation":

        introduction = _as_text(
            data.get("introduction")
        )

        explanation = _as_text(
            data.get("explanation")
        )

        example = _as_text(
            data.get("example")
        )

        conclusion = _as_text(
            data.get("conclusion")
        )

        if introduction:
            output.append("### Introduction")
            output.append(introduction)

        if explanation:
            output.append("### Explanation")
            output.append(explanation)

        if example:
            output.append("### Example")
            output.append(example)

        if conclusion:
            output.append("### Conclusion")
            output.append(conclusion)

        return "\n\n".join(output)

    # ---------------------------------------------------------
    # COMPARISON
    # ---------------------------------------------------------
    if question_type == "comparison":

        introduction = _as_text(
            data.get("introduction")
        )

        if introduction:
            output.append("### Introduction")
            output.append(introduction)

        comparison = data.get("comparison")

        if isinstance(comparison, list):

            rows = []

            for row in comparison:

                if not isinstance(row, dict):
                    continue

                aspect = _as_text(
                    row.get("aspect")
                )

                first = _as_text(
                    row.get("first")
                )

                second = _as_text(
                    row.get("second")
                )

                if aspect or first or second:
                    rows.append(
                        f"| {aspect} | {first} | {second} |"
                    )

            if rows:
                output.append("### Comparison")
                output.append(
                    "| Aspect | First | Second |"
                )
                output.append(
                    "|---|---|---|"
                )
                output.extend(rows)

        conclusion = _as_text(
            data.get("conclusion")
        )

        if conclusion:
            output.append("### Conclusion")
            output.append(conclusion)

        return "\n\n".join(output)

    # ---------------------------------------------------------
    # ADVANTAGES
    # ---------------------------------------------------------
    if question_type == "advantages":

        introduction = _as_text(
            data.get("introduction")
        )

        if introduction:
            output.append("### Introduction")
            output.append(introduction)

        advantages = _as_list(
            data.get("advantages")
        )

        if advantages:
            output.append("### Advantages")

            for item in advantages:
                output.append(
                    f"- {item}"
                )

        conclusion = _as_text(
            data.get("conclusion")
        )

        if conclusion:
            output.append("### Conclusion")
            output.append(conclusion)

        return "\n\n".join(output)

    # ---------------------------------------------------------
    # DISADVANTAGES
    # ---------------------------------------------------------
    if question_type == "disadvantages":

        introduction = _as_text(
            data.get("introduction")
        )

        if introduction:
            output.append("### Introduction")
            output.append(introduction)

        disadvantages = _as_list(
            data.get("disadvantages")
        )

        if disadvantages:
            output.append("### Disadvantages")

            for item in disadvantages:
                output.append(
                    f"- {item}"
                )

        conclusion = _as_text(
            data.get("conclusion")
        )

        if conclusion:
            output.append("### Conclusion")
            output.append(conclusion)

        return "\n\n".join(output)

    # ---------------------------------------------------------
    # ADVANTAGES + DISADVANTAGES
    # ---------------------------------------------------------
    if question_type == "advantages_disadvantages":

        introduction = _as_text(
            data.get("introduction")
        )

        if introduction:
            output.append("### Introduction")
            output.append(introduction)

        advantages = _as_list(
            data.get("advantages")
        )

        if advantages:
            output.append("### Advantages")

            for item in advantages:
                output.append(
                    f"- {item}"
                )

        disadvantages = _as_list(
            data.get("disadvantages")
        )

        if disadvantages:
            output.append("### Disadvantages")

            for item in disadvantages:
                output.append(
                    f"- {item}"
                )

        conclusion = _as_text(
            data.get("conclusion")
        )

        if conclusion:
            output.append("### Conclusion")
            output.append(conclusion)

        return "\n\n".join(output)

    # ---------------------------------------------------------
    # WORKING
    # ---------------------------------------------------------
    if question_type == "working":

        introduction = _as_text(
            data.get("introduction")
        )

        if introduction:
            output.append("### Introduction")
            output.append(introduction)

        working = _as_list(
            data.get("working")
        )

        if working:
            output.append("### Working")

            for index, item in enumerate(
                working,
                start=1,
            ):
                output.append(
                    f"{index}. {item}"
                )

        example = _as_text(
            data.get("example")
        )

        if example:
            output.append("### Example")
            output.append(example)

        conclusion = _as_text(
            data.get("conclusion")
        )

        if conclusion:
            output.append("### Conclusion")
            output.append(conclusion)

        return "\n\n".join(output)

    # ---------------------------------------------------------
    # PROCESS
    # ---------------------------------------------------------
    if question_type == "process":

        introduction = _as_text(
            data.get("introduction")
        )

        if introduction:
            output.append("### Introduction")
            output.append(introduction)

        steps = _as_list(
            data.get("steps")
        )

        if steps:
            output.append("### Steps")

            for index, item in enumerate(
                steps,
                start=1,
            ):
                output.append(
                    f"{index}. {item}"
                )

        conclusion = _as_text(
            data.get("conclusion")
        )

        if conclusion:
            output.append("### Conclusion")
            output.append(conclusion)

        return "\n\n".join(output)

    # ---------------------------------------------------------
    # TYPES
    # ---------------------------------------------------------
    if question_type == "types":

        introduction = _as_text(
            data.get("introduction")
        )

        if introduction:
            output.append("### Introduction")
            output.append(introduction)

        types = _as_list(
            data.get("types")
        )

        if types:
            output.append("### Types")

            for item in types:
                output.append(
                    f"- {item}"
                )

        examples = _as_list(
            data.get("examples")
        )

        if examples:
            output.append("### Examples")

            for item in examples:
                output.append(
                    f"- {item}"
                )

        conclusion = _as_text(
            data.get("conclusion")
        )

        if conclusion:
            output.append("### Conclusion")
            output.append(conclusion)

        return "\n\n".join(output)

    # ---------------------------------------------------------
    # FEATURES
    # ---------------------------------------------------------
    if question_type == "features":

        introduction = _as_text(
            data.get("introduction")
        )

        if introduction:
            output.append("### Introduction")
            output.append(introduction)

        features = _as_list(
            data.get("features")
        )

        if features:
            output.append("### Features")

            for item in features:
                output.append(
                    f"- {item}"
                )

        conclusion = _as_text(
            data.get("conclusion")
        )

        if conclusion:
            output.append("### Conclusion")
            output.append(conclusion)

        return "\n\n".join(output)

    # ---------------------------------------------------------
    # COMPONENTS
    # ---------------------------------------------------------
    if question_type == "components":

        introduction = _as_text(
            data.get("introduction")
        )

        if introduction:
            output.append("### Introduction")
            output.append(introduction)

        components = _as_list(
            data.get("components")
        )

        if components:
            output.append("### Components")

            for item in components:
                output.append(
                    f"- {item}"
                )

        conclusion = _as_text(
            data.get("conclusion")
        )

        if conclusion:
            output.append("### Conclusion")
            output.append(conclusion)

        return "\n\n".join(output)

    # ---------------------------------------------------------
    # ALGORITHM
    # ---------------------------------------------------------
    if question_type == "algorithm":

        introduction = _as_text(
            data.get("introduction")
        )

        if introduction:
            output.append("### Introduction")
            output.append(introduction)

        algorithm = _as_list(
            data.get("algorithm")
        )

        if algorithm:
            output.append("### Algorithm")

            for index, item in enumerate(
                algorithm,
                start=1,
            ):
                output.append(
                    f"{index}. {item}"
                )

        example = _as_text(
            data.get("example")
        )

        if example:
            output.append("### Example")
            output.append(example)

        complexity = _as_text(
            data.get("complexity")
        )

        if complexity:
            output.append("### Complexity")
            output.append(complexity)

        conclusion = _as_text(
            data.get("conclusion")
        )

        if conclusion:
            output.append("### Conclusion")
            output.append(conclusion)

        return "\n\n".join(output)

    # ---------------------------------------------------------
    # PROGRAMMING
    # ---------------------------------------------------------
    if question_type == "programming":

        approach = _as_text(
            data.get("approach")
        )

        if approach:
            output.append("### Approach")
            output.append(approach)

        code = _as_text(
            data.get("code")
        )

        if code:
            output.append("### Code")
            output.append("```")
            output.append(code)
            output.append("```")

        explanation = _as_text(
            data.get("explanation")
        )

        if explanation:
            output.append("### Explanation")
            output.append(explanation)

        output_text = _as_text(
            data.get("output")
        )

        if output_text:
            output.append("### Output")
            output.append(output_text)

        conclusion = _as_text(
            data.get("conclusion")
        )

        if conclusion:
            output.append("### Conclusion")
            output.append(conclusion)

        return "\n\n".join(output)

    # ---------------------------------------------------------
    # GENERAL
    # ---------------------------------------------------------
    answer = _as_text(
        data.get("answer")
    )

    if answer:
        output.append("### Answer")
        output.append(answer)

    key_points = _as_list(
        data.get("key_points")
    )

    if key_points:
        output.append("### Key Points")

        for item in key_points:
            output.append(
                f"- {item}"
            )

    conclusion = _as_text(
        data.get("conclusion")
    )

    if conclusion:
        output.append("### Conclusion")
        output.append(conclusion)

    return "\n\n".join(output)