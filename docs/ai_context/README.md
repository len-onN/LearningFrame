# LearningFrame AI Context

This directory stores the context from the AI-assisted development of LearningFrame.

It does not replace the primary MVP documentation. Current documentation for
usage, local execution, and development resides at the root of `docs/`.

## 1. How to Use This Directory

Use `docs/ai_context/` whenever you need to understand:
- Why an architectural or product decision was made;
- Which design alternatives were discarded;
- How the codebase architecture evolved;
- The sequence of branches, planning milestones, and phases;
- Prompts that transferred context between chat sessions;
- Which documents were transitional plans rather than current states.

To understand the current state of the MVP, start with:
- [MVP Principles and Standards](../principles-and-standards.md);
- [MVP User Guide](../user-guide.md);
- [Anki/APKG Integration Guide](../anki-apkg-guide.md);
- [Local Execution Guide](../local-execution-guide.md);
- [Post-MVP Professionalization Roadmap](../post-mvp-professionalization-roadmap.md);
- [Logbook](../logbook.md).

## 2. Directory Structure

```txt
docs/ai_context/
  README.md
  timeline.md
  decision-log.md
  test-coverage-status.md
  architecture-and-decisions/
```

### `architecture-and-decisions/`

Architecture, UX specifications, and pre-finalization retrospectives. They document
the engineering rationale and directional changes leading to the current state.

### `timeline.md`

Chronological mapping of repository branches, key artifacts, and development milestones.

### `decision-log.md`

Consolidated record of key architectural, product, and testing decisions.

### `test-coverage-status.md`

Snapshot and tracking of test suite coverage, invariants, and automated verification.

## 3. Recommended Reading Order for Future Sessions

1. Start by reading [MVP Principles and Standards](../principles-and-standards.md).
2. Read the specific guide relevant to the current task:
   - [User Guide](../user-guide.md);
   - [Anki/APKG Guide](../anki-apkg-guide.md);
   - [Local Execution Guide](../local-execution-guide.md);
   - [Post-MVP Roadmap](../post-mvp-professionalization-roadmap.md).
3. Consult the [Timeline](timeline.md) to locate historical branch context.
4. Consult the [Decision Log](decision-log.md) to understand why architectural decisions were adopted.

## 4. Important Caution

Documents in this directory may describe:
- Plans that were subsequently revised;
- Concerns that have since been addressed;
- Discarded approaches;
- Historical tasks that are no longer relevant;
- References to legacy file paths prior to documentation reorganization.

The authoritative source of truth for ongoing implementation is
[MVP Principles and Standards](../principles-and-standards.md).

When conflict arises between an early development plan and the current principles,
adhere to the current principles and consult the decision log for background context.

