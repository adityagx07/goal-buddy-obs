# Goal Stream

Simple OBS Goal Overlay Web App

Build a simple and clean web application for creating customizable goal/progress-bar overlays that can be used in OBS Studio as a Browser Source.

The main purpose is to let a user create a goal like:

Gaming PC
$400 / $1,000
████████░░░░░░░░ 40%

or:

Gaming Chair
$20 / $2,000
█░░░░░░░░░░░░░░░ 1%

The app should focus on being simple, fast, and easy to use.

1. Main Page

Create a single-page dashboard with two sections:

LEFT: Goal Settings

RIGHT: Live Preview

The preview should update immediately whenever the user changes any setting.

2. Goal Settings

Add these basic fields:

Goal Name

Example:

Gaming PC

Current Amount

Example:

400

Target Amount

Example:

1000

Currency

Default:

$

Allow the user to change the currency symbol.

3. Goal Icon

Provide some basic predefined icons/images for common goals:

Gaming PC

Gaming Chair

Camera

Microphone

Gaming Console

Car

Phone

Custom

When the user selects an option, automatically show its icon in the preview.

Also provide:

Upload Custom Image

Allow the user to upload their own PNG/JPG/WebP image.

The uploaded image should replace the default icon.

4. Progress Calculation

Automatically calculate:

Current Amount / Target Amount × 100

Example:

400 / 1000 = 40%

Display:

$400 / $1,000

40%

The progress bar should automatically fill to 40%.

Make sure the progress cannot visually exceed 100%.

5. Simple Customization

Provide only the most useful customization options:

Theme

Create 4 simple themes:

Minimal

Gaming

Neon

Glass

Progress Bar Color

Allow the user to select a color.

Background

Allow:

Transparent

Dark

Light

Text Color

Allow the user to choose a text color.

Size

Provide:

Small

Medium

Large

Do not add too many advanced customization controls.

6. Live Preview

The right side should show exactly how the goal will look in OBS.

Example:

┌──────────────────────────────────────┐
│ │
│ 🖥️ GAMING PC │
│ │
│ $400 / $1,000 40% │
│ │
│ █████████████░░░░░░░░░░░░ │
│ │
└──────────────────────────────────────┘

The preview should update instantly.

7. OBS Overlay

Add a button:

Create OBS Overlay

When clicked, generate a unique overlay URL.

Example:

/overlay/abc123

Create a separate overlay page that displays ONLY the goal.

The overlay page must have:

Transparent background

No navbar

No dashboard

No buttons

No extra text

Only show the goal widget.

8. OBS URL

After creating the overlay, show:

Your OBS Overlay is Ready!

Display the generated URL.

Add:

Copy URL

button.

Also show simple instructions:

Open OBS

Add a Browser Source

Paste the URL

Set the width and height

Click OK

9. Update Goal

Add a simple section below the preview:

Current Amount

[ 400 ]

[ -10 ] [ +10 ]

Changing the amount should immediately update the preview.

The OBS overlay should also update when the amount changes.

If realtime updating is difficult for the first version, implement a simple polling/update mechanism.

10. Goal Completion

When the goal reaches 100%, show:

🎉 Goal Completed!

$1,000 / $1,000

████████████████████

The progress bar should be completely filled.

A simple celebration animation can be included.

11. Simple Design

Use a modern dark interface.

The dashboard should be clean and minimal.

Use:

Rounded cards

Good spacing

Modern typography

Simple icons

Subtle animations

Dark background

Clear buttons

Do not make it overly complicated.

Do not create a large admin dashboard.

The application should feel like a simple creator tool.

12. Technical Requirements

Use:

React

TypeScript

Tailwind CSS

For the first version, keep the data structure simple.

The user should be able to create and preview a goal without creating an account.

Store the current goal locally if possible.

The generated OBS overlay should be accessible through its unique URL.

13. Important

Focus on these features first:

Create goal

Set current amount

Set target amount

Automatically calculate percentage

Select icon

Upload custom image

Choose simple theme

Live preview

Generate OBS overlay URL

Copy OBS URL

Use overlay in OBS

Update goal amount

Do NOT add:

Payments

Subscriptions

Complex user accounts

Analytics

Multiple dashboards

Advanced permissions

Complicated database architecture

Social features

Donation integrations

Keep the first version simple and functional.

The goal is to create a clean MVP that I can immediately test inside OBS Studio.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://goal-buddy-obs.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/af1600a1-68f7-4544-89a9-d4697dbf353d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
