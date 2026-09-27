# Zalo Parent Reporting — First Product Plan

## Goal

Give parents a simple, trusted view of their child's classroom progress in Zalo.

The first version answers one question well: **What did my child do and how did they perform today?**

## Product loop

```text
Teacher records a daily result
        ↓
Parent opens the child's result in Zalo
        ↓
Monthly AI report summarizes the recorded daily results
        ↓
After two months of active viewing, ask parents what they want next
```

There is no separate password-based parent account. Zalo is the parent-facing entry point and notification channel.

## Version 1: daily teacher record

At the end of class, a teacher selects each student and records:

- Rating: `Excellent`, `Good`, or `Needs support`
- What the student built
- What the student learned or coded
- Optional short teacher note
- Optional build photo

This should take about 15–30 seconds per student. The teacher's rating is the source of truth. Lesson completion or game activity may later be attached as evidence, but must not automatically decide a student's performance.

## Parent experience in Zalo

1. The school links a parent phone number to a student.
2. The parent opens the school's Zalo Official Account or Mini App and grants the required interaction permission.
3. The system links the verified Zalo identity to that parent-child relationship.
4. A Zalo message says that a daily result is available and opens the child's timeline.
5. The timeline shows daily records first, then monthly reports once available.

Parents may only read records for their own linked child. Teachers may create and amend their class's records. Administrators manage school, class, and parent-child links.

## Monthly AI report

At month end, AI receives only the approved daily records and lesson facts. It creates a short report containing:

- Progress and strengths
- Builds completed
- Concepts and coding skills practised
- One suggested next focus

For the first release, a teacher reviews and publishes the report before it reaches parents. Store the approved report separately from the AI draft so the final parent record remains auditable.

## Data to preserve from day one

Store raw daily records with:

- Student, class, teacher, lesson, and date
- Rating and teacher note
- Build and learning/code summary
- Optional photo reference
- Creation and amendment timestamps

This is enough to add a year-over-year progress view later without redesigning historical data. Year-over-year comparison is **not** a Version 1 screen.

## Two-month learning loop

After a parent has actively viewed results over roughly two months, send one short survey in Zalo:

> What would you like to see more of?

- Build photos and projects
- Learning and coding progress
- Teacher guidance for home
- Something else

Use completed survey responses and parent viewing behaviour to choose the next feature. Do not pre-build leaderboards, chat, automatic grading, or a large analytics dashboard.

## Zalo delivery rules

- Use an official Zalo Official Account / Mini App integration.
- Get parent interaction permission before sending OA messages.
- Use approved Zalo Business Solution (ZBS) templates when sending by phone number or for system notifications.
- Do not use libraries that automate a personal Zalo account; they are not an appropriate foundation for parent records.

Official references:

- [Zalo OA messaging policy](https://oa.zalo.me/home/resources/news/thong-bao-chinh-sach-gui-tin-va-quy-dinh-phi-gui-tin_1433049880779375099)
- [Zalo for Developers](https://developers.zalo.me/)
- [Zalo interaction-permission widget](https://developers.zalo.me/docs/social/zalo-interactive-widget)

## GitHub kickstart recommendation

Use the official [Zalo-MiniApp/zaui-uni](https://github.com/Zalo-MiniApp/zaui-uni) education-oriented Mini App template for the parent view. It is the closest public starting point: TypeScript, Zalo Mini App structure, reusable UI, API service layer, and environment-based backend configuration.

Use it as a **separate parent Mini App**, not as a replacement for this classroom app. The current React classroom stays the teacher experience; the Mini App becomes the parent timeline and monthly-report experience.

Useful reference repositories:

- [Zalo-MiniApp/zaui-uni](https://github.com/Zalo-MiniApp/zaui-uni) — recommended parent Mini App starting point.
- [Zalo-MiniApp/zaui-egovernment](https://github.com/Zalo-MiniApp/zaui-egovernment) — useful example of services, API configuration, and app structure.
- [Zalo-MiniApp/miniapp-vue-template](https://github.com/Zalo-MiniApp/miniapp-vue-template) — official minimal template, but Vue-based and less suitable for this React/TypeScript project.

Avoid third-party `zca-js` / personal-account automation repositories for this product. They do not provide the permissioned, policy-compliant school-to-parent channel required here.

## Build order when implementation starts

1. Create the shared backend data model and teacher/admin access.
2. Add the fast daily-rating screen to the teacher classroom.
3. Set up the Zalo OA, parent consent, and parent-child linking.
4. Build the parent Mini App timeline from the official template.
5. Add notifications for newly published daily records.
6. Add teacher-reviewed monthly AI reports.
7. Trigger the two-month parent survey and decide the next feature from results.

## Decisions to make before implementation

- Is one parent or multiple parents allowed for each student?
- Can a teacher edit a published daily record, and should parents see the correction?
- Who is allowed to upload build photos?
- What is the school's retention and deletion policy for student data and photos?
